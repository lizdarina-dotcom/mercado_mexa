/* Controlador de búsqueda: abre el resultado elegido por el usuario. */

function abrirResultadoProducto(resultado) {
    const tienda = tiendas[0];
    if (!tienda) return;

    const catalogo = abrirCatalogo(tienda);
    const buscador = document.getElementById("buscador");
    const resultados = document.getElementById("buscadorResultados");
    buscador?.blur();
    resultados?.classList.remove("visible");

    setTimeout(() => {
        const categorias = getCategoriasBase();
        const indice = categorias.findIndex(categoria => categoria.nombre === resultado.categoria.nombre);
        const boton = document.querySelectorAll(".categoria-btn")[indice];
        if (boton) mostrarCategoria(indice, boton);
    }, 1400);

    return catalogo;
}
