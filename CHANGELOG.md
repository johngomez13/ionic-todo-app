# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto se adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [No publicado]

### Añadido

- Configuración base del proyecto: Ionic 8 con Angular 20 standalone.
- Estructura por capas (`core`, `domain`, `application`, `infrastructure`, `shared`, `ui`)
  con path aliases por capa.
- ESLint 9 con configuración plana, Prettier, y Husky con lint-staged en `pre-commit`.
- Arranque sin `zone.js` mediante `provideZonelessChangeDetection()`, con test que verifica
  el renderizado de los web components de Ionic en un navegador real.
- Launcher `EdgeHeadlessCI` en Karma para ejecutar los tests en máquinas sin Chrome.

### Eliminado

- Integración de Capacitor incluida por defecto en la plantilla de Ionic; el runtime nativo
  de este proyecto es Cordova.
- `zone.js`, `polyfills.ts` y `zone-flags.ts`.
