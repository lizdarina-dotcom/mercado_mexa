/* Vista de favoritos: dibuja tarjetas y estados de favoritos. */

function renderFavoritos() {
    const modal = document.getElementById("modalFavoritos");
    if (!modal) return;

    const favoritosNombres = obtenerFavoritos();
    const todosLosProductos = obtenerTodosLosProductos();
    const productosFavoritos = todosLosProductos.filter(p => favoritosNombres.includes(p.nombre));

    if (!productosFavoritos.length) {
        modal.innerHTML = `
            <div class="contenido-modal lista-modal" style="text-align:center;">
                <button class="cerrar-modal" onclick="cerrarFavoritos()" type="button">×</button>
                <span class="section-label" style="color:#ff315b;">TUS PREFERIDOS</span>
                <h2 style="margin:8px 0 16px;">❤️ MIS FAVORITOS</h2>
                <div class="lista-vacia" style="margin-top:10px;">
                    <div class="lista-vacia-icono" style="background:#ffe8ee;font-size:24px;">❤️</div>
                    <strong>Aún no tienes productos favoritos</strong>
                    <p>Explora el catálogo y presiona el corazón en los productos que más te gusten para tenerlos guardados aquí.</p>
                    <button class="btn-naranja" style="margin-top:16px;min-height:36px;padding:0 20px;" onclick="cerrarFavoritos(); entrarTiendaDemo();" type="button">
                        🛍️ EXPLORAR CATÁLOGO
                    </button>
                </div>
            </div>
        `;
        return;
    }

    modal.innerHTML = `
        <div class="contenido-modal catalogo-modal favoritos-modal">
            <button class="cerrar-modal" onclick="cerrarFavoritos()" type="button">×</button>

            <div class="catalogo-encabezado" style="margin-bottom:14px;">
                <div class="catalogo-logo" style="background:#ff315b;box-shadow:0 6px 15px rgba(255,49,91,.25);">
                    ❤️
                </div>
                <div>
                    <span class="section-label" style="color:#ff315b;">TUS PREFERIDOS</span>
                    <h2>MIS FAVORITOS (${productosFavoritos.length})</h2>
                    <p class="catalogo-direccion">
                        Productos guardados para agregarlos rápidamente a tu lista de compra.
                    </p>
                </div>
            </div>

            <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
                <button type="button" class="btn-naranja" style="padding:10px 18px;font-size:10px;font-weight:900;border-radius:8px;" onclick="agregarTodosFavoritos()">
                    🛒 AGREGAR TODOS A MI LISTA
                </button>
                <button type="button" class="btn-outline" style="padding:10px 18px;font-size:10px;font-weight:900;border-radius:8px;" onclick="vaciarFavoritos()">
                    🗑️ VACIAR FAVORITOS
                </button>
            </div>

            <div class="catalogo-productos">
                ${crearProductosFavoritosHTML(productosFavoritos)}
            </div>
        </div>
    `;
}


function crearProductosFavoritosHTML(productos) {
    return productos.map((producto, index) => {
        return `
            <div
                class="producto-catalogo"
                style="animation-delay: ${index * 40}ms"
            >
                <div class="producto-imagen">
                    <div class="producto-sticker">
                        ${producto.icono}
                    </div>

                    <button
                        type="button"
                        class="producto-favorito favorito-activo"
                        onclick="toggleFavorito('${escapeJS(producto.nombre)}', this)"
                        title="Quitar de favoritos"
                    >
                        ♥
                    </button>
                </div>

                <div class="producto-info">
                    <strong class="producto-nombre">
                        ${escapeHTML(producto.nombre)}
                    </strong>

                    <span class="producto-presentacion">
                        ${escapeHTML(producto.presentacion || producto.desc || "")}
                    </span>

                    <div class="producto-precio">
                        $${Number(producto.precio).toFixed(2)}
                    </div>

                    <div class="producto-calificacion">
                        <span>★★★★★</span>
                        <small>(${producto.resenas || 120})</small>
                    </div>

                    <div class="producto-caducidad">
                        📅 CAD <strong>${escapeHTML(producto.caducidad)}</strong>
                    </div>

                    <div class="producto-lote">
                        LOTE: ${escapeHTML(producto.lote)}
                    </div>

                    <button
                        type="button"
                        class="btn-naranja producto-agregar"
                        onclick="agregarProductoCatalogo('${escapeJS(producto.nombre)}', ${Number(producto.precio)})"
                    >
                        🛒 AGREGAR
                    </button>
                </div>
            </div>
        `;
    }).join("");
}


function pintarCorazonesFavoritos() {
    document.querySelectorAll(".producto-favorito").forEach(boton => {
        const coincidencia = (boton.getAttribute("onclick") || "").match(/toggleFavorito\('(.*?)'/);
        if (!coincidencia) return;

        const nombre = coincidencia[1].replace(/\\'/g, "'");
        const activo = favoritosMexa.includes(nombre);

        boton.classList.toggle("favorito-activo", activo);
        boton.textContent = activo ? "♥" : "♡";
    });
}

/* Refleja en la BD el cambio de un favorito */
