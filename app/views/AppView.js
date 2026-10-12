/* Vista general: pantalla de carga y elementos DOM compartidos. */

function iniciarSplash() {
    const splash = document.getElementById("splash");
    const app = document.getElementById("app");
    const bar = document.getElementById("progressBar");
    const percent = document.getElementById("progressPercent");
    const estado = document.getElementById("progressEstado");
    const texto = document.getElementById("splashTexto");

    const pasos = [
        { p: 18, t: "Preparando tu mercado...", e: "INICIANDO" },
        { p: 42, t: "Activando mapa interactivo...", e: "MAPA" },
        { p: 68, t: "Preparando búsqueda de tiendas...", e: "TIENDAS NETO" },
        { p: 88, t: "Listo para encontrar tu tienda...", e: "GPS" },
        { p: 100, t: "¡Todo listo!", e: "LISTO" }
    ];

    let i = 0;

    const avanzar = () => {
        const paso = pasos[i];

        bar.style.width = `${paso.p}%`;
        percent.textContent = `${paso.p}%`;
        estado.textContent = paso.e;
        texto.textContent = paso.t;

        if (i < pasos.length - 1) {
            i++;
            setTimeout(avanzar, 430);
        } else {
            setTimeout(() => {
                splash.classList.add("oculto");
                app.classList.add("visible");

                setTimeout(() => {
                    obtenerUbicacion();
                }, 250);

            }, 550);
        }
    };


    setTimeout(avanzar, 300);
}   // ← AQUÍ cierra iniciarSplash


function escapeHTML(text) {

    return String(text)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeJS(text) {

    return String(text)

        .replaceAll(
            "\\",
            "\\\\"
        )

        .replaceAll(
            "'",
            "\\'"
        );

}


// ========================================
// ASISTENTE NETO
// ========================================

/* =====================================================
   ASISTENTE NETO
   Aquí el bot ayuda al usuario a armar una lista de compra
   con presupuesto, ofertas y productos esenciales.
===================================================== */


const estadoUbicacion = document.getElementById("estadoUbicacion");
const listaTiendas = document.getElementById("listaTiendas");
const distanciaCercana = document.getElementById("distanciaCercana");
const storesStatus = document.getElementById("storesStatus");
const contadorLista = document.getElementById("contadorLista");
const sidebarContador = document.getElementById("sidebarContador");
