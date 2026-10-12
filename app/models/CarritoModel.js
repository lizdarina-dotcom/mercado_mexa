/* Modelo de carrito: clasificación, precios y persistencia de la lista. */

let avisoCarritoLocalMostrado = false;

function categoriaDeProducto(producto) {
    if (producto.categoriaLista) return producto.categoriaLista;
    const nombre = String(producto.nombre || "").toLowerCase();

    if (/leche|queso|yogurt|huevo|pollo|carne|atún/.test(nombre)) {
        return "Lácteos y proteína";
    }
    if (/pan|tortilla|bolillo|tostadas|conchas|roles|galletas/.test(nombre)) {
        return "Pan y tortillas";
    }
    if (/cloro|limpiador|jabón|esponja|bolsas|papel higiénico|servitoallas|detergente/.test(nombre)) {
        return "Hogar y limpieza";
    }
    if (/frijol|arroz|aceite|azúcar|sal|pasta|avena|puré|café|mayonesa|salsa/.test(nombre)) {
        return "Abarrotes";
    }
    return "Otros";
}

function generarComparativaTiendas(precioBase, nombre = "") {
    const tiendasNombres = [
        "Neto Tlaxiaco Centro",
        "Tiendas Neto Espíndola",
        "Tienda Neto Juárez",
        "Bodega Aurrera"
    ];

    const hash = String(nombre).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const f1 = Number((0.92 + ((hash % 5) * 0.02)).toFixed(2));
    const f2 = Number((0.98 + (((hash * 3) % 4) * 0.02)).toFixed(2));
    const f3 = Number((1.02 + (((hash * 7) % 5) * 0.02)).toFixed(2));
    const f4 = Number((1.14 + (((hash * 11) % 6) * 0.02)).toFixed(2));

    const p1 = Math.round(precioBase * f1 * 10) / 10;
    const p2 = Math.round(precioBase * f2 * 10) / 10;
    const p3 = Math.round(precioBase * f3 * 10) / 10;
    const p4 = Math.round(precioBase * f4 * 10) / 10;

    const lista = [
        { tienda: tiendasNombres[0], precio: p1 },
        { tienda: tiendasNombres[1], precio: p2 },
        { tienda: tiendasNombres[2], precio: p3 },
        { tienda: tiendasNombres[3], precio: p4 }
    ];

    const min = Math.min(...lista.map(item => item.precio));
    const max = Math.max(...lista.map(item => item.precio));

    return lista.map(item => ({
        ...item,
        masBarato: item.precio === min,
        masCaro: item.precio === max
    }));
}


function buscarProductoEnCatalogo(nombre) {
    try {
        const cats = getCategoriasBase();
        for (const cat of cats) {
            const prod = (cat.productos || []).find(p => p.nombre === nombre);
            if (prod) return { ...prod, categoriaLista: cat.nombre };
        }
    } catch (e) {}
    return null;
}

function agregarAlCarrito(
    nombre,
    precio,
    extraData = {}
) {
    const existente = carrito.find(p => p.nombre === nombre);

    if (existente) {
        existente.cantidad = (existente.cantidad || 1) + 1;
    } else {
        const infoCatalogo = buscarProductoEnCatalogo(nombre) || {};
        const caducidad = extraData.caducidad || infoCatalogo.caducidad || "Consumo habitual";
        const icono = extraData.icono || infoCatalogo.icono || "🛒";
        const presentacion = extraData.presentacion || infoCatalogo.presentacion || "";
        const categoriaLista = extraData.categoriaLista || infoCatalogo.categoriaLista || categoriaDeProducto({ nombre });
        const enOferta = Boolean(extraData.enOferta);
        const etiquetaOferta = extraData.etiquetaOferta || (enOferta ? "¡OFERTA!" : "");
        const precioRegular = extraData.precioRegular || (enOferta ? Math.round(precio * 1.2 * 10) / 10 : precio);
        const comparativaTiendas = extraData.comparativaTiendas || generarComparativaTiendas(precio, nombre);

        carrito.push({
            nombre,
            precio,
            precioRegular,
            cantidad: 1,
            caducidad,
            icono,
            presentacion,
            categoriaLista,
            enOferta,
            etiquetaOferta,
            comparativaTiendas,
            comprado: false
        });
    }

    guardar();

    /* Si hay sesion, se guarda tambien en MySQL.
       Si el producto ya estaba, la BD suma la cantidad. */
    agregarProductoAlCarrito(nombre, 1);
}

/* Guarda el estado local y solicita que la vista redibuje la lista. */
function guardar() {


    localStorage.setItem(
        "carritoMexa",
        JSON.stringify(carrito)
    );


    actualizarContador();

    renderLista();

}


/* =========================
   CARRITO CONECTADO A LA BD
   Si hay sesion, el carrito se guarda tambien en MySQL.
   Si no hay servidor o no hay sesion, sigue con localStorage.
========================= */

/* El carrito local se vacia o no segun haya sesion */
function haySesionActiva() {
    try {
        return Boolean(obtenerSesionActual());
    } catch (e) {
        return false;
    }
}

/* Convierte la respuesta del servidor al formato que usa el JS.
   La BD manda precio/subtotal ya calculados. */
function carritoDesdeAPI(datos) {
    return (datos.items || []).map(item => ({
        id: String(item.producto_id),
        nombre: item.nombre,
        precio: Number(item.precio),
        precioRegular: Number(item.precioRegular),
        cantidad: Number(item.cantidad),
        subtotal: Number(item.subtotal),
        caducidad: item.caducidad || "Consumo habitual",
        icono: item.icono || "🛒",
        presentacion: item.presentacion || "",
        categoriaLista: item.categoriaLista || "",
        enOferta: false,
        etiquetaOferta: "",
        comparativaTiendas: generarComparativaTiendas(Number(item.precio), item.nombre),
        comprado: Boolean(item.comprado)
    }));
}

/* Al cargar la pagina, si hay sesion, se pide el carrito al servidor */
/* Si existe sesión, toma el carrito persistido en el servidor y actualiza el estado local. */
async function sincronizarCarritoDesdeAPI() {
    if (!haySesionActiva() || typeof API === "undefined") return;
    try {
        // Conserva productos agregados como invitado antes de iniciar sesión.
        const carritoLocal = JSON.parse(localStorage.getItem("carritoMexa") || "[]");
        let datos = await API.carrito();

        for (const producto of carritoLocal) {
            const cantidadLocal = Math.max(1, Number(producto.cantidad) || 1);
            const existente = (datos.items || []).find(item =>
                String(item.nombre).trim().toLowerCase() === String(producto.nombre).trim().toLowerCase()
            );

            if (!existente) {
                datos = await API.carritoAgregar(producto.nombre, cantidadLocal);
            } else if (cantidadLocal > Number(existente.cantidad)) {
                datos = await API.carritoCantidad(producto.nombre, cantidadLocal);
            }
        }

        carrito = carritoDesdeAPI(datos);
        localStorage.setItem("carritoMexa", JSON.stringify(carrito));
        actualizarContador();
        renderLista();
    } catch (e) {
        mostrarNotificacionCarrito("No se pudo sincronizar el carrito", e.message);
    }
}

/* Agrega un producto y lo refleja en la BD */
async function agregarProductoAlCarrito(nombre, cantidad = 1) {
    if (!haySesionActiva() || typeof API === "undefined") {
        if (!avisoCarritoLocalMostrado) {
            avisoCarritoLocalMostrado = true;
            mostrarNotificacionCarrito(
                "Carrito guardado en este navegador",
                "Inicia sesión con una cuenta de la base de datos para guardarlo en MySQL."
            );
        }
        return;
    }
    try {
        const datos = await API.carritoAgregar(nombre, cantidad);
        carrito = carritoDesdeAPI(datos);
        localStorage.setItem("carritoMexa", JSON.stringify(carrito));
        actualizarContador();
        renderLista();
    } catch (e) {
        mostrarNotificacionCarrito("No se pudo guardar en la base de datos", e.message);
    }
}

/* Cambia la cantidad de un producto */
async function cambiarCantidadEnAPI(nombre, cantidad) {
    if (!haySesionActiva() || typeof API === "undefined") return;
    try {
        const datos = await API.carritoCantidad(nombre, cantidad);
        carrito = carritoDesdeAPI(datos);
        localStorage.setItem("carritoMexa", JSON.stringify(carrito));
        actualizarContador();
        renderLista();
    } catch (e) {
        mostrarNotificacionCarrito("No se pudo actualizar", e.message);
    }
}

async function cambiarCompradoEnAPI(nombre, comprado) {
    if (!haySesionActiva() || typeof API === "undefined") return;
    try {
        const datos = await API.carritoComprado(nombre, comprado);
        carrito = carritoDesdeAPI(datos);
        localStorage.setItem("carritoMexa", JSON.stringify(carrito));
        actualizarContador();
        renderLista();
    } catch (e) {
        mostrarNotificacionCarrito("No se pudo actualizar el producto", e.message);
    }
}

async function cambiarTodosCompradosEnAPI(productos, comprado) {
    if (!haySesionActiva() || typeof API === "undefined") return;
    try {
        let datos = await API.carrito();
        for (const producto of productos) {
            datos = await API.carritoComprado(producto.nombre, comprado);
        }
        carrito = carritoDesdeAPI(datos);
        localStorage.setItem("carritoMexa", JSON.stringify(carrito));
        actualizarContador();
        renderLista();
    } catch (e) {
        mostrarNotificacionCarrito("No se pudo actualizar la lista", e.message);
    }
}

/* Elimina un producto */
async function eliminarProductoDeAPI(nombre) {
    if (!haySesionActiva() || typeof API === "undefined") return;
    try {
        const datos = await API.carritoEliminar(nombre);
        carrito = carritoDesdeAPI(datos);
        localStorage.setItem("carritoMexa", JSON.stringify(carrito));
        actualizarContador();
        renderLista();
    } catch (e) {
        mostrarNotificacionCarrito("No se pudo eliminar", e.message);
    }
}

/* Vacia el carrito */
async function vaciarCarritoEnAPI() {
    if (!haySesionActiva() || typeof API === "undefined") return;
    try {
        const datos = await API.carritoVaciar();
        carrito = carritoDesdeAPI(datos);
        localStorage.setItem("carritoMexa", JSON.stringify(carrito));
        actualizarContador();
        renderLista();
    } catch (e) {
        mostrarNotificacionCarrito("No se pudo vaciar", e.message);
    }
}

/* Aviso pequeno si falla una operacion del carrito */

// Configuración de clasificación del modelo de carrito.

const ordenCategoriasLista = [
    "Abarrotes",
    "Lácteos y proteína",
    "Pan y tortillas",
    "Hogar y limpieza",
    "Otros"
];

const iconosCategoriasLista = {
    "Abarrotes": "🥫",
    "Lácteos y proteína": "🥛",
    "Pan y tortillas": "🍞",
    "Hogar y limpieza": "🧼",
    "Otros": "🛒"
};


function productoSemanal(nombre, precio, cantidad, categoriaLista, options = {}) {
    const enOferta = Boolean(options.enOferta);
    const precioRegular = options.precioRegular || (enOferta ? Math.round(precio * 1.22 * 10) / 10 : precio);
    const comparativa = options.comparativaTiendas || generarComparativaTiendas(precio, nombre);

    return {
        nombre,
        precio,
        precioRegular,
        cantidad: cantidad || 1,
        categoriaLista,
        icono: options.icono || "🛒",
        presentacion: options.presentacion || "",
        caducidad: options.caducidad || "Consumo habitual",
        enOferta,
        etiquetaOferta: options.etiquetaOferta || (enOferta ? "¡OFERTA!" : ""),
        comparativaTiendas: comparativa,
        comprado: false
    };
}

/* ---
   Genera una despensa semanal recomendada según el
   presupuesto o una compra balanceada.
--- */


