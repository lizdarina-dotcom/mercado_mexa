/* Vista del catálogo: actualiza únicamente elementos de la interfaz. */
window.CatalogoView = (() => {
    function mostrarEstado(categorias) {
        const total = categorias.reduce(
            (suma, categoria) => suma + (categoria.productos || []).length,
            0
        );
        const etiqueta = document.getElementById("estadoCatalogo");

        if (etiqueta) {
            etiqueta.textContent = `Catalogo desde MySQL · ${total} productos · ${categorias.length} categorias`;
            etiqueta.classList.add("catalogo-conectado");
        }
    }

    function obtenerModalAbierto() {
        return document.querySelector(".contenido-modal.catalogo-modal")
            ?.closest(".ventana-modal");
    }

    return { mostrarEstado, obtenerModalAbierto };
})();
function mostrarContenidoCatalogo(
    catalogo,
    tienda
) {

    const categorias =
        getCategoriasBase();


    catalogo.innerHTML = `

        <div
            class="contenido-modal catalogo-modal"
        >

            <button
                class="cerrar-modal"
                onclick="cerrarCatalogo()"
            >
                ×
            </button>


            <!-- ENCABEZADO -->

<!-- ENCABEZADO -->

        <div class="catalogo-encabezado">

    <div class="catalogo-logo">
        Neto
    </div>

    <div>

        <span class="section-label">
            CATÁLOGO
        </span>

        <small id="estadoCatalogo" class="catalogo-origen">
            ${categoriasDesdeAPI && categoriasDesdeAPI.length
                ? "Cargado desde MySQL"
                : "Cargando desde MySQL…"}
        </small>

        <h2>
            ${escapeHTML(tienda.nombre)}
        </h2>

        <p class="catalogo-direccion">

            📍
            ${escapeHTML(tienda.direccion)}

            ·

            ${typeof tienda.distancia === "number" && Number.isFinite(tienda.distancia)
                ? `· ${tienda.distancia.toFixed(2)} km`
                : ""}

        </p>

    </div>

</div>


<!-- BANNER DE PROMOCIONES — OCUPA TODO EL ANCHO -->

<div class="promo-banner promo-banner-catalogo">

    <div class="promo-contenido">

        <div class="promo-icono">🔥</div>

        <div class="promo-texto">
            <span class="promo-etiqueta">OFERTAS DE LA SEMANA</span>
            <strong>Ahorra en tu despensa</strong>
            <p>Tenemos <b id="promoContador">0</b> productos con descuento esperándote.</p>
        </div>

        <button class="promo-btn" id="promoVerOfertas" type="button">
            🎁 VER OFERTAS
        </button>

    </div>

    <div class="promo-shape promo-shape-1"></div>
    <div class="promo-shape promo-shape-2"></div>

</div>
         

            


            <!-- CATEGORÍAS -->

            <div class="categorias-catalogo">

                ${categorias.map(
                    (categoria, index) => `

                    <button
                        type="button"
                        class="categoria-btn"
                        onclick="
                            mostrarCategoria(
                                ${index},
                                this
                            )
                        "
                    >

                        <span>
                            ${categoria.icono}
                        </span>

                        ${categoria.nombre}

                    </button>

                `
                ).join("")}

            </div>


            <!-- PRODUCTOS -->

            <div
                id="catalogoProductos"
                class="catalogo-productos-vacio"
            >

                <div class="catalogo-seleccion">

                    <div class="catalogo-seleccion-icono">
                        🛍️
                    </div>

                    <strong>
                        SELECCIONA UNA CATEGORÍA
                    </strong>

                    <span>
                        Elige una categoría para ver
                        los productos disponibles.
                    </span>

                </div>

            </div>

        </div>

    `;

    // Reconectar el botón de VER OFERTAS (porque el banner es dinámico)
    setTimeout(() => {
        const btnOfertas = document.getElementById("promoVerOfertas");
        if (btnOfertas) {
            btnOfertas.addEventListener("click", () => {
                cerrarCatalogo();
                setTimeout(abrirOfertas, 250);
            });
        }

        // Actualizar el contador del banner cada vez
        if (typeof actualizarContadorOfertas === "function") {
            actualizarContadorOfertas();
        }
    }, 30);

}


/* =========================
   MOSTRAR CATEGORÍA
========================= */

function mostrarCategoria(
    index,
    btn
) {

    const categorias =
        getCategoriasBase();

    const categoria =
        categorias[index];


    if (!categoria)
        return;


    /* Quitar selección */

    document
        .querySelectorAll(
            ".categoria-btn"
        )
        .forEach(b => {

            b.classList.remove(
                "categoria-activa"
            );

        });


    /* Activar categoría */

    btn.classList.add(
        "categoria-activa"
    );


    const contenedor =
        document.getElementById(
            "catalogoProductos"
        );


    if (!contenedor)
        return;


    contenedor.className =
        "catalogo-productos";


    contenedor.innerHTML =
        crearProductosHTML(
            categoria
        );

}


/* =========================
   CREAR PRODUCTOS
========================= */

function crearProductosHTML(
    categoria
) {

    if (
        !categoria ||
        !categoria.productos ||
        !categoria.productos.length
    ) {

        return `

            <div class="empty-stores">

                <strong>
                    NO HAY PRODUCTOS
                </strong>

                <p>
                    No hay productos disponibles.
                </p>

            </div>

        `;

    }


    return categoria.productos
        .map(
            (producto, index) => {

                const favoritos =
                    obtenerFavoritos();

                const favorito =
                    favoritos.includes(
                        producto.nombre
                    );


                return `

                    <div
                        class="producto-catalogo"
                        style="
                            animation-delay:
                            ${index * 65}ms
                        "
                    >

                        <!-- IMAGEN / STICKER -->

                        <div
                            class="producto-imagen"
                        >

                            <div
                                class="
                                    producto-sticker
                                "
                            >
                                ${producto.icono}
                            </div>


                            <!-- CORAZÓN -->

                            <button
                                type="button"
                                class="
                                    producto-favorito
                                    ${favorito
                                        ? "favorito-activo"
                                        : ""
                                    }
                                "
                                onclick="
                                    toggleFavorito(
                                        '${escapeJS(
                                            producto.nombre
                                        )}',
                                        this
                                    )
                                "
                                title="Agregar a favoritos"
                            >

                                ${favorito
                                    ? "♥"
                                    : "♡"
                                }

                            </button>

                        </div>


                        <!-- INFORMACIÓN -->

                        <div
                            class="producto-info"
                        >

                            <strong
                                class="
                                    producto-nombre
                                "
                            >

                                ${escapeHTML(
                                    producto.nombre
                                )}

                            </strong>


                            <span
                                class="
                                    producto-presentacion
                                "
                            >

                                ${escapeHTML(
                                    producto.presentacion
                                    || producto.desc
                                    || ""
                                )}

                            </span>


                            <!-- PRECIO -->

                            <div
                                class="producto-precio"
                            >

                                $${Number(
                                    producto.precio
                                ).toFixed(2)}

                            </div>


                            <!-- ESTRELLAS -->

                            <div
                                class="
                                    producto-calificacion
                                "
                            >

                                <span>
                                    ★★★★★
                                </span>

                                <small>
                                    (${producto.resenas || 120})
                                </small>

                            </div>


                            <!-- CADUCIDAD -->

                            <div
                                class="
                                    producto-caducidad
                                "
                            >

                                📅 CAD

                                <strong>
                                    ${escapeHTML(
                                        producto.caducidad
                                    )}
                                </strong>

                            </div>


                            <!-- LOTE -->

                            <div
                                class="producto-lote"
                            >

                                LOTE:

                                ${escapeHTML(
                                    producto.lote
                                )}

                            </div>


                            <!-- AGREGAR -->

                            <button
                                type="button"
                                class="
                                    btn-naranja
                                    producto-agregar
                                "
                                onclick="
                                    agregarProductoCatalogo(
                                        '${escapeJS(
                                            producto.nombre
                                        )}',
                                        ${Number(
                                            producto.precio
                                        )}
                                    )
                                "
                            >

                                🛒 AGREGAR

                            </button>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


/* =========================
   AGREGAR PRODUCTO
========================= */
function mostrarMensajeCatalogo(
    mensaje
) {

    mostrarNotificacionCatalogo(
        "✓",
        "¡PRODUCTO AGREGADO CORRECTAMENTE!",
        mensaje
    );

}


/* =========================
   MENSAJE FAVORITO
========================= */

function mostrarMensajeFavorito(
    mensaje
) {

    mostrarNotificacionCatalogo(
        "♥",
        "¡AGREGADO A FAVORITOS!",
        mensaje
    );

}


/* =========================
   NOTIFICACIÓN
========================= */

function mostrarNotificacionCatalogo(
    icono,
    titulo,
    texto
) {

    const anterior =
        document.querySelector(
            ".mensaje-producto-agregado"
        );


    if (anterior) {

        anterior.remove();

    }


    const mensajeDiv =
        document.createElement(
            "div"
        );


    mensajeDiv.className =
        "mensaje-producto-agregado";


    mensajeDiv.innerHTML = `

        <div
            class="
                mensaje-producto-icono
            "
        >
            ${icono}
        </div>

        <div>

            <strong>
                ${titulo}
            </strong>

            <span>
                ${escapeHTML(
                    texto
                )}
            </span>

        </div>

    `;


    document.body.appendChild(
        mensajeDiv
    );


    setTimeout(() => {

        mensajeDiv.classList.add(
            "mostrar"
        );

    }, 20);


    setTimeout(() => {

        mensajeDiv.classList.remove(
            "mostrar"
        );


        setTimeout(() => {

            mensajeDiv.remove();

        }, 300);

    }, 2500);

}


/* =========================
   CERRAR CATÁLOGO
========================= */


