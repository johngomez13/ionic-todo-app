# Ionic ToDo con categorías

Aplicación de lista de tareas construida con Ionic y Angular, con categorización, filtrado, almacenamiento local, feature flag mediante Firebase Remote Config y empaquetado para Android e iOS con Cordova.

## Stack

|                 | Versión                        |
| --------------- | ------------------------------ |
| Angular         | 20.3.25 (standalone, zoneless) |
| Ionic Framework | 8.8.17                         |
| @ngrx/signals   | 20.1.0                         |
| TypeScript      | 5.9                            |
| Node            | >= 22.22.3                     |

## Requisitos previos

- Node.js 22.22.3 o superior (el CLI de Angular 20 acepta `^22.22.3 || ^24.15.0 || >=26`)
- pnpm 10 o superior

Para compilar a nativo se documentan aparte los requisitos de Cordova (JDK, Android SDK, Xcode).

## Instalación

```bash
git clone https://github.com/johngomez13/ionic-todo-app.git
cd ionic-todo-app
pnpm install
```

## Ejecución

```bash
npm start          # servidor de desarrollo en http://localhost:4200
npm run build:prod # build de producción en www/
```

## Scripts

| Comando               | Descripción                                                  |
| --------------------- | ------------------------------------------------------------ |
| `pnpm start`       | Servidor de desarrollo                                       |
| `pnpm build:prod`  | Build de producción                                          |
| `pnpm build:stats` | Build de producción con `stats.json` para analizar el bundle |
| `pnpm test`        | Tests unitarios headless con cobertura                       |
| `pnpm test:watch`  | Tests en modo watch                                          |
| `pnpm lint`        | ESLint                                                       |
| `pnpm lint:fix`    | ESLint con autofix                                           |
| `pnpm format`      | Prettier sobre `src/`                                        |

## Arquitectura

El código se organiza en capas con dependencias en un solo sentido: una capa solo importa
de las capas anteriores, nunca de las posteriores.

```
src/app/
  core/            Tokens de inyección, constantes
  domain/          Modelos e interfaces de repositorio (sin dependencias de framework)
  application/     Store reactivo, providers de inyección de dependencias
  infrastructure/  Implementaciones concretas de los repositorios y mappers
  shared/          Componentes y utilidades reutilizables
  ui/              Pantallas
```

Cada capa tiene un path alias (`@core/*`, `@domain/*`, `@application/*`, `@infrastructure/*`,
`@shared/*`, `@ui/*`, `@env/*`) para que los imports expresen la dependencia entre capas y no
rutas relativas.

### Detección de cambios sin zone.js

La aplicación arranca con `provideZonelessChangeDetection()`.
No hay `zone.js` en el bundle, la detección de cambios la disparan las signals.

## Convenciones

- Formato y reglas de estilo se aplican automáticamente en cada commit mediante Husky y lint-staged.

## Tests

```bash
pnpm test
```

Los tests corren en un navegador Chromium headless. En máquinas sin Chrome instalado,
`karma.conf.js` detecta Microsoft Edge y lo usa a través del launcher `EdgeHeadlessCI`.

## Licencia

MIT. Ver [LICENSE](LICENSE).
