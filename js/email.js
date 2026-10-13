// Email de confirmación con EmailJS
// Los datos de la reserva se envían a la API de EmailJS con fetch.
// Documentación: https://www.emailjs.com/docs/rest-api/send/

// Claves de la cuenta de EmailJS
const EMAILJS_PUBLIC_KEY = "TU_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "TU_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "TU_TEMPLATE_ID";

// Envía el email. Devuelve una promesa con true (enviado) o false (error).
function enviarEmailConfirmacion(reserva) {
    let horaSalida = "12:00";
    let nombrePack = "—";
    if (reserva.pack) {
        horaSalida = "15:00";
        nombrePack = packRomantico.nombre;
    }

    let textoAdultos = "1 adulto";
    if (reserva.adultos === 2) {
        textoAdultos = "2 adultos";
    }

    // Estos nombres son las variables {{...}} de plantilla-email.html
    const variables = {
        to_email: reserva.email,
        nombre: reserva.nombre.trim().split(" ")[0],
        nombre_completo: reserva.nombre,
        codigo: reserva.codigo,
        habitacion: reserva.nombreHabitacion,
        llegada: formatearFechaLarga(reserva.entrada),
        salida: formatearFechaLarga(reserva.salida),
        hora_salida: horaSalida,
        noches: textoNoches(reserva.noches),
        adultos: textoAdultos,
        regimen: reserva.regimen,
        pack: nombrePack,
        total: formatearPrecio(reserva.total),
        tarjeta: `${reserva.tarjeta.marca} terminada en ${reserva.tarjeta.ultimas4}`,
        cancelacion: textoCancelacion(reserva.entrada)
    };

    return fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            service_id: EMAILJS_SERVICE_ID,
            template_id: EMAILJS_TEMPLATE_ID,
            user_id: EMAILJS_PUBLIC_KEY,
            template_params: variables
        })
    })
        .then(function (respuesta) {
            // respuesta.ok es true si EmailJS ha aceptado el envío
            return respuesta.ok;
        })
        .catch(function (error) {
            console.error("No se pudo conectar con EmailJS:", error);
            return false;
        });
}
