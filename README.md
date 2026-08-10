# Tareas — Ionic ToDo con categorías

Lista de tareas con **categorías**, construida sobre Ionic y Angular, empaquetada a Android e iOS
con Cordova y con la funcionalidad de categorías gobernada por una **bandera remota** de Firebase
Remote Config.

| **Android** | APK firmado, 4,6 MB, instalable |
| **iOS** | IPA generado en CI (sin firmar, ver [iOS](#ios)) |
| **Bandera remota** | `ff_categories_enabled` |
| **Tests** | 105, todos en verde |

## Índice

- [Qué hace](#qué-hace)
- [Stack](#stack)
- [Puesta en marcha](#puesta-en-marcha)
- [Scripts](#scripts)
- [Arquitectura](#arquitectura)
- [Bandera de funcionalidad](#bandera-de-funcionalidad)
- [Compilación nativa](#compilación-nativa)
- [Rendimiento](#rendimiento)
- [Tests](#tests)
- [Ramas](#ramas)

## Qué hace

- Crear, completar y eliminar tareas.
- Crear, renombrar y eliminar **categorías**, cada una con color.
- Asignar una categoría a una tarea y **filtrar** por ella.
- Persistencia local: al recargar, todo sigue ahí.
- Con la bandera apagada, la aplicación **degrada a una lista de tareas simple** sin perder datos.

Las tareas completadas no se ocultan tras un filtro: se apartan a una sección plegable al final de
la lista, con su propio conteo.


## Stack

| | Versión |
| --- | --- |
| Angular | 20.3.25 — standalone, **zoneless**, `OnPush` |
| Ionic Framework | 8.8.17 |
| @ngrx/signals | 20.1.0 |
| @angular/cdk | 20.2.14 — desplazamiento virtual |
| Firebase | 12.17.1 |
| Cordova | android 15.1.0 · ios 8.1.1 |
| TypeScript | 5.9, `strict` |
| Node | >= 22.22.3 |
| pnpm | 10.33.4 |

## Puesta en marcha

```bash
git clone https://github.com/johngomez13/ionic-todo-app.git
cd ionic-todo-app
pnpm install
pnpm start          # http://localhost:4200
```

> **pnpm es obligatorio.** El proyecto declara `packageManager` y `.npmrc` fija
> `node-linker=hoisted`, que Cordova necesita para encontrar los paquetes. Instalar con npm
> produce un árbol distinto y las compilaciones nativas fallan.

**No hace falta configurar Firebase para ejecutar el proyecto.** Sin credenciales, la aplicación usa
valores por defecto y las categorías quedan activas.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `pnpm start` | Servidor de desarrollo |
| `pnpm build:prod` | Build de producción en `www/` |
| `pnpm build:stats` | Build con `stats.json` para analizar el bundle |
| `pnpm preview` | Build de producción **y** lo sirve en `:4173` |
| `pnpm build:android` | Build de producción y APK de *release* |
| `pnpm test` | 105 tests headless con cobertura |
| `pnpm test:watch` | Tests en modo watch |
| `pnpm lint` / `lint:fix` | ESLint |
| `pnpm format` / `format:check` | Prettier sobre `src/` |

## Arquitectura

Cinco capas, con las **dependencias apuntando siempre hacia dentro**: `ui` puede usar `domain`,
pero `domain` no sabe que `ui` existe.

```
src/app/
├── core/             constantes transversales
├── domain/           EL CORAZÓN — sin una sola importación de Angular
│   ├── models/         Task, Category, FeatureFlags  (todo readonly)
│   ├── repositories/   contratos: qué se necesita, no cómo se hace
│   └── services/       reglas puras: filtros, duplicados, huérfanas
├── infrastructure/   el «cómo»: localStorage, Remote Config web y nativo
├── application/      providers de inyección, servicio de banderas
└── ui/todo/
    ├── view/           contenedor con pestañas
    ├── state/          el almacén, partido por responsabilidad
    │   ├── todo.state.ts        forma de los datos
    │   ├── todo-methods.ts      acciones
    │   ├── computed/            derivados
    │   ├── effects/             carga y persistencia
    │   └── store/todo.store.ts  19 líneas: solo compone
    ├── tasks/          pantalla de tareas
    ├── categories/     pantalla de categorías
    └── shared/         modelos de vista, helpers y colores comunes a ambas
```

Cada capa tiene un alias (`@core/*`, `@domain/*`, `@application/*`, `@infrastructure/*`, `@ui/*`,
`@env/*`) para que los imports expresen la dependencia y no rutas relativas.

### Inversión de dependencias

El dominio **declara qué necesita**; la infraestructura se adapta. Se unen con un token tipado:

```ts
// domain/repositories/task.repository.ts
export interface TaskRepository {
  load(): Task[];
  save(tasks: readonly Task[]): void;
}

// application/providers/task.provider.ts
export const TASK_REPOSITORY = new InjectionToken<TaskRepository>('TASK_REPOSITORY');
export function provideTaskRepository(): Provider {
  return { provide: TASK_REPOSITORY, useClass: TaskStorageService };
}
```

El almacén pide `inject(TASK_REPOSITORY)` y no sabe si detrás hay `localStorage`, una API o un doble
de pruebas. Cambiar la persistencia es escribir una clase y tocar **una línea**.

### Un solo almacén, y por qué

Tareas y categorías comparten datos. Al borrar una categoría, sus tareas deben quedar sin
categoría: con un almacén es **una operación atómica**, con dos habría un instante en el que las
tareas apuntan a algo que ya no existe.

```ts
patchState(store, (state) => ({
  categories: state.categories.filter((category) => category.id !== id),
  tasks: detachCategory(state.tasks, id),   // ← la regla vive en domain/
}));
```

### Sin zone.js

La aplicación arranca con `provideZonelessChangeDetection()`. No hay `zone.js` en el bundle y la
detección de cambios la disparan las signals. De ahí sale que **todo el modelo de dominio sea
inmutable**: una signal compara referencias, así que mutar un objeto en sitio no repintaría.

## Bandera de funcionalidad

El parámetro `ff_categories_enabled` de Firebase Remote Config decide, **en tiempo de ejecución**,
si las categorías están activas. Apagarlo oculta los chips de filtro, la pestaña de categorías y el
botón de asignar. **No borra nada**: al volver a encenderlo, todo reaparece intacto.

Hay **tres implementaciones** del mismo contrato, porque el SDK web de Firebase espera un origen
`https://` y dentro de una WebView de Cordova el origen es `file://`:

| Implementación | Cuándo se usa |
| --- | --- |
| `RemoteConfigWebService` | Navegador — SDK web, cargado con `import()` dinámico |
| `RemoteConfigNativeService` | APK / IPA — `cordova-plugin-firebasex` |
| `DefaultFeatureFlagService` | Sin credenciales — valores por defecto |

La selección ocurre en el arranque, en `application/providers/feature-flag.provider.ts`.

### Probarla

1. Consola de Firebase → **Remote Config** → `ff_categories_enabled` → `false` → *Publicar*.
2. Recargar la aplicación.

### Configuración

`src/environments/environment.ts` contiene el `firebaseConfig` y `google-services.json` está en la
raíz porque `cordova-android` lo necesita para compilar. **Son claves de cliente, públicas por
diseño** —viajan en cada petición desde el dispositivo—. Lo que nunca se versiona es la clave
privada de cuenta de servicio.

## Compilación nativa

`platforms/` y `plugins/` **no se versionan**: son artefactos derivados de `config.xml`. Si algo
queda inconsistente, la solución es regenerar, no reparar:

```bash
cordova platform rm android && cordova platform add android
```

### Android

**Requisitos:** JDK 21 (Temurin), Android SDK 36, Gradle 8.14.2.

```bash
pnpm build:android
# → platforms/android/app/build/outputs/apk/release/app-release.apk
```

Para firmar, copia la plantilla y rellénala con tus datos:

```bash
cp build.example.json build.json
```

`build.json` y el `.keystore` **están fuera de control de versiones**: contienen la identidad de
publicación. `build.json` también declara `"packageType": "apk"`, porque sin eso Gradle produce un
AAB, que no se instala directamente en un teléfono.

### iOS

No requiere Mac: el flujo `.github/workflows/ios-build.yml` compila en un ejecutor `macos-latest` y
publica el IPA como artefacto de la ejecución.

> **El IPA no está firmado** y por tanto **no se instala en un iPhone**. Firmar exige una cuenta de
> desarrollador de pago. El flujo demuestra que la cadena de compilación de iOS funciona de
> principio a fin; con una cuenta configurada se añaden los secretos y el mismo flujo produce un IPA
> instalable sin cambiar nada más.

El `deployment-target` está fijado a **15.0** porque `cordova-plugin-firebasex` lo exige y
`cordova-ios` deriva de él la versión de macCatalyst.

## Rendimiento

### Cómo medir

```bash
pnpm preview   # producción en :4173

```

### Cómo reproducir el caso de muchas tareas

La aplicación arranca vacía. Para sembrar 5.000 tareas, desde la consola del navegador:

```js
localStorage.setItem('todo.tasks', JSON.stringify(
  Array.from({ length: 5000 }, (_, i) => ({
    id: `seed-${i}`, title: `Tarea de prueba ${i + 1}`,
    completed: i % 7 === 0, categoryId: null,
  })),
));
location.reload();
```

### Resultados

| Técnica | Antes | Después |
| --- | --- | --- |
| Desplazamiento virtual (DOM con 5.000 tareas) | 5,9 MB | **32 KB** |
| Firebase con `import()` dinámico | — | **+2,17 kB** al bundle |
| `ion-select` → `ion-radio-group` | 869,98 kB | **746,53 kB** |
| Solo los sub-plugins de Firebase usados | APK 19 MB | **APK 4,6 MB** |

Además, desde el inicio: zoneless, `OnPush`, carga perezosa por ruta, importaciones granulares de
Ionic, índice `Map` para el cruce tarea↔categoría y **nada derivado guardado en el estado**.

## Tests

```bash
pnpm test
```

105 tests en Chromium headless; en máquinas sin Chrome, `karma.conf.js` detecta Microsoft Edge.

Las reglas de negocio se prueban **sin `TestBed`**, con arrays y cadenas, porque `domain/` no
depende de Angular. Los tests de componente sí necesitan `provideZonelessChangeDetection()`
explícito, al no haber `zone.js`.

## Ramas

| Rama | Contenido |
| --- | --- |
| `main` | Aplicación base **plana**: tareas sin categorías, sin capas |
| `feature/task-categories` | Todo el trabajo: arquitectura, categorías, nativo, bandera, rendimiento |

El *diff* entre ambas es exactamente el aporte.

## Capturas

En [`docs/screenshots/`](docs/screenshots): lista con categorías, gestión de categorías, el caso de
5.000 tareas y el estado con la bandera apagada.

## Licencia

MIT. Ver [LICENSE](LICENSE).
