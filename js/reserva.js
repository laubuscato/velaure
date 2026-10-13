// Página de reserva
// Lee de la dirección qué habitación y fechas se han elegido,
// deja elegir régimen y ofertas, muestra el resumen y guarda la reserva.

const contenido = document.getElementById("contenido-reserva");
const tarjetaResumen = document.getElementById("tarjeta-resumen");
const formReserva = document.getElementById("form-reserva");
const cajaRegimen = document.getElementById("opciones-regimen");
const cajaPack = document.getElementById("opcion-pack");

// ---------- Leer la dirección ----------
// Ejemplo: reserva.html?habitacion=mirador&entrada=2026-10-09&salida=2026-10-12&adultos=2

const parametros = new URLSearchParams(window.location.search);

const idHabitacion = parametros.get("habitacion");
const entrada = parametros.get("entrada");
const salida = parametros.get("salida");
const adultos = Number(parametros.get("adultos"));

const habitacion = habitaciones.find(function (h) {
    return h.id === idHabitacion;
});

// ---------- Comprobar que todo es válido ----------

function mostrarError(mensaje) {
    contenido.innerHTML = `
        <div class="mensaje-reserva">
            <p class="etiqueta">Reserva</p>
            <h2>No podemos continuar</h2>
            <p>${mensaje}</p>
            <a href="habitaciones.html" class="enlace-linea">Volver a las habitaciones</a>
        </div>
    `;
}

const hoy = aTextoISO(new Date());

let datosValidos = true;

if (!habitacion || !entrada || !salida || !adultos) {
    mostrarError("Faltan datos de la reserva. Vuelva a elegir fechas y habitación.");
    datosValidos = false;
} else if (entrada < hoy || salida <= entrada) {
    mostrarError("Las fechas elegidas no son válidas.");
    datosValidos = false;
} else if (adultos > habitacion.capacidad) {
    mostrarError(`${habitacion.nombre} admite un máximo de ${habitacion.capacidad} adultos.`);
    datosValidos = false;
} else if (!estaDisponible(habitacion.id, entrada, salida)) {
    mostrarError(`Lo sentimos, ${habitacion.nombre} ya no está disponible en esas fechas.`);
    datosValidos = false;
}

if (datosValidos) {
    const noches = nochesEntre(entrada, salida);
    const textoAdultos = adultos === 1 ? "1 adulto" : `${adultos} adultos`;
    const puedeLlevarPack = packDisponible(adultos, noches);

    // ---------- Opciones de régimen ----------

    regimenes.forEach(function (regimen, posicion) {
        const suplemento = regimen.precioPersonaNoche * adultos * noches;
        const textoPrecio = suplemento === 0 ? "Incluido" : `+ ${formatearPrecio(suplemento)}`;

        cajaRegimen.innerHTML += `
            <label class="opcion">
                <input type="radio" name="regimen" value="${regimen.id}" ${posicion === 0 ? "checked" : ""}>
                <span class="opcion-texto">
                    <span class="opcion-nombre">${regimen.nombre}</span>
                    <span class="opcion-detalle">${regimen.descripcion}</span>
                </span>
                <span class="opcion-precio">${textoPrecio}</span>
            </label>
        `;
    });

    // ---------- Opción del pack ----------

    const listaIncluye = packRomantico.incluye.map(function (cosa) {
        return `<li>${cosa}</li>`;
    }).join("");

    if (puedeLlevarPack) {
        cajaPack.innerHTML = `
            <label class="opcion">
                <input type="checkbox" id="pack">
                <span class="opcion-texto">
                    <span class="opcion-nombre">${packRomantico.nombre}</span>
                    <ul>${listaIncluye}</ul>
                </span>
                <span class="opcion-precio">+ ${formatearPrecio(packRomantico.precio)}</span>
            </label>
        `;
    } else {
        cajaPack.innerHTML = `
            <div class="opcion no-disponible">
                <span class="opcion-texto">
                    <span class="opcion-nombre">${packRomantico.nombre}</span>
                    <span class="opcion-detalle">Disponible para 2 adultos y estancias de ${packRomantico.nochesMinimas} noches o más.</span>
                </span>
            </div>
        `;
    }

    // ---------- Resumen ----------

    // Lee lo que el huésped ha marcado en este momento
    function leerOpciones() {
        const idRegimen = document.querySelector('input[name="regimen"]:checked').value;
        const casillaPack = document.getElementById("pack");
        const conPack = casillaPack !== null && casillaPack.checked;

        return { idRegimen: idRegimen, conPack: conPack };
    }

    function pintarResumen() {
        const opciones = leerOpciones();
        const precio = calcularPrecio(habitacion, entrada, salida, adultos, opciones.idRegimen, opciones.conPack);

        let lineaComidas = "";
        if (precio.comidas > 0) {
            lineaComidas = `
                <div>
                    <span>${precio.regimen.nombre}</span>
                    <span>${formatearPrecio(precio.comidas)}</span>
                </div>`;
        }

        let lineaPack = "";
        if (precio.pack > 0) {
            lineaPack = `
                <div>
                    <span>${packRomantico.nombre}</span>
                    <span>${formatearPrecio(precio.pack)}</span>
                </div>`;
        }

        let notaIndividual = "";
        if (adultos === 1) {
            notaIndividual = `<p class="nota-resumen">Tarifa de uso individual (−${DESCUENTO_INDIVIDUAL * 100} %).</p>`;
        }

        tarjetaResumen.innerHTML = `
            <img src="${habitacion.imagen}" alt="Habitación ${habitacion.nombre}">

            <div class="resumen-cuerpo">
                <p class="etiqueta">Su estancia</p>
                <h3>${habitacion.nombre}</h3>

                <dl class="resumen-datos">
                    <div><dt>Llegada</dt><dd>${formatearFecha(entrada)}</dd></div>
                    <div><dt>Salida</dt><dd>${formatearFecha(salida)}</dd></div>
                    <div><dt>Huéspedes</dt><dd>${textoAdultos}</dd></div>
                    <div><dt>Régimen</dt><dd>${precio.regimen.nombre}</dd></div>
                </dl>

                <div class="resumen-precio">
                    <div>
                        <span>Alojamiento · ${textoNoches(noches)}</span>
                        <span>${formatearPrecio(precio.alojamiento)}</span>
                    </div>
                    ${lineaComidas}
                    ${lineaPack}
                    <div class="resumen-total">
                        <span>Total</span>
                        <span>${formatearPrecio(precio.total)}</span>
                    </div>
                </div>
                ${notaIndividual}

                <p class="cancelacion">${textoCancelacion(entrada)}</p>
            </div>
        `;
    }

    pintarResumen();

    // Cada vez que cambia el régimen o el pack, se recalcula el resumen
    formReserva.addEventListener("change", pintarResumen);

    // ---------- Tarjeta de garantía ----------

    const campoTitular = document.getElementById("titular");
    const campoNumero = document.getElementById("numero-tarjeta");
    const campoCaducidad = document.getElementById("caducidad");
    const campoCvc = document.getElementById("cvc");
    const errorTarjeta = document.getElementById("error-tarjeta");

    // Deja solo los números de un texto: "4242 4242" -> "42424242"
    function soloNumeros(texto) {
        return texto.replace(/\D/g, "");
    }

    // Deja solo letras, espacios, guiones y apóstrofos: "Laura 123" -> "Laura "
    // (incluye las letras con tilde, la ñ y la ç)
    function soloLetras(texto) {
        return texto.replace(/[^a-zA-ZáéíóúüñçàèòïÁÉÍÓÚÜÑÇÀÈÒÏ' -]/g, "");
    }

    // En el nombre y en el titular no se pueden escribir números ni símbolos
    const campoNombre = document.getElementById("nombre");
    const campoTelefono = document.getElementById("telefono");

    campoNombre.addEventListener("input", function () {
        campoNombre.value = soloLetras(campoNombre.value);
    });

    campoTitular.addEventListener("input", function () {
        campoTitular.value = soloLetras(campoTitular.value);
    });

    // En el teléfono solo números, espacios y el signo +
    campoTelefono.addEventListener("input", function () {
        campoTelefono.value = campoTelefono.value.replace(/[^0-9+ ]/g, "");
    });

    // Mientras se escribe el número, lo separa en grupos de 4
    campoNumero.addEventListener("input", function () {
        const numeros = soloNumeros(campoNumero.value).slice(0, 16);
        let conEspacios = "";

        for (let i = 0; i < numeros.length; i++) {
            if (i > 0 && i % 4 === 0) {
                conEspacios += " ";
            }
            conEspacios += numeros[i];
        }

        campoNumero.value = conEspacios;
    });

    // Mientras se escribe la caducidad, añade la barra: "1228" -> "12/28"
    campoCaducidad.addEventListener("input", function () {
        const numeros = soloNumeros(campoCaducidad.value).slice(0, 4);
        if (numeros.length > 2) {
            campoCaducidad.value = `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
        } else {
            campoCaducidad.value = numeros;
        }
    });

    campoCvc.addEventListener("input", function () {
        campoCvc.value = soloNumeros(campoCvc.value).slice(0, 3);
    });

    // Marca según cómo empieza el número
    function detectarMarca(numero) {
        if (numero.startsWith("4")) {
            return "Visa";
        }
        if (numero.startsWith("5")) {
            return "Mastercard";
        }
        if (numero.startsWith("34") || numero.startsWith("37")) {
            return "American Express";
        }
        return "Tarjeta";
    }

    // Devuelve un mensaje de error, o "" si todo está bien
    function validarTarjeta() {
        const numero = soloNumeros(campoNumero.value);
        const caducidad = campoCaducidad.value;
        const cvc = campoCvc.value;

        if (campoTitular.value.trim().length < 3) {
            return "Escriba el nombre del titular tal y como aparece en la tarjeta.";
        }

        if (numero.length !== 16) {
            return "El número de tarjeta debe tener 16 cifras.";
        }

        // La caducidad se escribe como "12/28"
        const mes = Number(caducidad.slice(0, 2));
        const anio = 2000 + Number(caducidad.slice(3));

        if (caducidad.length !== 5 || mes < 1 || mes > 12) {
            return "La caducidad debe tener el formato MM/AA.";
        }

        // La tarjeta vale hasta el último día de su mes de caducidad
        const ultimoDiaValido = new Date(anio, mes, 0, 23, 59, 59);

        if (ultimoDiaValido < new Date()) {
            return "La tarjeta está caducada.";
        }

        if (cvc.length !== 3) {
            return "El CVC debe tener 3 cifras.";
        }

        return "";
    }

    // ---------- Pantalla de confirmación ----------

    function mostrarConfirmacion(reserva) {
        // Solo el nombre de pila para el saludo: "Laura Prueba" -> "Laura"
        const nombrePila = reserva.nombre.trim().split(" ")[0];
        const horaSalida = reserva.pack ? "15:00" : "12:00";
        const textoAdultosConf = reserva.adultos === 1 ? "1 adulto" : `${reserva.adultos} adultos`;

        let lineaComidas = "";
        if (reserva.precioComidas > 0) {
            lineaComidas = `<div><span>${reserva.regimen}</span><span>${formatearPrecio(reserva.precioComidas)}</span></div>`;
        }

        let lineaPack = "";
        let filaPack = "";
        if (reserva.pack) {
            lineaPack = `<div><span>${packRomantico.nombre}</span><span>${formatearPrecio(reserva.precioPack)}</span></div>`;
            filaPack = `<div><dt>Oferta</dt><dd>${packRomantico.nombre}</dd></div>`;
        }

        // Ocultamos el enlace "Volver a las habitaciones"
        document.querySelector(".volver").hidden = true;

        contenido.innerHTML = `
            <div class="confirmacion">

                <div class="conf-cabecera">
                    <p class="conf-icono">✓</p>
                    <p class="etiqueta">Reserva confirmada</p>
                    <h2>Gracias, ${nombrePila}</h2>
                    <p class="subtitulo">Le esperamos en Velaure</p>
                </div>

                <div class="conf-codigo">
                    <span class="etiqueta">Código de reserva</span>
                    <strong>${reserva.codigo}</strong>
                    <span>Guárdelo para consultar o gestionar su reserva.</span>
                </div>

                <div class="conf-cuerpo">
                    <figure class="conf-foto">
                        <img src="${habitacion.imagen}" alt="Habitación ${habitacion.nombre}">
                        <figcaption>${habitacion.nombre}</figcaption>
                    </figure>

                    <div class="conf-detalles">
                        <div class="conf-fechas">
                            <div>
                                <span class="etiqueta">Llegada</span>
                                <strong>${formatearFechaLarga(reserva.entrada)}</strong>
                                <span>A partir de las 15:00</span>
                            </div>
                            <div>
                                <span class="etiqueta">Salida</span>
                                <strong>${formatearFechaLarga(reserva.salida)}</strong>
                                <span>Hasta las ${horaSalida}</span>
                            </div>
                        </div>

                        <dl class="resumen-datos">
                            <div><dt>Estancia</dt><dd>${textoNoches(reserva.noches)}</dd></div>
                            <div><dt>Huéspedes</dt><dd>${textoAdultosConf}</dd></div>
                            <div><dt>Régimen</dt><dd>${reserva.regimen}</dd></div>
                            ${filaPack}
                            <div><dt>A nombre de</dt><dd>${reserva.nombre}</dd></div>
                        </dl>

                        <div class="conf-precio">
                            <div><span>${textoNoches(reserva.noches)} de alojamiento</span><span>${formatearPrecio(reserva.precioAlojamiento)}</span></div>
                            ${lineaComidas}
                            ${lineaPack}
                            <div class="conf-total"><span>Total</span><span>${formatearPrecio(reserva.total)}</span></div>
                        </div>

                        <p class="conf-nota">Garantizada con ${reserva.tarjeta.marca} terminada en ${reserva.tarjeta.ultimas4}. El pago se realiza en el hotel.</p>
                        <p class="conf-nota">${textoCancelacion(reserva.entrada)}.</p>
                    </div>
                </div>

                <section class="conf-llegada">
                    <p class="etiqueta">Antes de su llegada</p>
                    <div class="conf-consejos">
                        <div>
                            <h3>Cómo llegar</h3>
                            <p>Velaure está en Cala Narel, a unos 50 minutos del aeropuerto de Girona. El último tramo es un camino entre pinos que baja hasta la cala.</p>
                        </div>
                        <div>
                            <h3>Traslado privado</h3>
                            <p>Podemos recogerle en el aeropuerto o en la estación. Solicítelo al concierge con al menos 48 horas de antelación.</p>
                        </div>
                        <div>
                            <h3>Concierge</h3>
                            <p>Reservas en el spa, mesa en el restaurante o una travesía en llaüt: escríbanos a concierge@velaure.example.</p>
                        </div>
                    </div>
                </section>

                <div class="conf-acciones">
                    <button type="button" class="boton-ficha" onclick="window.print()">Imprimir confirmación</button>
                    <a href="mi-reserva.html?codigo=${reserva.codigo}" class="enlace-linea">Ver mi reserva</a>
                    <a href="index.html" class="enlace-linea">Volver al inicio</a>
                </div>

            </div>
        `;
    }

    // ---------- Confirmar reserva ----------

    formReserva.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const error = validarTarjeta();
        if (error) {
            errorTarjeta.textContent = error;
            errorTarjeta.hidden = false;
            errorTarjeta.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        errorTarjeta.hidden = true;

        const opciones = leerOpciones();
        const precio = calcularPrecio(habitacion, entrada, salida, adultos, opciones.idRegimen, opciones.conPack);

        const reserva = {
            codigo: generarCodigo(),
            idHabitacion: habitacion.id,
            nombreHabitacion: habitacion.nombre,
            entrada: entrada,
            salida: salida,
            noches: noches,
            adultos: adultos,
            regimen: precio.regimen.nombre,
            pack: opciones.conPack,
            precioAlojamiento: precio.alojamiento,
            precioComidas: precio.comidas,
            precioPack: precio.pack,
            total: precio.total,
            nombre: document.getElementById("nombre").value,
            email: document.getElementById("email").value,
            telefono: document.getElementById("telefono").value,
            // De la tarjeta solo se guardan la marca y las 4 últimas cifras, nunca el número entero
            tarjeta: {
                marca: detectarMarca(soloNumeros(campoNumero.value)),
                ultimas4: soloNumeros(campoNumero.value).slice(-4)
            },
            cancelacionGratuitaHasta: cancelacionGratuitaVigente(entrada) ? fechaLimiteCancelacion(entrada) : null,
            estado: "confirmada"
        };

        const reservas = obtenerReservas();
        reservas.push(reserva);
        guardarReservas(reservas);

        mostrarConfirmacion(reserva);
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}