# Checklist de entrega de Hanna

Esta lista contrasta la entrega con el PDF facilitado. Distingue los requisitos de la aplicación de las condiciones de presentación. El repositorio público de entrega es [produbase/hanna-frontend-test](https://github.com/produbase/hanna-frontend-test); las subidas conservan el historial original.

## Presentación e historial

| Petición del enunciado                                                        | Estado y evidencia                                                                                                                                                         |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Presentar el proyecto en un repositorio público de GitHub, GitLab o Bitbucket | Cumplido: [repositorio público](https://github.com/produbase/hanna-frontend-test), configurado como `origin`.                                                              |
| Permitir una evolución del código por hitos                                   | Cumplido: cuatro subidas separadas, verificando el commit remoto tras cada paso, seguidas de la revisión final. El PDF no fija número, nombres ni frecuencia de los hitos. |
| Incluir un README, preferiblemente desde el primer commit                     | Cumplido: `README.md` está en el commit raíz `cb50258`.                                                                                                                    |
| Explicar cómo ejecutar y añadir notas útiles                                  | Cumplido en `README.md`: requisitos, instalación, comandos, variables, hosting y decisiones.                                                                               |
| Disponer de scripts START, BUILD, TEST y LINT                                 | Cumplido con los nombres convencionales `start`, `build`, `test` y `lint` en `package.json`.                                                                               |

### Hitos reales preparados

| Hito | Commit    | Etiqueta                | Contenido                                                                                     |
| ---- | --------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| 1    | `cb50258` | `hito-01-readme`        | README inicial, alcance, exclusiones y configuración de ejemplo.                              |
| 2    | `a910b52` | `hito-02-aplicacion`    | Catálogo, detalle, carrito, caché e integración de API; primeras pruebas.                     |
| 3    | `404fab8` | `hito-03-calidad`       | E2E, accesibilidad, persistencia, ajustes de interacción, nombre Hanna y configuración de CI. |
| 4    | `c18c07b` | `hito-04-documentacion` | Memoria técnica, instrucciones finales y evidencias de validación.                            |

Los commits posteriores mantienen esta checklist. El primer hito es documental y no ejecuta una aplicación; las instrucciones del README inicial describen el objetivo de la entrega. Los hitos de implementación y calidad contienen la aplicación ejecutable.

La revisión posterior de calidad se añade como un nuevo commit con la etiqueta `hito-05-revision-calidad`. Su [informe](revision-final.md) recoge los ajustes y las comprobaciones ampliadas; los hitos originales conservan sus commits y etiquetas.

Para inspeccionar el historial:

```sh
git log --oneline --reverse
git show cb50258:README.md
git tag --list 'hito-*'
```

## Tecnología y alcance

| Petición del enunciado                                | Implementación                                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| React o Preact                                        | React, en `src/main.jsx` y `src/App.jsx`.                                                                              |
| JavaScript ES6, preferiblemente sin TypeScript        | Código de aplicación en JavaScript y JSX.                                                                              |
| SPA con enrutado en cliente, sin MPA ni SSR           | BrowserRouter y dos rutas funcionales: `/` y `/products/:id`. El tratamiento de URL desconocida es un estado de error. |
| Diseño libre respetando la estructura de las capturas | Catálogo con cabecera y búsqueda; detalle con imagen y bloque de información y acciones en dos columnas de escritorio. |
| Solo listado y detalle                                | No se añade una vista de checkout ni de carrito.                                                                       |
| Nombre de la aplicación                               | El PDF no impone uno. Hanna es una elección de presentación.                                                           |

## Funcionalidad

| Requisito                                                                                                      | Implementación y comprobación                                                                                                            |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Mostrar todos los productos de la API                                                                          | `CatalogPage.jsx`; se comprobaron los 100 productos recibidos del servicio real.                                                         |
| Búsqueda en tiempo real por marca y modelo                                                                     | `filterProducts` y búsqueda controlada; pruebas unitarias, de integración y escritura carácter a carácter en navegador.                  |
| Máximo cuatro elementos por fila y diseño adaptativo                                                           | CSS Grid de cuatro, tres o dos columnas; comprobaciones de escritorio y móvil sin desbordamiento.                                        |
| Navegar del listado a la ficha y volver                                                                        | Enlaces de React Router y enlace de retorno; probado en integración y E2E.                                                               |
| Tarjetas con imagen, marca, modelo y precio                                                                    | `CatalogPage.jsx`, `ProductImage.jsx` y `formatPrice`.                                                                                   |
| Ficha con marca, modelo, precio, CPU, RAM, sistema operativo, resolución, batería, cámaras, dimensiones y peso | `ProductPage.jsx` y adaptador de datos en `model.js`.                                                                                    |
| Título o icono enlazado al listado                                                                             | Enlace de marca en `Layout.jsx`.                                                                                                         |
| Breadcrumbs y contador del carrito a la derecha                                                                | Cabecera compartida en `Layout.jsx`.                                                                                                     |
| Selectores de color y almacenamiento siempre visibles                                                          | `ProductActions.jsx`, incluidos productos con opción única y casos sin opciones.                                                         |
| Preseleccionar automáticamente cuando solo hay una opción                                                      | Cubierto en integración y en el recorrido de navegador con opciones únicas.                                                              |
| Añadir mediante id, colorCode y storageCode                                                                    | `api.addToCart`, comprobando el cuerpo exacto del POST en tests.                                                                         |
| Mostrar el count devuelto y persistirlo en todas las vistas                                                    | `CartProvider`; comprobaciones de navegación, remontaje y recarga.                                                                       |
| Usar GET /api/product, GET /api/product/:id y POST /api/cart                                                   | `src/lib/api.js`; comprobación real adicional mediante `scripts/verify-live.mjs`.                                                        |
| Cachear las lecturas en cliente durante una hora y revalidar tras caducar                                      | `src/lib/cache.js`: memoria y localStorage, TTL de 3 600 000 ms y revalidación en el siguiente acceso; pruebas unitarias y de navegador. |

## Publicación y revisión final

Se ha creado el repositorio público y se han publicado los cuatro hitos en orden, mediante actualizaciones sucesivas de `main`. Cada subida incluyó la etiqueta correspondiente y se verificó con `git ls-remote` que el servidor apuntaba al commit esperado. La revisión final agrupa la checklist y la actualización de la documentación, identificada mediante `entrega-final`.

- [Código y README](https://github.com/produbase/hanna-frontend-test).
- [Historial público](https://github.com/produbase/hanna-frontend-test/commits/main/).
- [Etiquetas de los hitos](https://github.com/produbase/hanna-frontend-test/tags).
- [Ejecuciones de CI](https://github.com/produbase/hanna-frontend-test/actions).

Las fechas de los commits corresponden al desarrollo local. Las subidas se realizan posteriormente, sin alterar esas fechas ni reconstruir el historial. El enunciado no exige simular una cadencia de trabajo ni una duración mínima entre subidas.

Para revisar la entrega desde cero, clonar el repositorio, instalar con `pnpm install --frozen-lockfile` y ejecutar `pnpm start`, `pnpm build`, `pnpm test` y `pnpm lint`. Las pruebas E2E y el formato se comprueban adicionalmente en CI. El README sigue presente en el primer commit público.

El enunciado no exige desplegar una web pública, usar GitHub específicamente, crear un backend propio, incorporar CI, aportar una memoria Word ni alcanzar un porcentaje concreto de cobertura. La CI y la memoria son complementos de esta entrega.

La carpeta independiente `backendDevTest/`, presente en el espacio de trabajo, no forma parte de los archivos versionados de esta solución frontend y no se ha incorporado a sus commits.
