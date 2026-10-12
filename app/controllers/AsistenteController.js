/* Controlador del asistente: coordina recomendaciones y presupuesto. */

function abrirAsistenteNeto() {

    const existente =
        document.getElementById("modalAsistenteNeto");

    if (existente) {
        existente.remove();
    }

    const modal =
        document.createElement("div");

    modal.id =
        "modalAsistenteNeto";

    modal.className =
        "modal-asistente-neto";

    modal.innerHTML = `

        <div class="asistente-contenido">

            <button
                class="asistente-cerrar"
                type="button"
                onclick="cerrarAsistenteNeto()"
            >
                ×
            </button>

            <div class="asistente-icono">
                ✨
            </div>

            <h2>
                Asistente MERCADOMEXA!!!!
            </h2>

            <p>
                Hola 👋<br>
                Te ayudaré a preparar tu despensa
                de acuerdo con tu presupuesto.
            </p>

            <div class="asistente-mensaje">

                🛒 Primero dime cuánto dinero tienes
                disponible para tu despensa.

            </div>

            <div class="asistente-presupuesto">

                <label for="presupuestoAsistente">
                    💰 Tu presupuesto
                </label>

                <div class="campo-dinero">

                    <span>$</span>

                    <input
                        type="number"
                        id="presupuestoAsistente"
                        placeholder="500"
                        min="1"
                        step="1"
                    >

                </div>

            </div>

            <button
                type="button"
                class="boton-generar-despensa"
                onclick="generarDespensaConPresupuesto()"
            >
                🛒 GENERAR MI DESPENSA
            </button>

        </div>

    `;

    document.body.appendChild(modal);


    modal.addEventListener(
        "click",
        function(evento) {

            if (evento.target === modal) {
                cerrarAsistenteNeto();
            }

        }
    );


    setTimeout(() => {

        const input =
            document.getElementById(
                "presupuestoAsistente"
            );

        if (input) {
            input.focus();
        }

    }, 100);

}


function cerrarAsistenteNeto() {

    const modal =
        document.getElementById(
            "modalAsistenteNeto"
        );

    if (modal) {
        modal.remove();
    }

}

// ========================================
// GENERAR DESPENSA SEGÚN PRESUPUESTO
// ========================================


function generarDespensaConPresupuesto() {

    const input =
        document.getElementById(
            "presupuestoAsistente"
        );

    if (!input)
        return;


    const presupuesto =
        Number(input.value);


    // ==============================
    // VALIDAR PRESUPUESTO
    // ==============================

    if (
        !Number.isFinite(presupuesto) ||
        presupuesto <= 0
    ) {

        alert(
            "Por favor escribe un presupuesto válido."
        );

        input.focus();

        return;

    }


    // ==============================
    // OBTENER PRODUCTOS DEL CATÁLOGO
    // ==============================

    const categorias =
        getCategoriasBase();


    const productos = [];


    categorias.forEach(
        categoria => {

            (categoria.productos || [])
                .forEach(
                    producto => {

                        productos.push({

                            ...producto,

                            categoria:
                                categoria.nombre

                        });

                    }
                );

        }
    );


    // ==============================
    // CATEGORÍAS IMPORTANTES
    // ==============================

    const categoriasPrioridad = [

        "ABARROTES",

        "LÁCTEOS",

        "FRUTAS Y VERDURAS",

        "PAN Y TORTILLAS",

        "BEBIDAS",

        "LIMPIEZA"

    ];


    let seleccionados = [];

    let total = 0;


    // ==============================
    // ELEGIR UN PRODUCTO POR CATEGORÍA
    // ==============================

    for (
        const nombreCategoria
        of categoriasPrioridad
    ) {

        const disponibles =
            productos.filter(
                producto =>
                    producto.categoria ===
                    nombreCategoria
                    &&
                    total +
                    Number(producto.precio)
                    <=
                    presupuesto
            );


        if (!disponibles.length)
            continue;


        // Elegimos un producto económico
        // para poder cubrir más categorías

        disponibles.sort(
            (a, b) =>
                Number(a.precio) -
                Number(b.precio)
        );


        const producto =
            disponibles[0];


        seleccionados.push(
            {
                ...producto,
                cantidad: 1
            }
        );


        total +=
            Number(
                producto.precio
            );

    }


    // ==============================
    // COMPLETAR LA DESPENSA
    // ==============================

    let disponiblesRestantes =
        productos.filter(
            producto =>
                !seleccionados.some(
                    seleccionado =>
                        seleccionado.nombre ===
                        producto.nombre
                )
                &&
                total +
                Number(producto.precio)
                <=
                presupuesto
        );


    // Agregamos productos mientras
    // todavía haya dinero disponible

    while (
        disponiblesRestantes.length
    ) {

        disponiblesRestantes.sort(
            (a, b) =>
                Number(a.precio) -
                Number(b.precio)
        );


        const posibles =
            disponiblesRestantes.filter(
                producto =>
                    total +
                    Number(producto.precio)
                    <=
                    presupuesto
            );


        if (!posibles.length)
            break;


        // Elegimos uno de los productos
        // que todavía caben en el presupuesto

        const producto =
            posibles[
                Math.floor(
                    Math.random() *
                    Math.min(
                        posibles.length,
                        8
                    )
                )
            ];


        seleccionados.push(
            {
                ...producto,
                cantidad: 1
            }
        );


        total +=
            Number(
                producto.precio
            );


        disponiblesRestantes =
            disponiblesRestantes.filter(
                productoDisponible =>
                    productoDisponible.nombre !==
                    producto.nombre
            );

    }


    // ==============================
    // SI NO SE PUDO GENERAR
    // ==============================

    if (!seleccionados.length) {

        const modal =
            document.getElementById(
                "modalAsistenteNeto"
            );

        if (modal) {

            const contenido =
                modal.querySelector(
                    ".asistente-contenido"
                );

            if (contenido) {

                contenido.innerHTML = `

                    <button
                        class="asistente-cerrar"
                        type="button"
                        onclick="cerrarAsistenteNeto()"
                    >
                        ×
                    </button>

                    <div class="asistente-icono">
                        😕
                    </div>

                    <h2>
                        Presupuesto insuficiente
                    </h2>

                    <p>
                        No encontré una combinación
                        de productos que pueda formar
                        una despensa con ese presupuesto.
                    </p>

                    <div class="asistente-mensaje">

                        💡 Intenta aumentar un poco
                        tu presupuesto.

                    </div>

                    <button
                        type="button"
                        class="boton-generar-despensa"
                        onclick="abrirAsistenteNeto()"
                    >
                        ← CAMBIAR PRESUPUESTO
                    </button>

                `;

            }

        }

        return;

    }


    // ==============================
    // DINERO RESTANTE
    // ==============================

    const restante =
        presupuesto - total;


    // Guardamos la propuesta
    // para utilizarla después

    window.asistenteNetoPropuesta =
        seleccionados;


    // ==============================
    // MOSTRAR RESULTADO
    // ==============================

    const modal =
        document.getElementById(
            "modalAsistenteNeto"
        );


    if (!modal)
        return;


    const contenido =
        modal.querySelector(
            ".asistente-contenido"
        );


    if (!contenido)
        return;


    contenido.innerHTML = `

        <button
            class="asistente-cerrar"
            type="button"
            onclick="cerrarAsistenteNeto()"
        >
            ×
        </button>


        <div class="asistente-icono">
            🛒
        </div>


        <h2>
            ¡Tu despensa está lista!
        </h2>


        <p>
            Encontré una combinación de productos
            utilizando tu presupuesto.
        </p>


        <div class="asistente-resumen">

            <div>
                <span>
                    💰 PRESUPUESTO
                </span>

                <strong>
                    $${presupuesto.toFixed(2)}
                </strong>
            </div>


            <div>
                <span>
                    🛒 TOTAL
                </span>

                <strong>
                    $${total.toFixed(2)}
                </strong>
            </div>


            <div>
                <span>
                    💵 RESTANTE
                </span>

                <strong>
                    $${restante.toFixed(2)}
                </strong>
            </div>

        </div>


        <div class="asistente-lista">

            ${seleccionados
                .map(
                    producto => `

                        <div
                            class="asistente-producto"
                        >

                            <span
                                class="asistente-producto-icono"
                            >
                                ${producto.icono}
                            </span>


                            <div>

                                <strong>
                                    ${escapeHTML(
                                        producto.nombre
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        producto.categoria
                                    )}
                                </small>

                            </div>


                            <strong>
                                $${Number(
                                    producto.precio
                                ).toFixed(2)}
                            </strong>

                        </div>

                    `
                )
                .join("")}

        </div>


        <button
            type="button"
            class="boton-generar-despensa"
            onclick="agregarDespensaAsistente()"
        >
            🛒 AGREGAR ESTA DESPENSA A MI LISTA
        </button>


        <button
            type="button"
            class="asistente-boton-secundario"
            onclick="abrirAsistenteNeto()"
        >
            ↻ GENERAR OTRA
        </button>

    `;

}


// ========================================
// AGREGAR DESPENSA DEL ASISTENTE A MI LISTA
// ========================================


function agregarDespensaAsistente() {

    const propuesta =
        window.asistenteNetoPropuesta;


    if (
        !propuesta ||
        !propuesta.length
    ) {

        return;

    }


    propuesta.forEach(
        producto => {

            agregarAlCarrito(

                producto.nombre,

                Number(
                    producto.precio
                ),

                {

                    icono:
                        producto.icono,

                    presentacion:
                        producto.presentacion,

                    caducidad:
                        producto.caducidad,

                    categoriaLista:
                        producto.categoria,

                    comprado:
                        false

                }

            );

        }
    );


    mostrarNotificacionCatalogo(

        "🛒",

        "¡DESPENSA AGREGADA!",

        `${propuesta.length} productos fueron agregados a tu lista.`

    );

    cerrarAsistenteNeto();
}   // ← AQUÍ cierra agregarDespensaAsistente


/* =====================================================
   BOTÓN FLOTANTE ASISTENTE NETO
===================================================== */

(function conectarAsistenteNeto() {

    const netoBtn = document.getElementById("netoBtn");
    const netoBubble = document.getElementById("netoBubble");
    const netoBubbleClose = document.getElementById("netoBubbleClose");
    const netoBadge = document.getElementById("netoBadge");

    if (!netoBtn) return;

    if (netoBubble) {
        setTimeout(() => {
            netoBubble.classList.add("visible");
        }, 2500);
    }

    netoBubbleClose?.addEventListener("click", (e) => {
        e.stopPropagation();
        netoBubble.classList.remove("visible");
    });

    netoBtn.addEventListener("click", () => {
        netoBubble?.classList.remove("visible");

        if (typeof abrirAsistenteNeto === "function") {
            abrirAsistenteNeto();
        } else {
            console.warn("La función abrirAsistenteNeto no está definida.");
        }
    });

    if (netoBadge && localStorage.getItem("netoUsado")) {
        netoBadge.style.display = "none";
    }
    })();


    function abrirOfertas() {
    const modal = document.getElementById("modalOfertas");
    const contenedor = document.getElementById("ofertasProductos");
    const info = document.getElementById("ofertasInfo");
    if (!modal || !contenedor) return;

    const ofertas = obtenerProductosEnOferta();

    if (info) {
        info.textContent = ofertas.length
            ? `${ofertas.length} productos con descuento disponibles en Tiendas Neto.`
            : "No hay ofertas disponibles por el momento.";
    }

    if (!ofertas.length) {
        contenedor.className = "catalogo-productos-vacio";
        contenedor.innerHTML = `
            <div class="lista-vacia">
                <div class="lista-vacia-icono" style="background:#fff0e8;font-size:26px;">🔥</div>
                <strong>No hay ofertas activas</strong>
                <p>Vuelve más tarde para ver nuevos descuentos en tu despensa.</p>
            </div>
        `;
        modal.classList.add("activa");
        return;
    }

    // 👇 Reutilizamos la MISMA función que usa el catálogo
    // para que los productos se vean EXACTAMENTE iguales.
    contenedor.className = "catalogo-productos";
    contenedor.innerHTML = ofertas.map((producto, index) => {

        const favoritos = obtenerFavoritos();
        const favorito = favoritos.includes(producto.nombre);

        // Descuento en %
        const descuento = producto.descuento
            ? `-${producto.descuento}%`
            : (producto.etiquetaOferta || "OFERTA");

        // 👇 Mismo HTML EXACTO que `crearProductosHTML()`
        //    Solo agregamos el badge de descuento encima del sticker.
        return `
            <div
                class="producto-catalogo"
                style="animation-delay: ${index * 65}ms"
            >

                <!-- IMAGEN / STICKER -->
                <div class="producto-imagen">

                    <div class="producto-sticker">
                        ${producto.icono}
                    </div>

                    <!-- BADGE DE DESCUENTO (solo en ofertas) -->
                    <span
                        class="badge-oferta"
                        style="
                            position:absolute;
                            top:8px;
                            left:8px;
                            font-size:10px;
                            padding:3px 8px;
                            border-radius:6px;
                        "
                    >
                        🔥 ${escapeHTML(descuento)}
                    </span>

                    <!-- CORAZÓN -->
                    <button
                        type="button"
                        class="producto-favorito ${favorito ? "favorito-activo" : ""}"
                        onclick="toggleFavorito('${escapeJS(producto.nombre)}', this)"
                        title="Agregar a favoritos"
                    >
                        ${favorito ? "♥" : "♡"}
                    </button>

                </div>


                <!-- INFORMACIÓN -->
                <div class="producto-info">

                    <strong class="producto-nombre">
                        ${escapeHTML(producto.nombre)}
                    </strong>

                    <span class="producto-presentacion">
                        ${escapeHTML(producto.presentacion || producto.desc || "")}
                    </span>

                    <!-- PRECIO -->
                    <div class="producto-precio">
                        ${producto.precioRegular
                            ? `<span class="precio-tachado" style="font-size:12px;color:#94a3b8;text-decoration:line-through;margin-right:5px;">$${Number(producto.precioRegular).toFixed(2)}</span>`
                            : ""}
                        $${Number(producto.precio).toFixed(2)}
                        <span class="producto-precio-descuento">${escapeHTML(descuento)}</span>
                    </div>

                    <!-- ESTRELLAS -->
                    <div class="producto-calificacion">
                        <span>★★★★★</span>
                        <small>(${producto.resenas || 120})</small>
                    </div>

                    <!-- CADUCIDAD -->
                    <div class="producto-caducidad">
                        📅 CAD <strong>${escapeHTML(producto.caducidad || "Consumo habitual")}</strong>
                    </div>

                    <!-- LOTE -->
                    <div class="producto-lote">
                        LOTE: ${escapeHTML(producto.lote || "—")}
                    </div>

                    <!-- AGREGAR -->
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

    modal.classList.add("activa");
}
/* =====================================================
   OBTENER PRODUCTOS EN OFERTA
===================================================== */
