# Memoria técnica de Hanna

Hanna | Tienda online · Prueba técnica de frontend · 10 de noviembre de 2026

Esta memoria explica la aplicación construida para la prueba de Inditex, su arquitectura, los comportamientos implementados y la evidencia de validación. Está pensada para revisar la entrega y preparar su defensa en una entrevista de arquitectura.

La solución es una SPA de React y JavaScript con catálogo, detalle y alta en carrito. Consume directamente la API del enunciado y conserva las lecturas durante una hora en el navegador. El alcance funcional está implementado y validado localmente. La solución y sus hitos están publicados en el repositorio público https://github.com/produbase/hanna-frontend-test.

## Alcance implementado

- Catálogo con todos los productos devueltos por la API, imagen, marca, modelo y precio. Cuatro columnas como máximo y adaptación a tablet y móvil.
- Búsqueda inmediata por marca y modelo, sin distinguir mayúsculas ni acentos. Incluye limpieza de búsqueda, número de resultados y estado sin coincidencias.
- Ficha con imagen, precio, CPU, RAM, sistema operativo, resolución, pantalla, batería, cámaras, dimensiones y peso. Dos columnas en escritorio y disposición vertical en móvil.
- Selectores visibles de almacenamiento y color, incluso con una sola opción. Las opciones únicas quedan seleccionadas automáticamente.
- Alta de producto con identificador y códigos reales de las opciones. El contador de la cabecera utiliza el valor confirmado por el servidor y persiste tras recargar.
- Cabecera con acceso al listado y breadcrumbs, enlace de vuelta desde el detalle, estados de carga y error recuperable y tratamiento de rutas desconocidas.
- Scripts de desarrollo, compilación, pruebas y lint; README, historial Git por hitos, pruebas de navegador y configuración de integración continua.

## Tecnología elegida

React 19.3.1 y React Router 8.5.1 resuelven la interfaz y las rutas en cliente. Vite 8.3.7 genera los recursos estáticos. El código de aplicación es JavaScript con JSX, siguiendo la preferencia del enunciado por evitar TypeScript.

Vitest 5.1.0 y Testing Library cubren lógica e integración de componentes. Playwright 1.65.0 y axe revisan recorridos de navegador y accesibilidad automatizable. ESLint y Prettier aportan análisis estático y formato uniforme. Las versiones resueltas quedan fijadas en pnpm-lock.yaml.

El nombre Hanna es una elección del candidato: el enunciado no impone una marca. La identidad utiliza tonos crema y oliva, tipografía sobria y fotografías del servicio real. La fuente web dispone de alternativas locales si no se puede descargar.

<!-- page -->

## Arquitectura y responsabilidades

La organización separa funcionalidades de producto y carrito de las utilidades compartidas. Las vistas conocen los estados de interacción; la capa de API conoce HTTP y el contrato externo; la caché gestiona vigencia y reutilización de lecturas.

```text
src/
  App.jsx                     Rutas y composición
  components/                 Cabecera, imágenes, iconos y estados
  features/products/          Catálogo, ficha, acciones y adaptador
  features/cart/              Contador compartido y escritura
  lib/api.js                  HTTP, timeout y contrato mínimo
  lib/cache.js                TTL, memoria y persistencia de GET
  lib/storage.js              Acceso tolerante a localStorage
  lib/useResource.js          Carga, error, reintento y resultados tardíos
  styles.css                  Tokens, componentes y breakpoints
tests/                        Preparación, fixtures y E2E
scripts/                      Arranque local y comprobación real
```

## Flujo de lectura

Una vista pide datos a la API mediante useResource. La API consulta la caché antes de ejecutar fetch. La caché devuelve una entrada vigente o realiza una nueva lectura. La respuesta se valida, se guarda con su caducidad y llega a la vista. El detalle se normaliza antes de representarse.

useResource conserva la identidad de la petición y descarta resultados que lleguen después de abandonar la vista. No aborta una lectura compartida al desmontar un componente: esa respuesta puede ser útil para otro consumidor y para la caché. Cada petición HTTP sí tiene un límite de 20 segundos.

## Estado con un propietario claro

La URL contiene la búsqueda, lo que permite compartirla y conservarla al volver desde una ficha. Se usa replace para no crear una entrada de historial por carácter. Las selecciones y el mensaje de compra pertenecen al formulario. El contador y la operación de escritura pendiente pertenecen al proveedor de carrito situado por encima de las rutas.

El router aplica actualizaciones síncronas con useTransitions=false. Esta decisión evita que un input controlado desde la URL pierda caracteres durante transiciones diferidas. Una prueba de navegador escribe la búsqueda carácter a carácter para cubrir ese comportamiento.

## Dependencias proporcionadas al alcance

Context es suficiente para un contador y un estado de escritura compartido. No se incorpora Redux. La caché requerida tiene un contrato acotado y una implementación pequeña y probada; por ello no se añade una biblioteca de consultas. Si aparecen invalidaciones complejas, paginación, suscripciones o más mutaciones, convendría evaluar una solución especializada.

<!-- page -->

## Integración con la API

La URL predeterminada es https://itx-frontend-test.onrender.com. Puede sustituirse en compilación mediante VITE_API_URL. No se requieren credenciales ni un servidor propio.

GET /api/product obtiene el catálogo. GET /api/product/:id obtiene la ficha. POST /api/cart recibe exclusivamente id, colorCode y storageCode como JSON. Los selectores usan valores de formulario en texto, pero el envío recupera el código original de la opción para conservar su tipo numérico cuando lo proporciona el servicio.

El adaptador corrige diferencias del contrato externo: dimentions se expone como dimensions y secondaryCmera como secondaryCamera. En la respuesta observada, displaySize contiene la resolución en píxeles y displayResolution contiene las pulgadas. La interfaz utiliza nombres semánticos normalizados y no repite estas particularidades en cada componente.

Se valida un contrato mínimo de producto con id, brand y model de tipo texto y un catálogo de productos válidos. Las opciones requieren nombre y código. El contador del carrito debe ser un entero seguro no negativo. Una respuesta no válida no se utiliza como un resultado correcto.

## Caché de una hora

1. La clave combina la URL de la API y el recurso. La persistencia usa el prefijo versionado itx:cache:v1 para evitar colisiones con otros datos.
2. Se busca primero en memoria y después en localStorage. La entrada contiene value y expiresAt.
3. Si la entrada es válida y no ha caducado, se devuelve sin consultar la red.
4. Si caduca o tiene formato inválido, se descarta. La siguiente lectura solicita de nuevo el recurso y espera la respuesta vigente.
5. Las solicitudes simultáneas de la misma clave comparten una promesa. Así se evitan duplicados durante montajes coincidentes o StrictMode.
6. Tras recibir una respuesta correcta y válida se establece expiresAt con el instante actual más 3 600 000 milisegundos. Los errores no se guardan como datos.
7. Si el navegador bloquea localStorage o agota su cuota, la aplicación continúa con la copia en memoria. En ese caso, los datos no sobreviven a una recarga.

La revalidación se realiza al acceder al recurso después de caducar. No existe un temporizador de refresco en segundo plano ni se sirven datos caducados cuando falla la red. Este comportamiento es explícito y permite al usuario reintentar.

## Escrituras y contador

El POST del carrito no se cachea ni se reintenta automáticamente. Un bloqueo inmediato mediante referencia y el estado visual pendiente impiden envíos simultáneos en la aplicación. Tras el éxito se sustituye el contador por el valor del servidor; no se incrementa localmente suponiendo que el servicio mantenga una sesión. Se persiste con la clave itx:cart:v1 y se escuchan cambios de almacenamiento de otras pestañas.

<!-- page -->

## Interfaz y experiencia de uso

La vista principal mantiene el catálogo como tarea central: introducción breve, búsqueda y tarjetas con fotografía, marca, modelo y precio. Se usa CSS Grid con cuatro columnas en escritorio amplio, tres en tamaños intermedios y dos en móvil. Las imágenes inferiores se cargan de forma diferida; las primeras se solicitan inmediatamente.

La ficha respeta la estructura del enunciado: imagen a la izquierda, información y acciones a la derecha. En móvil se apilan para preservar legibilidad. En escritorio la imagen permanece visible al desplazarse por las especificaciones. Los campos largos se ajustan para evitar desbordamientos.

Los selectores usan controles nativos etiquetados. Si hay varias opciones, el usuario debe elegir; si solo hay una, queda preseleccionada. El botón permanece deshabilitado cuando faltan opciones o hay un envío pendiente. Al cambiar de producto se reinicia el formulario mediante su identidad, evitando reutilizar selecciones de otra ficha.

## Accesibilidad y estados

La aplicación incluye landmarks semánticos, encabezados jerárquicos, enlace para saltar al contenido, foco visible y etiquetas para búsqueda y selectores. Los iconos decorativos quedan fuera del árbol accesible. Al cambiar de ruta se mueve el foco al contenido y se vuelve al inicio de la página.

El contador y los resultados se anuncian mediante regiones vivas. Los errores de servicio incluyen un botón de reintento. La carga muestra esqueletos y un estado accesible; una búsqueda sin coincidencias ofrece limpiar el filtro. Una imagen fallida se sustituye por texto y las rutas desconocidas incluyen acceso al catálogo. Se respeta prefers-reduced-motion.

Las comprobaciones axe no detectaron infracciones en catálogo ni ficha con los datos controlados, tanto en escritorio como en el viewport móvil. Este resultado cubre las reglas automatizadas ejecutadas; no equivale a una auditoría completa con lectores de pantalla y dispositivos físicos.

## Supuestos de presentación

Los precios se formatean como EUR para el contexto de la prueba. La API no indica moneda, por lo que esta es una elección documentada. Un precio vacío, negativo o no numérico aparece como no disponible, conservando correctamente un precio igual a cero.

Los atributos sin contenido muestran No disponible. Los atributos compuestos, como las cámaras, se presentan como una lista textual legible. El peso numérico se acompaña de gramos; no se inventan datos de batería o dimensiones ausentes.

La bolsa es un contador y una acción de alta, tal como se pide. No se ha añadido una tercera vista de carrito, pagos, autenticación, promociones ni una promesa de envío comercial.

<!-- page -->

## Validación realizada

Las comprobaciones se ejecutaron el 10 de noviembre de 2026 en el entorno local del proyecto. La instalación usa el lockfile y la compilación produce una aplicación estática sin SSR.

## Pruebas unitarias e integración

Pasan 35 pruebas en cinco archivos. Cubren el filtrado, acentos y espacios, precios ausentes y cero, adaptación del contrato, caché vigente y caducada, recuperación tras recarga, promesas compartidas, errores no cacheados, JSON corrupto y almacenamiento bloqueado.

También cubren el contrato del POST, contadores inválidos, 404, respuestas malformadas, fallos de conexión y timeout. En la aplicación comprueban navegación, selección, persistencia del contador, recuperación de errores, conservación del filtro y prevención de envíos simultáneos.

La última medición de cobertura sobre los archivos de aplicación configurados, excluyendo main.jsx y los propios tests, es 97,97 % de sentencias, 93,25 % de ramas, 98,61 % de funciones y 99,45 % de líneas. La cobertura ayuda a localizar huecos; no demuestra por sí sola ausencia de errores.

## Pruebas de navegador

Pasan 20 casos de Playwright contra el build de producción: diez recorridos de escritorio y diez del perfil móvil sobre Chromium. Cubren compra y persistencia, reutilización de GET, revalidación tras caducar, recuperación de error, acceso directo a la ficha, atributos y precio ausente, análisis axe, ausencia de desbordamiento y búsqueda y compra con teclado en un producto de opciones únicas. Se comprueban además varios colores y capacidades, caché de la ficha y siete resoluciones entre 320 y 1920 píxeles.

Los recorridos automáticos emplean fixtures e interceptan la API para ser deterministas. Las imágenes de estos casos son recursos de prueba. El perfil móvil emula tamaño y eventos táctiles en Chromium; no ejecuta Safari ni certifica compatibilidad con iOS real. El formato, lint y build se comprueban con sus respectivos scripts.

## Comprobación con el servicio real

El script scripts/verify-live.mjs se ejecutó sin interceptar peticiones, en viewports de 1440 por 1000 y 390 por 844 píxeles. En ambos se recibieron 100 productos, funcionaron la búsqueda y la ficha, se decodificaron las imágenes y no se detectó desbordamiento horizontal ni errores JavaScript de página.

En escritorio se realizó además una petición real al carrito. El servicio devolvió count igual a 1; ese valor apareció en la cabecera y sobrevivió a una recarga. La evidencia se conserva en output/live-verification.json y en las capturas con prefijo live de output/screenshots.

El workflow de GitHub Actions ejecuta instalación, lint, formato, cobertura, build y navegador. Sus ejecuciones y resultados remotos se consultan en https://github.com/produbase/hanna-frontend-test/actions. La evidencia local descrita arriba se conserva junto al código.

<!-- page -->

## Ejecución y entrega

Se recomienda Node.js 24.15 o superior de la rama 24 y pnpm 11.25.0. La validación utilizó Node.js 24.22.1, fijado en .nvmrc. El rango de engines también admite Node 22.22.2 y Node 26 o posterior. Si pnpm no está instalado, puede instalarse mediante npm install --global pnpm@11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm start
pnpm lint
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm format:check
pnpm build
pnpm preview
```

El servidor de desarrollo se abre en http://127.0.0.1:5173. scripts/start-local.sh facilita el arranque en Codex Desktop cuando Node no está en el PATH, detectando su runtime incluido. Las pruebas de navegador locales requieren Google Chrome instalado; en CI se instala Chromium.

VITE_API_URL se define opcionalmente en .env. El archivo .env.example muestra la configuración pública. Los ficheros locales de entorno quedan ignorados por Git. Para comprobar el servicio real, arrancar la aplicación y ejecutar node scripts/verify-live.mjs. Este comando realiza una alta real en el carrito y puede fallar si el servicio externo cambia o no está disponible.

La compilación genera dist. Para alojarla se necesita servir sus recursos por HTTP y configurar el fallback de rutas a index.html, incluyendo accesos directos a /products/:id. No hay procesos de servidor de aplicación ni base de datos que desplegar.

## Archivos entregados e historial

README.md explica el arranque, los scripts y las decisiones principales. docs/memoria-tecnica.md conserva esta explicación junto al código. output/doc/memoria-tecnica-hanna.docx contiene la memoria en Word. output/screenshots y output/live-verification.json conservan la evidencia visual y del servicio.

El primer commit incluye README, alcance e instrucciones. El siguiente incorpora las funcionalidades principales. Los hitos posteriores recogen pruebas de navegador, ajustes derivados de su ejecución, nombre Hanna y documentación final. El historial se puede inspeccionar con git log --oneline.

El repositorio público es https://github.com/produbase/hanna-frontend-test, configurado como origin. Se realizaron subidas separadas para los cuatro hitos, conservando los commits originales y las etiquetas hito-01-readme, hito-02-aplicacion, hito-03-calidad y hito-04-documentacion. La entrega inicial se marca con entrega-final y su revisión posterior con hito-05-revision-calidad, ambas en el historial de main.

## Límites conocidos

El servicio de prueba controla el significado y evolución del contador; el frontend respeta cada respuesta. Si un POST se procesa pero se pierde su respuesta, el cliente no puede garantizar exactamente una compra sin soporte de idempotencia del servidor. No se efectúan reintentos automáticos de escrituras.

La expiración de caché es por recurso y acceso. No hay cuotas o política LRU para un catálogo enorme, ni garantía de funcionamiento offline. Para los 100 productos observados no se requieren paginación ni virtualización. Los datos en localStorage no son secretos y no se utiliza como mecanismo de autenticación.

<!-- page -->

## Guía para defender la solución

## Por qué esta arquitectura

Cada comportamiento tiene un responsable claro: vistas para representación, adaptador para el contrato externo, caché para caducidad y concurrencia, contexto para el contador entre rutas. Estos límites permiten cambiar el servicio o el almacenamiento sin reescribir toda la interfaz.

## Qué ocurre cuando caduca la caché

La siguiente lectura detecta expiresAt vencido, descarta la entrada y solicita de nuevo el recurso. Una respuesta correcta renueva el dato durante una hora; una respuesta fallida muestra error y permite reintentar. No se simula que los datos antiguos estén vigentes.

## Cómo se evita una compra duplicada

La referencia de bloqueo se activa antes de esperar al servidor y el botón queda deshabilitado durante el envío. Esto evita acciones simultáneas dentro de la aplicación. Para cubrir duplicados causados por redes, múltiples dispositivos o respuestas perdidas se necesitaría una clave de idempotencia y garantías del backend.

## Por qué no se añade más infraestructura

Las dependencias resuelven navegación, construcción y verificación. Para dos vistas y un contador, los límites existentes permiten extender el proyecto sin incorporar microfrontends, un gestor global extenso ni un backend intermediario.

## Qué se revisaría al crecer

Con un catálogo grande se considerarían búsqueda y paginación de servidor. Con más operaciones y dependencias entre consultas se evaluaría una biblioteca de estado de servidor. Con un carrito comercial serían necesarios líneas, cantidades, precios autoritativos, inventario e idempotencia. Los cambios de moneda e idioma requerirían una política de internacionalización y un contrato de precios explícito.

## Demostración sugerida

Mostrar el catálogo en escritorio y móvil. Escribir una marca y abrir una ficha. Explicar por qué una opción única ya está seleccionada y elegir la capacidad. Añadir el producto, observar el contador y recargar. Volver al filtro y enseñar que la lectura vigente no produce otra petición. Finalmente ejecutar los tests y recorrer cache.js y api.js para justificar las decisiones.

## Uso de IA y referencias

El código y esta memoria se han elaborado con asistencia de IA, según la autorización comunicada por el candidato. Antes de presentarlos, debe revisar la implementación, ejecutar los recorridos y poder explicar sus decisiones.

La fuente de requisitos es ITX FrontEndTest1, el PDF facilitado. Las referencias técnicas consultadas son las guías oficiales de Vite en https://vite.dev/guide/, React Router en https://reactrouter.com/start/declarative/installation y Vitest en https://vitest.dev/guide/. El contrato efectivo se contrastó con las respuestas reales de la API.
