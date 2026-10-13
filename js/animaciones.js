// Busca todos los elementos que deben aparecer al hacer scroll
const elementos = document.querySelectorAll(".aparecer");

// El "observador" avisa cuando un elemento entra en la pantalla
const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
            entrada.target.classList.add("visible");
            observador.unobserve(entrada.target);
        }
    });
}, { threshold: 0.05 });

elementos.forEach(function (elemento) {
    observador.observe(elemento);
});