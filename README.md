# Velaure

**Ver la web:** [laubuscato.github.io/velaure](https://laubuscato.github.io/velaure/)

Web de un hotel de lujo ficticio en la Costa Brava, con buscador de habitaciones y reserva.

La hice como proyecto de portfolio mientras estudio el ciclo de Desarrollo de Aplicaciones Web (DAW). Trabajo de recepcionista en un hotel, así que quise hacer algo que conozco bien: cómo se busca una habitación, cómo se calcula el precio de una estancia y qué datos se piden para confirmar una reserva.

El hotel, la cala y el pueblo son inventados.

## Qué se puede hacer

- Ver el hotel, sus cinco habitaciones y sus servicios.
- Buscar por fechas, número de adultos y habitación, y ver el precio total de la estancia.
- Reservar eligiendo el régimen (solo alojamiento, desayuno o media pensión) y, si la estancia lo permite, el Pack Romántico.
- Dejar una tarjeta como garantía. Es una demo: no se cobra nada y solo se guardan la marca y las cuatro últimas cifras.
- Ver la pantalla de confirmación con el código de reserva, el desglose del precio y la fecha límite de cancelación gratuita.
- Consultar una reserva con su código en "Mi reserva" y cancelarla. Al cancelarla, la habitación vuelve a estar libre.
- Si una habitación ya está reservada en unas fechas, deja de salir en la búsqueda.
- Enviar una consulta desde el formulario de contacto, que comprueba los datos antes de aceptarla (es una demo y el mensaje no se envía).

Para probar la reserva se puede usar la tarjeta de prueba `4242 4242 4242 4242`, con cualquier caducidad futura y cualquier CVC.

## Tecnologías

HTML, CSS y JavaScript, sin librerías ni frameworks.

Las fotos están generadas con inteligencia artificial (Gemini), ya que el hotel no existe.

## Cómo está organizado

```
index.html            Página de inicio
habitaciones.html     Buscador y lista de habitaciones
reserva.html          Formulario, resumen y confirmación de la reserva
servicios.html        Spa, restaurante, piscina y experiencias
contacto.html         Formulario de contacto y datos del hotel
mi-reserva.html       Consultar o cancelar una reserva con el código
css/estilos.css       Estilos de toda la web
js/datos.js           Habitaciones, tarifas y funciones compartidas
js/habitaciones.js    Buscador y fichas de las habitaciones
js/reserva.js         Precio, validación de la tarjeta y guardado de la reserva
js/contacto.js        Validación del formulario de contacto
js/mi-reserva.js      Búsqueda y cancelación de una reserva
js/animaciones.js     Animación de aparecer al hacer scroll
img/                  Fotos
```

## Cómo funciona

- Las habitaciones y los regímenes están en arrays de objetos en `datos.js`. Las fichas se crean con JavaScript a partir de esos arrays.
- Al pulsar "Reservar", los datos de la búsqueda pasan a `reserva.html` en la dirección de la página y allí se leen con `URLSearchParams`.
- El precio depende de la temporada, las noches, los adultos (con un adulto hay un descuento por uso individual), el régimen y el pack. Hay tres temporadas (baja, media y alta) y el precio se calcula sumando noche a noche con un bucle, porque una estancia puede empezar en una temporada y acabar en otra.
- De la tarjeta se comprueba que el número tenga 16 cifras, que no esté caducada y que el CVC tenga 3 cifras.
- Los campos de nombre solo admiten letras y los de teléfono, tarjeta y CVC solo números: lo que no vale se borra mientras se escribe.
- Las reservas se guardan en `localStorage`. Para saber si una habitación está libre se comprueba que las fechas no se solapen con ninguna reserva confirmada.
- Al cancelar, la reserva no se borra: se marca como cancelada y deja de contar para la disponibilidad.
- El diseño se adapta a móvil con una media query.
- SEO básico: cada página tiene su título, su descripción y un único `h1`, las fotos llevan texto alternativo y las páginas de reserva están marcadas para que los buscadores no las muestren.

## Cómo probarlo

Descargar el repositorio y abrir `index.html` en el navegador.

Para borrar las reservas de prueba, escribir en la consola del navegador: `localStorage.clear()`

## Cosas que me gustaría añadir

- Enviar un email de confirmación con EmailJS (tengo el código y la plantilla empezados).
- Un calendario propio para elegir las fechas.

## Autora

Laura · [github.com/laubuscato](https://github.com/laubuscato)
