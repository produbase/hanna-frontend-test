# Hanna | Tienda online

Prueba técnica de frontend: catálogo de dispositivos, detalle y carrito mediante la API de ITX. Aplicación SPA en React y JavaScript, sin SSR.

[![Quality](https://github.com/produbase/hanna-frontend-test/actions/workflows/ci.yml/badge.svg)](https://github.com/produbase/hanna-frontend-test/actions/workflows/ci.yml)

## Ejecutar

Requisitos: Node.js 24.15 o superior de la rama 24 (validado con 24.22.1; versión fijada en `.nvmrc`) y pnpm 11.25.0 (`npm install --global pnpm@11.25.0`). También son compatibles Node 22.22.2 y Node 26 o superior, según `engines` de `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm start
```

Abrir http://localhost:5173. No requiere claves ni backend propio.

En este entorno de Codex también se puede ejecutar `./scripts/start-local.sh`, que detecta el runtime incluido si Node no está en el PATH.

```sh
pnpm build        # salida estática en dist/
pnpm preview      # previsualizar producción
pnpm test         # pruebas unitarias y de integración
pnpm lint         # análisis estático
pnpm test:e2e     # navegador, API simulada determinista
pnpm test:coverage # cobertura de las pruebas unitarias e integración
pnpm format:check # formato del código
```

Configuración opcional: copiar `.env.example` a `.env` y ajustar `VITE_API_URL`. La URL pública del enunciado es el valor por defecto. Para publicar `dist/`, configurar el servidor estático para devolver `index.html` en rutas desconocidas (SPA fallback).

Las pruebas E2E locales utilizan Google Chrome instalado. En CI se instala Chromium automáticamente; el proyecto móvil emula un viewport y eventos táctiles sobre Chromium, sin afirmar compatibilidad con Safari. Para una comprobación voluntaria contra el servicio real, arrancar la aplicación y ejecutar `node scripts/verify-live.mjs`: realiza una petición real de alta en el carrito.

## Decisiones principales

Se usa el modo declarativo de React Router con actualizaciones síncronas porque los parámetros de búsqueda controlan el input. La búsqueda se guarda en la URL sin generar una entrada de historial por carácter. La capa de API valida el contrato mínimo y normaliza las erratas del servicio. La caché de GET usa memoria y localStorage con TTL de una hora y comparte peticiones en curso. El carrito persiste exclusivamente el contador confirmado por el POST.

No hay backend propio ni checkout: la bolsa muestra el contador requerido por la prueba. La moneda EUR es una decisión de presentación porque la API entrega precios sin moneda. Los precios vacíos se presentan como no disponibles.

Guías oficiales de referencia: [Vite](https://vite.dev/guide/), [React Router declarativo](https://reactrouter.com/start/declarative/installation) y [Vitest](https://vitest.dev/guide/).

## Alcance

- Catálogo completo, máximo cuatro columnas y búsqueda inmediata por marca y modelo.
- Ficha con especificaciones, selectores de color y capacidad, y alta en carrito.
- Contador persistente con el valor devuelto por el servidor.
- Caché cliente de catálogo y detalles durante una hora.
- Estados de carga, error, catálogo vacío y ruta desconocida; navegación por teclado y diseño responsive.

## Entrega

La memoria de arquitectura, decisiones y guía de defensa se encuentra en `docs/memoria-tecnica.md` y en el documento Word de `output/doc/`. Las pruebas de navegador y sus capturas se documentan allí.

Repositorio público: [produbase/hanna-frontend-test](https://github.com/produbase/hanna-frontend-test). La publicación se realiza con subidas separadas por hitos, conservando los commits originales y sus etiquetas.

La [checklist de entrega](docs/entrega.md) recoge cada requisito, su evidencia y los cuatro hitos iniciales con sus commits y etiquetas. El README está incluido desde el primer commit. El historial público conserva todos los commits, sin squash, y sus etiquetas están disponibles en [GitHub](https://github.com/produbase/hanna-frontend-test/tags). La entrega inicial se identifica con la etiqueta `entrega-final`.

La [revisión de calidad](docs/revision-final.md), posterior a esa entrega inicial, se identifica con `hito-05-revision-calidad`: 35 pruebas unitarias e integración, 20 de navegador contra el build de producción, siete resoluciones comprobadas y validación adicional con la API real.

## Uso de IA

Se ha utilizado IA para apoyar la implementación, las pruebas y la documentación. Las decisiones técnicas y la evidencia de validación se describen en la memoria y en la revisión de calidad.
