// Página "Mi reserva": busca una reserva por su código y permite cancelarla
// Las reservas están guardadas en localStorage (ver js/datos.js)

const formBuscar = document.getElementById("form-buscar");
const campoCodigo = document.getElementById("codigo");
const errorBusqueda = document.getElementById("error-busqueda");
const resultado = document.getElementById("resultado");

// ---------- Mostrar la reserva ----------

function mostrarReserva(reserva) {
    let textoAdultos = "1 adulto";
    if (reserva.adultos === 2) {
        textoAdultos = "2 adultos";
    }

    let filaPack = "";
    if (reserva.pack) {
        filaPack = `<div><dt>Oferta</dt><dd>${packRomantico.nombre}</dd></div>`;
    }

    // La parte de abajo cambia según si la reserva sigue activa o está cancelada
    let textoEstado = "Reserva confirmada";
    let zonaCancelar = `
        <p class="ficha-nota">${textoCancelacion(reserva.entrada)}.</p>
        <button type="button" id="boton-cancelar" class="boton-ficha">Cancelar reserva</button>
    `;

    if (reserva.estado === "cancelada") {
        textoEstado = "Reserva cancelada";
        zonaCancelar = `<p class="ficha-nota">Esta reserva está cancelada. La habitación vuelve a estar disponible en esas fechas.</p>`;
    }

    resultado.innerHTML = `
        <div class="ficha-reserva">
            <p class="etiqueta">${textoEstado}</p>
            <h3>${reserva.nombreHabitacion}</h3>

            <dl class="resumen-datos">
                <div><dt>Código</dt><dd>${reserva.codigo}</dd></div>
                <div><dt>Llegada</dt><dd>${formatearFechaLarga(reserva.entrada)}</dd></div>
                <div><dt>Salida</dt><dd>${formatearFechaLarga(reserva.salida)}</dd></div>
                <div><dt>Estancia</dt><dd>${textoNoches(reserva.noches)}</dd></div>
                <div><dt>Huéspedes</dt><dd>${textoAdultos}</dd></div>
                <div><dt>Régimen</dt><dd>${reserva.regimen}</dd></div>
                ${filaPack}
                <div><dt>A nombre de</dt><dd id="nombre-huesped"></dd></div>
                <div><dt>Total</dt><dd>${formatearPrecio(reserva.total)}</dd></div>
            </dl>

            ${zonaCancelar}
        </div>
    `;

    // El nombre lo escribió el usuario, por eso va con textContent y no dentro del innerHTML
    document.getElementById("nombre-huesped").textContent = reserva.nombre;

    // El botón solo existe si la reserva no está cancelada
    const botonCancelar = document.getElementById("boton-cancelar");
    if (botonCancelar !== null) {
        botonCancelar.addEventListener("click", function () {
            const seguro = confirm("¿Seguro que quiere cancelar esta reserva?");
            if (seguro) {
                cancelarReserva(reserva.codigo);
            }
        });
    }
}

// ---------- Buscar ----------

function buscarReserva(codigo) {
    const reservas = obtenerReservas();

    const reserva = reservas.find(function (r) {
        return r.codigo === codigo;
    });

    if (!reserva) {
        resultado.innerHTML = "";
        errorBusqueda.textContent = "No hemos encontrado ninguna reserva con ese código.";
        errorBusqueda.hidden = false;
        return;
    }

    errorBusqueda.hidden = true;
    mostrarReserva(reserva);
}

// ---------- Cancelar ----------

// La reserva no se borra: se marca como cancelada y se vuelve a guardar la lista
function cancelarReserva(codigo) {
    const reservas = obtenerReservas();

    reservas.forEach(function (reserva) {
        if (reserva.codigo === codigo) {
            reserva.estado = "cancelada";
        }
    });

    guardarReservas(reservas);
    buscarReserva(codigo);
}

// ---------- Eventos ----------

formBuscar.addEventListener("submit", function (evento) {
    evento.preventDefault();

    // Se quitan los espacios y se pasa a mayúsculas por si se escribe "vlr-2026-0001"
    const codigo = campoCodigo.value.trim().toUpperCase();

    if (codigo === "") {
        resultado.innerHTML = "";
        errorBusqueda.textContent = "Escriba su código de reserva.";
        errorBusqueda.hidden = false;
        return;
    }

    buscarReserva(codigo);
});

// Si se llega desde la confirmación, el código viene en la dirección:
// mi-reserva.html?codigo=VLR-2026-0001
const parametros = new URLSearchParams(window.location.search);
const codigoDireccion = parametros.get("codigo");

if (codigoDireccion) {
    campoCodigo.value = codigoDireccion;
    buscarReserva(codigoDireccion);
}
