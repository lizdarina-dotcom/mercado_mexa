/* Controlador de ofertas: actualiza avisos y abre la selección. */

function actualizarContadorOfertas() {
    const total = obtenerProductosEnOferta().length;

    const banner = document.getElementById("promoContador");
    if (banner) banner.textContent = total;
}
/* =====================================================
   CERRAR MODAL DE OFERTAS
===================================================== */

function cerrarOfertas() {
    const modal = document.getElementById("modalOfertas");
    if (modal) {
        modal.classList.remove("activa");
    }
}

/* =====================================================
   INICIALIZAR EVENTOS DE OFERTAS
   (se ejecuta al cargar la página)
===================================================== */

/* ---
   Modal de ofertas: recoge productos en descuento y los
   pinta en pantalla para promocionar la semana.
--- */

function iniciarModuloOfertas() {

    // Botón X del modal de ofertas
    document
        .getElementById("cerrarOfertas")
        ?.addEventListener("click", cerrarOfertas);

    // Cerrar al hacer clic en el fondo oscuro
    document
        .getElementById("modalOfertas")
        ?.addEventListener("click", (e) => {
            if (e.target.id === "modalOfertas") {
                cerrarOfertas();
            }
        });

    // Cerrar al presionar la tecla ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const modal = document.getElementById("modalOfertas");
            if (modal?.classList.contains("activa")) {
                cerrarOfertas();
            }
        }
    });
}

// Arrancar cuando el DOM esté listo
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarModuloOfertas);
} else {
    iniciarModuloOfertas();
}
