/* Controlador principal: inicializa y coordina los módulos MVC. */





// El arranque espera a que app.js termine de cargar todos los módulos.
document.addEventListener("mercado-mexa:modules-ready", iniciarAplicacion, { once: true });

function iniciarAplicacion() {
    actualizarContador();
    prepararEventos();
    iniciarSplash();
    cargarCatalogoDesdeAPI().then(catalogo => {
        if (catalogo) refrescarCatalogoEnPantalla();
    });
    /* RolesController restaura la sesion y sincroniza datos una sola vez. */
    procesarRetornoMercadoPago();
}

/* Vuelve a pintar el catalogo ya con los datos de la base de datos */
function refrescarCatalogoEnPantalla() {
    const categorias = getCategoriasBase();
    CatalogoView.mostrarEstado(categorias);

    // El controlador coordina el refresco si la vista del catálogo está abierta.
    const modalCatalogo = CatalogoView.obtenerModalAbierto();
    if (modalCatalogo) {
        const tienda = tiendas[0];
        if (tienda) mostrarContenidoCatalogo(modalCatalogo, tienda);
    }
}


