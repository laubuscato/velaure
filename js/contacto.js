// Página de contacto: comprueba el formulario antes de "enviarlo"
// Es una demo, así que el mensaje no se envía a ningún sitio.

const formContacto = document.getElementById("form-contacto");
const zonaFormulario = document.getElementById("zona-formulario");
const errorContacto = document.getElementById("error-contacto");

// Deja solo letras, espacios, guiones y apóstrofos: "Laura 123" -> "Laura "
// (incluye las letras con tilde, la ñ y la ç)
function soloLetras(texto) {
    return texto.replace(/[^a-zA-ZáéíóúüñçàèòïÁÉÍÓÚÜÑÇÀÈÒÏ' -]/g, "");
}

// En el nombre no se pueden escribir números ni símbolos
const campoNombre = document.getElementById("nombre");

campoNombre.addEventListener("input", function () {
    campoNombre.value = soloLetras(campoNombre.value);
});

// Devuelve un mensaje de error, o "" si todo está bien
function validarContacto(nombre, email, motivo, mensaje) {
    if (nombre.length < 3) {
        return "Escriba su nombre y apellidos.";
    }

    // Comprobación sencilla: que tenga una arroba y un punto
    if (!email.includes("@") || !email.includes(".")) {
        return "El correo electrónico no es válido.";
    }

    if (motivo === "") {
        return "Elija el motivo de la consulta.";
    }

    if (mensaje.length < 10) {
        return "El mensaje es demasiado corto (mínimo 10 caracteres).";
    }

    return "";
}

formContacto.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const motivo = document.getElementById("motivo").value;
    const mensaje = document.getElementById("mensaje").value.trim();

    const error = validarContacto(nombre, email, motivo, mensaje);

    if (error !== "") {
        errorContacto.textContent = error;
        errorContacto.hidden = false;
        return;
    }

    // Todo correcto: se cambia el formulario por un mensaje de agradecimiento
    zonaFormulario.innerHTML = `
        <p class="etiqueta">Mensaje recibido</p>
        <h3 id="gracias" class="contacto-gracias"></h3>
        <p>Le responderemos lo antes posible en la dirección que nos ha indicado.</p>
        <a href="index.html" class="enlace-linea">Volver al inicio</a>
    `;

    // El nombre lo escribe el usuario, por eso va con textContent y no dentro del innerHTML
    const nombrePila = nombre.split(" ")[0];
    document.getElementById("gracias").textContent = `Gracias, ${nombrePila}`;
});
