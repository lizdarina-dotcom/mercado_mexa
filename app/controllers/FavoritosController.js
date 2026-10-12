/* Controlador de favoritos: procesa altas, bajas y acciones de lista. */

function toggleFavorito(
    nombre,
    boton
) {

    let favoritos =
        obtenerFavoritos();


    const existe =
        favoritos.includes(
            nombre
        );


    if (existe) {

        favoritos =
            favoritos.filter(
                favorito =>
                    favorito !==
                    nombre
            );

        boton.classList.remove(
            "favorito-activo"
        );

        boton.textContent =
            "♡";


        mostrarMensajeFavorito(
            `♡ ${nombre} fue eliminado de favoritos`
        );


    } else {

        favoritos.push(
            nombre
        );


        boton.classList.add(
            "favorito-activo"
        );

        boton.textContent =
            "♥";


        mostrarMensajeFavorito(
            `♥ ${nombre} fue agregado a favoritos`
        );

    }


    localStorage.setItem(
        "favoritosMexa",
        JSON.stringify(
            favoritos
        )
    );

    /* Si hay sesion, el mismo cambio se guarda en MySQL */
    alternarFavoritoEnAPI(nombre);

    const modalFav = document.getElementById("modalFavoritos");
    if (modalFav && modalFav.classList.contains("activa")) {
        renderFavoritos();
    }
}


/* =====================================================
   SECCIÓN Y MODAL DE FAVORITOS
===================================================== */


function abrirFavoritos(conAnimacion = true) {
    let modal = document.getElementById("modalFavoritos");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modalFavoritos";
        modal.className = "ventana-modal";
        document.body.appendChild(modal);

        modal.addEventListener("click", e => {
            if (e.target === modal) {
                cerrarFavoritos();
            }
        });
    }

    let cargando = document.getElementById("loadingFavoritos");
    if (!cargando) {
        cargando = document.createElement("div");
        cargando.id = "loadingFavoritos";
        cargando.className = "ventana-modal";
        document.body.appendChild(cargando);

        cargando.addEventListener("click", e => {
            if (e.target === cargando) {
                if (cargando._timer) clearTimeout(cargando._timer);
                cargando.classList.remove("activa");
            }
        });
    }

    if (cargando._timer) {
        clearTimeout(cargando._timer);
    }

    renderFavoritos();

    if (!conAnimacion) {
        modal.classList.add("activa");
        return;
    }

    modal.classList.remove("activa");

    cargando.innerHTML = `
        <div class="catalogo-loading">
            <div class="catalogo-loading-icon" style="background:transparent;box-shadow:none;border-radius:0;font-size:72px;filter:drop-shadow(0 6px 14px rgba(255,49,91,.25));animation:corazonLatido .75s infinite alternate ease-in-out;">
                ❤️
            </div>
            <div class="catalogo-loading-titulo">
                ABRIENDO FAVORITOS
            </div>
            <div class="catalogo-loading-bar">
                <div style="background:#ff315b;"></div>
            </div>
            <div class="catalogo-loading-texto">
                Preparando tus favoritos...
            </div>
        </div>
    `;

    cargando.classList.add("activa");

    cargando._timer = setTimeout(() => {
        cargando.classList.remove("activa");
        modal.classList.add("activa");
    }, 1250);
}


function entrarTiendaDemo() {
    if (tiendas.length > 0) {
        entrarTienda(tiendas[0].id);
    } else {
        const cat = document.querySelector(".nav-item[data-target='catalogo']");
        if (cat) cat.click();
    }
}


function agregarTodosFavoritos() {
    const todos = obtenerTodosLosProductos();
    const favoritos = obtenerFavoritos();
    const prods = todos.filter(p => favoritos.includes(p.nombre));

    if (!prods.length) return;

    prods.forEach(p => {
        const existente = carrito.find(item => item.nombre === p.nombre);
        if (existente) {
            existente.cantidad++;
        } else {
            carrito.push({
                nombre: p.nombre,
                precio: p.precio,
                cantidad: 1,
                comprado: false
            });
        }
    });

    guardar();
    sincronizarCarritoDesdeAPI();
    mostrarNotificacionCatalogo("🛒", "¡AGREGADOS A TU LISTA!", `${prods.length} productos fueron agregados a tu lista.`);
}


async function vaciarFavoritos() {
    const actuales = obtenerFavoritos();
    localStorage.setItem("favoritosMexa", JSON.stringify([]));
    renderFavoritos();
    mostrarNotificacionCatalogo("🗑️", "FAVORITOS VACIADOS", "Se eliminaron todos los productos de favoritos.");

    /* Si hay sesion, se quitan tambien de MySQL */
    if (haySesionActiva() && typeof API !== "undefined") {
        try {
            for (const nombre of actuales) {
                await API.pedir("favoritos.php", {
                    method: "POST",
                    body: JSON.stringify({ accion: "quitar", nombre })
                });
            }
            sincronizarFavoritosDesdeAPI();
        } catch (e) {
            mostrarNotificacionCarrito("No se pudieron vaciar los favoritos", e.message);
        }
    }
}


/* =========================
   MENSAJE PRODUCTO
========================= */


function cerrarFavoritos() {
    const modal = document.getElementById("modalFavoritos");
    if (modal) {
        modal.classList.remove("activa");
    }
}
