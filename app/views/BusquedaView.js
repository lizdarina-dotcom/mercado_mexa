/* Vista de búsqueda: presenta sugerencias y resultados del catálogo. */

function actualizarResultadosBusqueda(texto) {
    const resultados = document.getElementById("buscadorResultados");
    if (!resultados) return [];

    if (!normalizarBusqueda(texto)) {
        resultados.innerHTML = "";
        resultados.classList.remove("visible");
        return [];
    }

    const productos = obtenerResultadosProductos(texto).slice(0, 8);
    resultados.innerHTML = productos.length
        ? productos.map((resultado, indice) => `
            <button class="buscador-resultado" type="button" data-resultado="${indice}">
                <strong>${escapeHTML(resultado.producto.nombre)}</strong>
                <small>${formatearPrecio(obtenerMejorPrecio(resultado.producto).precio)} · ${escapeHTML(obtenerMejorPrecio(resultado.producto).tienda)}</small>
            </button>
        `).join("")
        : `<small class="buscador-resultado">No encontramos ese producto.</small>`;

    resultados.querySelectorAll("[data-resultado]").forEach((boton, indice) => {
        boton.addEventListener("click", () => abrirResultadoProducto(productos[indice]));
    });
    resultados.classList.add("visible");
    return productos;
}

/* =========================
   EVENTOS
========================= */
