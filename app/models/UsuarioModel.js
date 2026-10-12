/* Modelo de usuario: normaliza y sincroniza pedidos y preferencias. */

function pedidosDesdeAPI(lista) {
    return (lista || []).map(p => ({
        id: p.folio,
        pedidoId: p.id,
        usuarioId: null,
        cliente: p.cliente,
        telefono: p.telefono,
        direccion: p.direccion,
        referencias: p.referencias || "",
        modalidad: p.modalidad,
        tienda: p.tienda || "",
        tiendaDireccion: "",
        total: Number(p.total),
        productos: (p.items || []).map(i => `${i.nombre} (${i.cantidad})`).join(", "),
        items: (p.items || []).map(i => ({
            nombre: i.nombre,
            cantidad: i.cantidad,
            precio: Number(i.precio)
        })),
        metodoPago: p.metodoPago,
        codigoEntrega: p.codigoEntrega,
        estado: p.estado,
        fecha: p.fecha,
        chofer: p.chofer || "Por asignar"
    }));
}

/* Al cargar la pagina, si hay sesion, se piden los pedidos al servidor */
async function sincronizarPedidosDesdeAPI() {
    if (!haySesionActiva() || typeof API === "undefined") return;
    try {
        const lista = await API.pedidos();
        guardarPedidosMexa(pedidosDesdeAPI(lista));
    } catch (e) {
        // Si falla, los pedidos del navegador siguen visibles
    }
}

/* =========================
   FAVORITOS CONECTADOS A LA BD
========================= */

/* La lista de favoritos se guarda como arreglo de nombres,
   que es como ya la usaba el JS. */
function guardarFavoritosDesdeAPI(favoritos) {
    localStorage.setItem(
        "favoritosMexa",
        JSON.stringify((favoritos || []).map(f => f.nombre))
    );
    favoritosMexa = (favoritos || []).map(f => f.nombre);
    pintarCorazonesFavoritos();
}

async function sincronizarFavoritosDesdeAPI() {
    if (!haySesionActiva() || typeof API === "undefined") return;
    try {
        const locales = obtenerFavoritos();
        let lista = await API.favoritos();
        const nombresServidor = new Set((lista || []).map(f => f.nombre.toLowerCase()));
        const noEncontrados = [];

        for (const nombre of locales) {
            if (nombresServidor.has(String(nombre).toLowerCase())) continue;
            try {
                const respuesta = await API.favoritoAlternar(nombre);
                lista = respuesta.favoritos;
                nombresServidor.add(String(nombre).toLowerCase());
            } catch (e) {
                noEncontrados.push(nombre);
            }
        }

        guardarFavoritosDesdeAPI(lista);
        if (noEncontrados.length) {
            mostrarNotificacionCarrito(
                "Algunos favoritos no se sincronizaron",
                `No se encontraron en el catálogo: ${noEncontrados.join(", " )}`
            );
        }
    } catch (e) {
        mostrarNotificacionCarrito("No se pudieron sincronizar los favoritos", e.message);
    }
}

/* Marca los corazones del catalogo segun la lista actual.
   El boton lleva el nombre dentro del onclick, asi que se saca de ahi. */
