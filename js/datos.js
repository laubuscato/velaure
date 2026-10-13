// Datos y funciones compartidas
// Lo usan habitaciones.html y reserva.html

// ---------- Habitaciones ----------

// "precio" es el precio por noche en temporada baja, para 2 adultos

const habitaciones = [
    {
        id: "brisa",
        nombre: "Brisa",
        capacidad: 2,
        precio: 240,
        imagen: "img/brisa.webp",
        descripcion: "Se abre a un patio de olivos centenarios. Lino blanco, luz de mañana y el rumor del jardín."
    },
    {
        id: "mirador",
        nombre: "Mirador",
        capacidad: 2,
        precio: 290,
        imagen: "img/mirador.webp",
        descripcion: "Un gran arco encalado enmarca el mar. Cortinas de lino que mueve la tramontana."
    },
    {
        id: "posidonia",
        nombre: "Posidonia",
        capacidad: 2,
        precio: 360,
        imagen: "img/posidonia.webp",
        descripcion: "Bañera de piedra frente a la ventana y un rincón de lectura con vistas a la cala."
    },
    {
        id: "pinar",
        nombre: "Pinar",
        capacidad: 2,
        precio: 690,
        imagen: "img/pinar.webp",
        descripcion: "Terraza propia entre pinos, piscina privada y cenas al atardecer frente al mar."
    },
    {
        id: "cala",
        nombre: "Cala",
        capacidad: 2,
        precio: 520,
        imagen: "img/cala.webp",
        descripcion: "Excavada en la roca viva, con piscina privada suspendida sobre el agua. La joya de Velaure."
    }
];

// ---------- Tarifas ----------

// Uso individual: con 1 adulto la habitación cuesta un 15 % menos
const DESCUENTO_INDIVIDUAL = 0.15;

// Regímenes: el precio es por persona y noche
const regimenes = [
    {
        id: "solo",
        nombre: "Solo alojamiento",
        descripcion: "La habitación, sin comidas incluidas.",
        precioPersonaNoche: 0
    },
    {
        id: "desayuno",
        nombre: "Alojamiento y desayuno",
        descripcion: "Desayuno mediterráneo servido en la terraza frente al mar.",
        precioPersonaNoche: 40
    },
    {
        id: "media",
        nombre: "Media pensión",
        descripcion: "Desayuno y cena de mercado con el pescado del día.",
        precioPersonaNoche: 95
    }
];

// Oferta especial: precio fijo por estancia
const packRomantico = {
    id: "romantico",
    nombre: "Pack Romántico",
    precio: 220,
    incluye: [
        "Botella de cava del Empordà y fresas a la llegada",
        "Masaje en pareja de 60 minutos en el spa de piedra",
        "Salida tardía hasta las 15:00"
    ],
    adultosNecesarios: 2,
    nochesMinimas: 2
};

// Temporadas: el precio sube según el mes de la noche
//   Alta  (junio a septiembre):  +60 %
//   Media (abril, mayo, octubre): +25 %
//   Baja  (resto del año):        precio base
function subidaTemporada(mes) {
    if (mes >= 6 && mes <= 9) {
        return 1.6;
    }
    if (mes === 4 || mes === 5 || mes === 10) {
        return 1.25;
    }
    return 1;
}

// Precio de una noche según el mes (1 = enero) y los adultos
function precioPorNoche(habitacion, adultos, mes) {
    let precio = habitacion.precio * subidaTemporada(mes);

    if (adultos === 1) {
        precio = precio * (1 - DESCUENTO_INDIVIDUAL);
    }

    return Math.round(precio);
}

// Precio más barato del año (temporada baja), para el "Desde ... / noche"
function precioDesde(habitacion, adultos) {
    return precioPorNoche(habitacion, adultos, 1);
}

// Suma el precio de cada noche de la estancia, una a una,
// porque una estancia puede empezar en una temporada y acabar en otra
function precioAlojamiento(habitacion, entrada, salida, adultos) {
    const noches = nochesEntre(entrada, salida);
    const dia = new Date(entrada + "T00:00:00");
    let total = 0;

    for (let i = 0; i < noches; i++) {
        total += precioPorNoche(habitacion, adultos, dia.getMonth() + 1);
        dia.setDate(dia.getDate() + 1);
    }

    return total;
}

// ¿Se puede añadir el Pack Romántico a esta estancia?
function packDisponible(adultos, noches) {
    return adultos === packRomantico.adultosNecesarios && noches >= packRomantico.nochesMinimas;
}

// Calcula todo el desglose del precio de una estancia
function calcularPrecio(habitacion, entrada, salida, adultos, idRegimen, conPack) {
    const noches = nochesEntre(entrada, salida);

    const regimen = regimenes.find(function (r) {
        return r.id === idRegimen;
    });

    const alojamiento = precioAlojamiento(habitacion, entrada, salida, adultos);
    const comidas = regimen.precioPersonaNoche * adultos * noches;
    const pack = conPack ? packRomantico.precio : 0;

    return {
        alojamiento: alojamiento,
        regimen: regimen,
        comidas: comidas,
        pack: pack,
        total: alojamiento + comidas + pack
    };
}

// ---------- Cancelación ----------

// Se puede cancelar gratis hasta 7 días antes de la llegada
const DIAS_CANCELACION_GRATUITA = 7;

// "2026-10-10" -> "2026-10-03" (7 días antes)
function fechaLimiteCancelacion(entrada) {
    const fecha = new Date(entrada + "T00:00:00");
    fecha.setDate(fecha.getDate() - DIAS_CANCELACION_GRATUITA);
    return aTextoISO(fecha);
}

// ¿Todavía se está a tiempo de cancelar gratis?
function cancelacionGratuitaVigente(entrada) {
    return aTextoISO(new Date()) <= fechaLimiteCancelacion(entrada);
}

// Texto para mostrar al huésped
function textoCancelacion(entrada) {
    if (cancelacionGratuitaVigente(entrada)) {
        return `Cancelación gratuita hasta el ${formatearFechaLarga(fechaLimiteCancelacion(entrada))}`;
    }
    return "Esta reserva no admite cancelación gratuita (llegada en menos de 7 días)";
}

// ---------- Reservas (localStorage) ----------

function obtenerReservas() {
    return JSON.parse(localStorage.getItem("reservas")) || [];
}

function guardarReservas(reservas) {
    localStorage.setItem("reservas", JSON.stringify(reservas));
}

// Crea un código como VLR-2026-0001
function generarCodigo() {
    const contador = Number(localStorage.getItem("contadorReservas")) + 1;
    localStorage.setItem("contadorReservas", contador);

    const anio = new Date().getFullYear();
    const numero = String(contador).padStart(4, "0");

    return `VLR-${anio}-${numero}`;
}

// ¿Está libre la habitación en esas fechas? (fechas en texto "2026-10-12")
function estaDisponible(idHabitacion, entrada, salida) {
    const reservas = obtenerReservas();

    const haySolape = reservas.some(function (reserva) {
        return reserva.idHabitacion === idHabitacion &&
               reserva.estado === "confirmada" &&
               entrada < reserva.salida &&
               salida > reserva.entrada;
    });

    return !haySolape;
}

// ---------- Utilidades ----------

// "2026-10-12" -> "12/10/2026"
function formatearFecha(texto) {
    const partes = texto.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// "2026-10-03" -> "3 de octubre de 2026"
function formatearFechaLarga(texto) {
    const fecha = new Date(texto + "T00:00:00");
    return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

// Date -> "2026-10-12" (usando la hora local, no la UTC)
function aTextoISO(fecha) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

// Noches entre dos fechas en texto "2026-10-12"
function nochesEntre(entrada, salida) {
    const milisegundosPorDia = 1000 * 60 * 60 * 24;
    return Math.round((new Date(salida) - new Date(entrada)) / milisegundosPorDia);
}

// 1 -> "1 noche", 3 -> "3 noches"
function textoNoches(noches) {
    return noches === 1 ? "1 noche" : `${noches} noches`;
}

// 1140 -> "1.140 €"
function formatearPrecio(cantidad) {
    return cantidad.toLocaleString("es-ES") + " €";
}