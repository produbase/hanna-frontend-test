# ATELIER MOBILE

Prueba técnica de frontend: catálogo de dispositivos, detalle y carrito mediante la API de ITX. Aplicación SPA en React y JavaScript, sin SSR.

## Ejecutar

Requisitos: Node.js 22.12 o superior y pnpm 10 (`corepack enable`).

```sh
pnpm install --frozen-lockfile
pnpm start
```

Abrir http://localhost:5173. No requiere claves ni backend propio.

```sh
pnpm build        # salida estática en dist/
pnpm preview      # previsualizar producción
pnpm test         # pruebas unitarias y de integración
pnpm lint         # análisis estático
pnpm test:e2e     # navegador, API simulada determinista
```

Configuración opcional: copiar `.env.example` a `.env` y ajustar `VITE_API_URL`. La URL pública del enunciado es el valor por defecto. Para publicar `dist/`, configurar el servidor estático para devolver `index.html` en rutas desconocidas (SPA fallback).

## Alcance

- Catálogo completo, máximo cuatro columnas y búsqueda inmediata por marca y modelo.
- Ficha con especificaciones, selectores de color y capacidad, y alta en carrito.
- Contador persistente con el valor devuelto por el servidor.
- Caché cliente de catálogo y detalles durante una hora.
- Estados de carga, error, catálogo vacío y ruta desconocida; navegación por teclado y diseño responsive.

## Entrega

La memoria de arquitectura, decisiones y guía de defensa se encuentra en `docs/memoria-tecnica.md` y en el documento Word de `output/doc/`. Las pruebas de navegador y sus capturas se documentan allí.

Repositorio preparado localmente con commits por hitos. La publicación en un repositorio público requiere configurar el destino Git del candidato.

## Uso de IA

Implementación y documentación elaboradas con asistencia de IA, autorizada por el candidato según la información facilitada. Antes de presentar la prueba, revisar el código y poder explicar sus decisiones y límites. No se atribuyen al candidato revisiones que todavía no haya realizado.
