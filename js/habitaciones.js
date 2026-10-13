// Página de habitaciones: buscador y fichas
// Los datos y los precios están en js/datos.js

const lista = document.getElementById("lista-habitaciones");
const buscador = document.getElementById("buscador");
const campoEntrada = document.getElementById("fecha-entrada");
const campoSalida = document.getElementById("fecha-salida");
const selectorAdultos = document.getElementById("adultos");
const selectorHabitacion = document.getElementById("habitacion");
const textoNochesBuscador = document.getElementById("texto-noches");

// No se pueden elegir días que ya han pasado
campoEntrada.min = aTextoISO(new Date());
campoSalida.min = aTextoISO(new Date());

// Crea una opción del desplegable por cada habitación del array
habitaciones.forEach(function (habitacion) {
    selectorHabitacion.innerHTML += `<option value="${habitacion.id}">${habitacion.nombre}</option>`;
});

// ---------- Pintar las fichas ----------

// Si la búsqueda tiene fechas, muestra el total y el botón "Reservar"
function mostrarHabitaciones(habitacionesAMostrar, busqueda, mensajeSiVacio) {
    lista.innerHTML = "";

    if (habitacionesAMostrar.length === 0) {
        lista.innerHTML = `<p>${mensajeSiVacio}</p>`;
        return;
    }

    habitacionesAMostrar.forEach(function (habitacion) {
        let textoPrecio = `Desde ${formatearPrecio(precioDesde(habitacion, busqueda.adultos))} / noche`;
        // Sin fechas, el botón lleva al buscador para elegirlas
        let boton = `<a href="#buscador" class="boton-ficha">Elegir fechas</a>`;

        if (busqueda.noches) {
            const total = precioAlojamiento(habitacion, busqueda.entrada, busqueda.salida, busqueda.adultos);
            textoPrecio = `${formatearPrecio(total)} · ${textoNoches(busqueda.noches)} · solo alojamiento`;

            // El enlace lleva a reserva.html con los datos en la dirección
            const enlace = `reserva.html?habitacion=${habitacion.id}&entrada=${busqueda.entrada}&salida=${busqueda.salida}&adultos=${busqueda.adultos}`;
            boton = `<a href="${enlace}" class="boton-ficha">Reservar</a>`;
        }

        lista.innerHTML += `
            <article>
                <div class="foto">
                    <img src="${habitacion.imagen}" alt="Habitación ${habitacion.nombre} de Velaure" loading="lazy">
                </div>
                <h3>${habitacion.nombre}</h3>
                <p>${habitacion.descripcion}</p>
                <p>${textoPrecio}</p>
                ${boton}
            </article>
        `;
    });
}

// ---------- Actualizar los resultados ----------

function actualizarResultados() {
    const adultos = Number(selectorAdultos.value);
    const elegida = selectorHabitacion.value;
    const entrada = campoEntrada.value;
    const salida = campoSalida.value;
    const hoy = aTextoISO(new Date());

    const busqueda = { adultos: adultos };
    let hayFechas = false;

    // Sin fechas no se puede reservar, así que se avisa al huésped
    textoNochesBuscador.textContent = "Elija las fechas de llegada y salida para ver el precio y poder reservar.";
    textoNochesBuscador.hidden = false;

    // Solo se busca por fechas si están las dos y son correctas
    if (entrada !== "" && salida !== "") {
        if (entrada < hoy) {
            textoNochesBuscador.textContent = "La fecha de llegada ya ha pasado.";
        } else if (salida <= entrada) {
            textoNochesBuscador.textContent = "La salida tiene que ser posterior a la llegada.";
        } else {
            hayFechas = true;
            busqueda.entrada = entrada;
            busqueda.salida = salida;
            busqueda.noches = nochesEntre(entrada, salida);
            textoNochesBuscador.textContent =
                `${textoNoches(busqueda.noches)} · del ${formatearFecha(entrada)} al ${formatearFecha(salida)}`;
        }
    }

    const resultado = habitaciones.filter(function (habitacion) {
        const esLaElegida = elegida === "todas" || habitacion.id === elegida;
        const cabe = habitacion.capacidad >= adultos;
        const libre = !hayFechas || estaDisponible(habitacion.id, entrada, salida);

        return esLaElegida && cabe && libre;
    });

    let mensaje = "No quedan habitaciones disponibles para esas fechas.";
    if (elegida !== "todas") {
        const nombre = selectorHabitacion.options[selectorHabitacion.selectedIndex].text;
        mensaje = `Lo sentimos, ${nombre} no está disponible en esas fechas. Pruebe con otras fechas o elija "Todas las habitaciones".`;
    }

    mostrarHabitaciones(resultado, busqueda, mensaje);
}

// Al abrir la página
actualizarResultados();

// Los resultados se actualizan al cambiar cualquier casilla del buscador
campoEntrada.addEventListener("change", actualizarResultados);
campoSalida.addEventListener("change", actualizarResultados);
selectorAdultos.addEventListener("change", actualizarResultados);
selectorHabitacion.addEventListener("change", actualizarResultados);

// Evita que la página se recargue si se pulsa Intro en el formulario
buscador.addEventListener("submit", function (evento) {
    evento.preventDefault();
});
