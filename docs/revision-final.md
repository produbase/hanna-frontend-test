# Revisión final de Hanna

Fecha: 10 de noviembre de 2026. Revisión de calidad posterior a la entrega inicial `181f497`, identificada mediante la etiqueta `hito-05-revision-calidad`.

## Conclusión

La aplicación cumple los requisitos funcionales y de presentación identificados en el PDF. La revisión ha encontrado y corregido el mínimo de Node declarado, ha acotado el análisis estático a los archivos del frontend y ha reforzado la validación del precio y de la identidad de la ficha. Las comprobaciones de la versión de producción han pasado.

Esta es una valoración técnica del entregable. La decisión del evaluador y la defensa de las decisiones de arquitectura durante la entrevista siguen siendo determinantes.

## Contraste con el enunciado

| Área solicitada                             | Resultado                                                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| React o Preact y preferencia por JavaScript | React y JavaScript con JSX, sin TypeScript en la aplicación.                                                                   |
| SPA y enrutado cliente sin SSR              | Dos vistas funcionales; catálogo y ficha, con acceso directo y retorno.                                                        |
| Catálogo completo y máximo cuatro columnas  | 100 productos recibidos en la comprobación real; Grid adaptativo con cuatro columnas como máximo.                              |
| Filtrado inmediato por marca y modelo       | Búsqueda por cada cambio del input, incluyendo escritura rápida, mayúsculas, espacios y acentos.                               |
| Atributos mínimos de la ficha               | Imagen, marca, modelo, precio, CPU, RAM, sistema operativo, resolución, batería, cámaras, dimensiones y peso.                  |
| Color y almacenamiento visibles             | Selección explícita con varias opciones, selección automática con una única opción y estado deshabilitado si faltan opciones.  |
| Envío de id y códigos al carrito            | Se comprueba el cuerpo exacto del POST y el tipo numérico de los códigos.                                                      |
| Contador global y persistencia              | Se usa el count confirmado por el servicio, visible entre vistas y tras recargar.                                              |
| Caché cliente de una hora                   | Catálogo y fichas: persistencia, reutilización y revalidación después de caducar.                                              |
| Cabecera, breadcrumbs y enlaces             | Marca enlazada al catálogo, ruta actual, contador y enlace de retorno.                                                         |
| START, BUILD, TEST y LINT                   | Scripts presentes y ejecutados; nombres convencionales en minúsculas.                                                          |
| README y repositorio público por hitos      | README desde el commit raíz y cuatro hitos iniciales publicados con sus etiquetas; revisión de calidad añadida posteriormente. |

La matriz detallada y las referencias a los componentes se encuentran en [entrega.md](entrega.md).

## Ajustes realizados en esta revisión

### Entorno reproducible

El mínimo anterior, Node 22.12, era inferior al requerido por React Router 8.5.1, jsdom 31 y pnpm 11.25.0. `package.json` declara ahora la intersección compatible: Node 22.22.2, Node 24.15 o superior de su rama, o Node 26 y posteriores. Se recomienda Node 24 y se añade `.nvmrc` con la versión comprobada, 24.22.1.

El script de lint analiza exclusivamente el código y la configuración del frontend. La carpeta independiente `backendDevTest/`, presente en el espacio de trabajo y ajena al repositorio frontend, contiene otras pruebas y no debe afectar a la validación de esta entrega.

### Contrato de datos

Un precio formado solo por espacios ya no se convierte en cero. También se rechazan valores de tipos inesperados, conservando correctamente el precio numérico cero. La ficha comprueba que el identificador recibido coincide con el solicitado; una respuesta de otro producto no se muestra ni se cachea como válida.

### Comprobaciones ampliadas

Se añaden pruebas de selección con varios colores y capacidades, caducidad de la caché del detalle, fotografías fallidas, productos sin opciones, contador persistido dañado, sincronización entre pestañas y respuestas tardías al navegar entre fichas. Los mocks se limpian entre pruebas para mantener su independencia.

## Evidencia de validación

| Comprobación                                       | Resultado observado                                                                                                                             |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Clon limpio de la versión pública inicial          | Instalación con lockfile, lint, 27 pruebas y build correctos antes de aplicar las mejoras de esta revisión.                                     |
| Pruebas unitarias e integración de la revisión     | 35 pruebas en cinco archivos, todas correctas.                                                                                                  |
| Cobertura configurada de aplicación                | 97,97 % de sentencias, 93,25 % de ramas, 98,61 % de funciones y 99,45 % de líneas; se excluyen main.jsx y los tests.                            |
| Pruebas de navegador contra el build de producción | 20 casos correctos, incluidos los recorridos de escritorio y el perfil móvil sobre Chromium.                                                    |
| Resoluciones comprobadas                           | 320, 360, 390, 768, 1024, 1440 y 1920 píxeles, sin desbordamiento horizontal en catálogo ni ficha.                                              |
| Accesibilidad automatizada                         | Sin infracciones axe en los recorridos comprobados de catálogo y detalle.                                                                       |
| API real en producción                             | 100 productos, búsqueda, ficha, imágenes, alta en carrito y persistencia correctos en los dos viewports del smoke test.                         |
| Revisión de datos del servicio                     | Seis fichas representativas, con opciones únicas y múltiples; seis productos del catálogo tienen precio vacío y se muestran como no disponible. |
| Auditoría de dependencias                          | pnpm audit no reportó vulnerabilidades en producción ni en desarrollo en la fecha de revisión.                                                  |
| Lint, formato y build                              | Correctos.                                                                                                                                      |
| CI remota de la revisión                           | Consultar el resultado asociado a `hito-05-revision-calidad` en [GitHub Actions](https://github.com/produbase/hanna-frontend-test/actions).     |

Los casos de navegador con API simulada son deterministas. El smoke test real se conserva en `output/live-verification.json` y sus capturas en `output/screenshots/`. El perfil móvil emula Chromium y no constituye una prueba de Safari o de un teléfono físico.

## Puntos que conviene defender en la entrevista

Explicar la separación entre vistas, adaptador, API, caché y estado compartido. Justificar el TTL de una hora, la revalidación en el siguiente acceso y la agrupación de peticiones simultáneas. Diferenciar el contador confirmado por el servidor de un incremento optimista local. Mostrar cómo el bloqueo del formulario evita envíos concurrentes y por qué la garantía de idempotencia completa requeriría soporte del backend.

La implementación mantiene un alcance proporcionado a dos vistas. La moneda EUR es un supuesto documentado, los datos vacíos no se inventan y los fallos del servicio tienen un estado recuperable. La memoria técnica contiene el resto de la guía de defensa.
