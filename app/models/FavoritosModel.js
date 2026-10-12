/* Modelo de favoritos: consulta y sincroniza productos guardados. */

function obtenerFavoritos() {

    return JSON.parse(
        localStorage.getItem(
            "favoritosMexa"
        ) || "[]"
    );

}


function obtenerTodosLosProductos() {
    const categorias = getCategoriasBase();
    const productos = [];
    const nombresVistos = new Set();

    categorias.forEach(cat => {
        (cat.productos || []).forEach(p => {
            if (!nombresVistos.has(p.nombre)) {
                nombresVistos.add(p.nombre);
                productos.push(p);
            }
        });
    });

    return productos;
}

/* ---
   Mostrar favoritos: se toman los productos marcados como
   preferidos y se montan tarjetas o listas rápidas.
--- */


async function alternarFavoritoEnAPI(nombre) {
    if (!haySesionActiva() || typeof API === "undefined") return;
    try {
        const datos = await API.favoritoAlternar(nombre);
        guardarFavoritosDesdeAPI(datos.favoritos);
    } catch (e) {
        mostrarNotificacionCarrito("No se pudo guardar el favorito", e.message);
    }
}
