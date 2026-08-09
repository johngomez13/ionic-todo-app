# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto se adhiere a [Versionado Semántico](https://semver.org/lang/es/).

El historial se compone en dos ramas: `main` contiene la aplicación base (una lista
de tareas con almacenamiento local) y `feature/task-categories` contiene los cambios
solicitados por la prueba.

## [No publicado] — rama `feature/task-categories`

### Añadido

- Categorías: crear, renombrar y eliminar, con color elegible de una paleta fija.
- Nombre de categoría único.
- Asignación de categoría a cada tarea, tanto al crearla como después.
- Filtrado de tareas por categoría.
- Contador de tareas pendientes por categoría.
- Barra de pestañas inferior para alternar entre Tareas y Categorías.
- Sección de tareas completadas al final de la lista.
- Botón flotante que revela el formulario.

### Añadido en el estado reactivo

- Estado reactivo con `SignalStore` de `@ngrx/signals`. El estado guarda únicamente
  las tareas y el filtro activo; la lista visible, el contador de pendientes y la
  condición de lista vacía se derivan con `computed` y no se almacenan.
- Filtro por estado de la tarea: todas, pendientes y completadas.
- Contador de tareas pendientes en la cabecera, con plural correcto.
- Mensajes de lista vacía diferenciados: no es lo mismo no tener tareas que tenerlas
  todas ocultas por el filtro activo.
- Helpers puros de dominio `filterTasksByStatus` y `countPending`, que reciben listas
  y devuelven listas sin conocer el store, con pruebas que no requieren `TestBed`.
- Capa de dominio: modelo `Task` con campos de solo lectura, y las funciones
  `createTask`, `toggleCompletion` y `normalizeTitle`.
- Contrato `TaskRepository` en el dominio e implementación `TaskStorageService`
  sobre `localStorage` en infraestructura.
- Token de inyección tipado `TASK_REPOSITORY` con su función `provideTaskRepository()`.
- Modelo de vista `TaskView`, que añade a la tarea los textos derivados que necesita
  la plantilla.
- Constante centralizada `TASKS_STORAGE_KEY`.

### Cambiado

- La página de tareas deja de contener lógica de negocio, de almacenamiento y de
  cálculo: pasa a leer del store y a delegar cada operación.
- La plantilla no calcula nada. Las condiciones y las etiquetas de accesibilidad
  llegan resueltas como estado derivado.
- Las pruebas de la página y del store inyectan un repositorio en memoria y ya no
  tocan `localStorage`; la persistencia real se prueba de forma aislada.

## [0.1.0] — rama `main` — Aplicación base

### Añadido

- Lista de tareas con alta, marcado como completada y eliminación.
- Persistencia en `localStorage`, expresada como efecto derivado de la lista en lugar
  de repetirse en cada operación.
- Lectura tolerante a datos corruptos: ante un JSON inválido se arranca con la lista
  vacía en lugar de impedir el arranque de la aplicación.
- Configuración base del proyecto: Ionic 8 con Angular 20 standalone.
- Estructura por capas (`core`, `domain`, `application`, `infrastructure`, `shared`,
  `ui`) con path aliases por capa.
- ESLint 9 con configuración plana, Prettier, y Husky con lint-staged en `pre-commit`.
- Arranque sin `zone.js` mediante `provideZonelessChangeDetection()`, con test que
  verifica el renderizado de los web components de Ionic en un navegador real.
- Launcher `EdgeHeadlessCI` en Karma para ejecutar los tests en máquinas sin Chrome.

### Eliminado

- Integración de Capacitor incluida por defecto en la plantilla de Ionic; el runtime
  nativo de este proyecto es Cordova.
- `zone.js`, `polyfills.ts` y `zone-flags.ts`.
