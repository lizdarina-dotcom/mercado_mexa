/* Controlador de catálogo: coordina carga, navegación y selección. */

function cerrarCatalogo() {

    const catalogo =
        document.getElementById(
            "catalogoTienda"
        );


    if (!catalogo)
        return;


    if (catalogo._timer) {

        clearTimeout(
            catalogo._timer
        );

    }


    catalogo.classList.remove(
        "activa"
    );

}


/* =========================
   CREAR PRODUCTO
========================= */


async function cargarCatalogoDesdeAPI() {
    if (catalogoCargando) return;
    catalogoCargando = true;

    try {
        const catalogo = await CatalogoModel.obtenerCatalogo();
        if (catalogo.tiendas) tiendasDesdeAPI = catalogo.tiendas;
        categoriasDesdeAPI = catalogo.categorias;
        console.log(
            "[API] catalogo cargado:",
            catalogo.total,
            "productos en",
            categoriasDesdeAPI.length,
            "categorias"
        );
        return categoriasDesdeAPI;
    } catch (error) {
        console.warn("[API] no se pudo cargar el catalogo, se usa el local:", error.message);
        return null;
    } finally {
        catalogoCargando = false;
    }
}
/* =========================
   CATEGORÍAS
   13 PRODUCTOS CADA UNA
   (respaldo local, se usa si la API no responde)
========================= */


function entrarTienda(id) {

    const tienda =
        tiendas.find(
            t =>
                String(t.id) ===
                String(id)
        );

    if (!tienda)
        return;

    abrirCatalogo(tienda);
}


/* =========================
   ABRIR CATÁLOGO
========================= */

function abrirCatalogo(tienda) {

    let catalogo =
        document.getElementById(
            "catalogoTienda"
        );

    if (!catalogo) {

        catalogo =
            document.createElement(
                "div"
            );

        catalogo.id =
            "catalogoTienda";

        catalogo.className =
            "ventana-modal";

        document.body.appendChild(
            catalogo
        );

    }


    /* Cancelar animación anterior */

    if (catalogo._timer) {
        clearTimeout(
            catalogo._timer
        );
    }


    /* =========================
       ANIMACIÓN DE ENTRADA
    ========================= */

    catalogo.innerHTML = `

        <div class="catalogo-loading">

            <div class="catalogo-loading-icon">
                🛒
            </div>

            <div class="catalogo-loading-titulo">
                ABRIENDO CATÁLOGO
            </div>

            <div class="catalogo-loading-bar">

                <div></div>

            </div>

            <div class="catalogo-loading-texto">
                Preparando productos...
            </div>

        </div>

    `;


    catalogo.classList.add(
        "activa"
    );


    /* =========================
       DESPUÉS DE LA ANIMACIÓN
    ========================= */

    catalogo._timer =
        setTimeout(() => {

            mostrarContenidoCatalogo(
                catalogo,
                tienda
            );

        }, 1300);

}


/* =========================
   CONTENIDO DEL CATÁLOGO
========================= */

/* =====================================================
   CATÁLOGO Y FAVORITOS
   Estas funciones renderizan productos, abren las tiendas,
   activan favoritos y dejan el catálogo listo para comprar.
===================================================== */


function agregarProductoCatalogo(
    nombre,
    precio
) {

    agregarAlCarrito(
        nombre,
        precio
    );


    mostrarMensajeCatalogo(
        `✓ ${nombre} fue agregado correctamente`
    );

}


/* =========================
   FAVORITOS
========================= */


function getCategoriasBase() {
    if (categoriasDesdeAPI && categoriasDesdeAPI.length) return categoriasDesdeAPI;
    return getCategoriasLocales();
}

/* Controlador: coordina la carga del catálogo y el estado de la aplicación. */
