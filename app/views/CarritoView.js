/* Vista de carrito: dibuja la lista, el contador y sus avisos. */

function renderLista() {
    const cont = document.getElementById("contenidoLista");
    if (!cont) return;

    if (!carrito.length) {
        cont.innerHTML = `
            <div class="lista-vacia">
                <div class="lista-vacia-icono">🛒</div>
                <strong>Tu lista está lista para empezar</strong>
                <p>Presiona el botón <strong>✨ LISTA SEMANAL</strong> para generar tu despensa automática con comparativa de precios, o agrega productos desde el catálogo.</p>
            </div>
        `;
        return;
    }

    const totalProductos = carrito.reduce((suma, producto) => suma + (producto.cantidad || 1), 0);
    const totalPagar = carrito.reduce((suma, producto) => suma + (producto.precio * (producto.cantidad || 1)), 0);

    const ahorroTotal = carrito.reduce((suma, p) => {
        const comp = p.comparativaTiendas || generarComparativaTiendas(p.precio, p.nombre);
        const max = Math.max(...comp.map(t => t.precio));
        const min = Math.min(...comp.map(t => t.precio));
        return suma + Math.max(0, (max - min) * (p.cantidad || 1));
    }, 0);

    const grupos = carrito.reduce((resultado, producto, indice) => {
        const categoria = categoriaDeProducto(producto);
        (resultado[categoria] ||= []).push({ producto, indice });
        return resultado;
    }, {});

    const categorias = ordenCategoriasLista.filter(categoria => grupos[categoria]);

    cont.innerHTML = `
        <div class="lista-categorias">
            ${categorias.map(categoria => `
                <section class="grupo-lista">
                    <h3>${iconosCategoriasLista[categoria] || '🛒'} ${escapeHTML(categoria)} <small>${grupos[categoria].length} productos</small></h3>
                    ${grupos[categoria].map(({ producto, indice }) => {
                        const comp = producto.comparativaTiendas || generarComparativaTiendas(producto.precio, producto.nombre);
                        const tiendaBarata = comp.find(t => t.masBarato) || comp[0];
                        const tiendaCara = comp.find(t => t.masCaro) || comp[comp.length - 1];
                        const tiendaActual = producto.tiendaSeleccionada || (tiendaBarata ? tiendaBarata.tienda : comp[0].tienda);

                        return `
                        <article class="item-lista">
                            <div class="item-lista-icono">
                                ${producto.icono || '🛒'}
                            </div>

                            <div class="item-lista-info">
                                <div class="item-lista-header">
                                    <strong class="item-lista-nombre">${escapeHTML(producto.nombre)}</strong>
                                    ${producto.enOferta ? `
                                        <span class="badge-oferta">
                                            🔥 ${escapeHTML(producto.etiquetaOferta || '¡OFERTA!')}
                                        </span>
                                    ` : ''}
                                </div>

                                <div class="item-lista-meta">
                                    ${producto.caducidad ? `
                                        <span class="badge-caducidad" title="Fecha de caducidad">
                                            📅 Cad: <strong>${escapeHTML(producto.caducidad)}</strong>
                                        </span>
                                    ` : ''}
                                    ${producto.presentacion ? `
                                        <span class="badge-presentacion">${escapeHTML(producto.presentacion)}</span>
                                    ` : ''}
                                </div>

                                <div class="item-lista-precios">
                                    ${producto.enOferta && producto.precioRegular ? `
                                        <span class="precio-tachado">${formatearPrecio(producto.precioRegular)}</span>
                                    ` : ''}
                                    <span class="precio-actual">${formatearPrecio(producto.precio)} c/u</span>
                                    <span class="precio-tienda-elegida" title="Tienda seleccionada para este producto">
                                        🏪 Tienda: <strong>${escapeHTML(tiendaActual)}</strong>
                                    </span>
                                    <span class="precio-subtotal">· Total: <strong>${formatearPrecio(producto.precio * (producto.cantidad || 1))}</strong></span>
                                </div>

                                <div class="comparativa-tiendas-contenedor">
                                    <div class="comparativa-instruccion">
                                        👆 <em>Selecciona la tienda donde deseas comprar este producto:</em>
                                    </div>

                                    <div class="comparativa-resumen">
                                        <button type="button" 
                                            class="tienda-tag tienda-barata ${tiendaActual === tiendaBarata.tienda ? 'tag-activo' : ''}"
                                            onclick="seleccionarTiendaProducto(${indice}, '${escapeJS(tiendaBarata.tienda)}', ${tiendaBarata.precio})"
                                            title="Elegir tienda más barata: ${escapeHTML(tiendaBarata.tienda)} ($${tiendaBarata.precio.toFixed(2)})">
                                            🟢 <strong>Más barato:</strong> ${escapeHTML(tiendaBarata.tienda)} <b class="tag-precio">${formatearPrecio(tiendaBarata.precio)}</b>
                                            ${tiendaActual === tiendaBarata.tienda ? '<span class="tag-check" title="Tienda elegida">✓</span>' : '<span class="tag-accion">Elegir</span>'}
                                        </button>

                                        <button type="button" 
                                            class="tienda-tag tienda-cara ${tiendaActual === tiendaCara.tienda ? 'tag-activo' : ''}"
                                            onclick="seleccionarTiendaProducto(${indice}, '${escapeJS(tiendaCara.tienda)}', ${tiendaCara.precio})"
                                            title="Elegir ${escapeHTML(tiendaCara.tienda)} ($${tiendaCara.precio.toFixed(2)})">
                                            🔴 <strong>Más caro:</strong> ${escapeHTML(tiendaCara.tienda)} <b class="tag-precio">${formatearPrecio(tiendaCara.precio)}</b>
                                            ${tiendaActual === tiendaCara.tienda ? '<span class="tag-check" title="Tienda elegida">✓</span>' : '<span class="tag-accion">Elegir</span>'}
                                        </button>
                                    </div>
                                    
                                    <details class="comparativa-desglose" ${detallesTiendaAbiertos[indice] ? 'open' : ''} ontoggle="detallesTiendaAbiertos[${indice}] = this.open">
                                        <summary>🔍 Comparar y elegir tienda (${comp.length} opciones)</summary>
                                        <div class="comparativa-lista">
                                            ${comp.map(t => {
                                                const esSeleccionada = (t.tienda === tiendaActual);
                                                return `
                                                <button type="button" 
                                                    class="comparativa-fila ${esSeleccionada ? 'fila-seleccionada' : ''} ${t.masBarato ? 'fila-barata' : (t.masCaro ? 'fila-cara' : '')}"
                                                    onclick="seleccionarTiendaProducto(${indice}, '${escapeJS(t.tienda)}', ${t.precio})"
                                                    title="Seleccionar ${escapeHTML(t.tienda)} por ${formatearPrecio(t.precio)}"
                                                >
                                                    <span class="nombre-tienda">
                                                        ${esSeleccionada ? '✓ ' : ''}${t.masBarato ? '🟢 ' : (t.masCaro ? '🔴 ' : '🏪 ')}${escapeHTML(t.tienda)}
                                                    </span>
                                                    <span class="precio-tienda">
                                                        <strong>${formatearPrecio(t.precio)}</strong>
                                                        ${esSeleccionada ? '<span class="tag-seleccionada">Elegida ✓</span>' : (t.masBarato ? '<small class="tag-mejor">Mejor precio</small>' : (t.masCaro ? '<small class="tag-caro">Más caro</small>' : '<small class="tag-elegir">Elegir</small>'))}
                                                    </span>
                                                </button>
                                                `;
                                            }).join("")}
                                        </div>
                                    </details>
                                </div>
                            </div>

                            <div class="item-lista-acciones">
                                <div class="qty" aria-label="Cantidad">
                                    <button type="button" onclick="cambiarCantidad(${indice}, -1)" aria-label="Quitar una unidad">−</button>
                                    <strong>${producto.cantidad || 1}</strong>
                                    <button type="button" onclick="cambiarCantidad(${indice}, 1)" aria-label="Agregar una unidad">+</button>
                                </div>
                                <button class="eliminar-lista" type="button" onclick="eliminarDeLista(${indice})" aria-label="Eliminar ${escapeHTML(producto.nombre)}">×</button>
                            </div>
                        </article>
                        `;
                    }).join("")}
                </section>
            `).join("")}
        </div>

        <div class="total-productos-lista">
            ${ahorroTotal > 0 ? `
                <div class="resumen-ahorro-banner">
                    <div class="icono-ahorro">💡</div>
                    <div class="texto-ahorro">
                        <strong>Comparativa Inteligente de Despensa</strong>
                        <p>Comprando en las tiendas más económicas ahorras aproximadamente <strong>${formatearPrecio(ahorroTotal)}</strong> frente a las opciones más caras.</p>
                    </div>
                </div>
            ` : ''}
            <div class="totales-grid">
                <div>
                    <span>PRODUCTOS EN TU LISTA</span>
                    <strong>${totalProductos} piezas (${carrito.length} artículos)</strong>
                </div>
                <div class="total-pagar-lista">
                    <span>TOTAL ESTIMADO</span>
                    <strong>${formatearPrecio(totalPagar)}</strong>
                </div>
            </div>
            <div class="lista-checkout-actions">
                <button type="button" class="btn-naranja" onclick="abrirCheckoutLista()">
                    ¿Cómo quieres tu pedido?
                </button>
            </div>
        </div>
    `;
}

/* ---
   Proceso de pago: junta la lista, valida la tienda,
   muestra la dirección, opciones de envío y el resumen
   final antes de confirmar la compra.
--- */


function mostrarNotificacionCarrito(titulo, mensaje) {
    if (typeof mostrarNotificacionCuenta === "function") {
        mostrarNotificacionCuenta(titulo, mensaje, "⚠️");
    } else {
        console.warn(`[carrito] ${titulo}: ${mensaje}`);
    }
}

/* =========================
   PEDIDOS CONECTADOS A LA BD
========================= */

/* Convierte la respuesta del servidor al formato que usa el JS */

function actualizarContador() {

    const total =
        carrito.reduce(
            (s, p) =>
                s + p.cantidad,
            0
        );


    if (contadorLista)
        contadorLista.textContent =
            total;


    if (sidebarContador)
        sidebarContador.textContent =
            total;

}


/* =========================
   MOSTRAR LISTA
========================= */


function renderListaLegacy() {

    const cont =
        document.getElementById(
            "contenidoLista"
        );


    if (!cont)
        return;


    if (!carrito.length) {

        cont.innerHTML = `

            <div class="empty-stores">

                <strong>
                    🛒 TU LISTA ESTÁ VACÍA
                </strong>

                <p>
                    Entra a una tienda y agrega productos para comenzar.
                </p>

            </div>

        `;

        return;

    }


    cont.innerHTML =

        carrito
            .map(
                (p, i) => `

                <div class="item-lista">

                    <div class="item-lista-info">

                        <strong>
                            ${escapeHTML(
                                p.nombre
                            )}
                        </strong>

                        <br>

                        <small>

                            $${p.precio.toFixed(2)}

                            ×

                            ${p.cantidad}

                            =

                            $${(
                                p.precio *
                                p.cantidad
                            ).toFixed(2)}

                        </small>

                    </div>


                    <div class="qty">

                        <button
                            onclick="
                                cambiarCantidad(
                                    ${i},
                                    -1
                                )
                            "
                        >
                            −
                        </button>


                        <strong>
                            ${p.cantidad}
                        </strong>


                        <button
                            onclick="
                                cambiarCantidad(
                                    ${i},
                                    1
                                )
                            "
                        >
                            +
                        </button>


                        <button
                            class="delete"
                            onclick="
                                eliminarDeLista(
                                    ${i}
                                )
                            "
                        >
                            ×
                        </button>

                    </div>

                </div>

            `
            )
            .join("")

        +

        `

            <div class="total-lista">

                TOTAL:

                $${carrito
                    .reduce(
                        (s, p) =>
                            s +
                            p.precio *
                            p.cantidad,
                        0
                    )
                    .toFixed(2)}

            </div>

        `;

}


/* =========================
   CANTIDAD
========================= */


function formatearPrecio(precio) {
    return `$${Number(precio).toFixed(2)}`;
}
