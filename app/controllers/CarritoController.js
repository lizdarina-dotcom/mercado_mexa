/* Controlador de carrito: procesa cambios y acciones de compra. */

function seleccionarTiendaProducto(indice, nombreTienda, precioTienda) {
    if (!carrito[indice]) return;

    carrito[indice].tiendaSeleccionada = nombreTienda;
    carrito[indice].precio = Number(precioTienda);

    if (carrito[indice].comparativaTiendas) {
        carrito[indice].comparativaTiendas.forEach(t => {
            t.seleccionada = (t.tienda === nombreTienda);
        });
    }

    guardar();
}

function alternarProductoLista(indice) {
    if (!carrito[indice]) return;
    carrito[indice].comprado = !carrito[indice].comprado;
    const nombre = carrito[indice].nombre;
    const comprado = carrito[indice].comprado;
    guardar();
    cambiarCompradoEnAPI(nombre, comprado);
}

function marcarListaCompleta() {
    const marcar = carrito.some(producto => !producto.comprado);
    carrito.forEach(producto => {
        producto.comprado = marcar;
    });
    const productosActualizados = carrito.map(producto => ({ ...producto }));
    guardar();
    cambiarTodosCompradosEnAPI(productosActualizados, marcar);
}

/* =========================
   CANTIDAD
========================= */


function cambiarCantidad(
    i,
    d
) {

    if (!carrito[i])
        return;


    /* Se guarda el nombre antes de tocar el arreglo,
       porque despues el indice puede haber cambiado. */
    const nombreProducto = carrito[i].nombre;

    carrito[i].cantidad += d;


    if (
        carrito[i].cantidad <= 0
    ) {

        carrito.splice(i, 1);

    }


    guardar();

    /* Si hay sesion, se refleja en MySQL.
       Con cantidad 0 el servidor lo elimina. */
    cambiarCantidadEnAPI(
        nombreProducto,
        Math.max(0, carrito.find(p => p.nombre === nombreProducto)?.cantidad || 0)
    );

}


function eliminarDeLista(i) {

    const nombreProducto = carrito[i]?.nombre;

    carrito.splice(i, 1);

    guardar();

    if (nombreProducto) {
        eliminarProductoDeAPI(nombreProducto);
    }

}


function vaciarLista() {

    carrito = [];
    detallesTiendaAbiertos = {};

    guardar();

    vaciarCarritoEnAPI();

}


/* =========================
   LISTA AUTOMÁTICA
========================= */


function abrirLista(conAnimacion = true) {

    const modal = document.getElementById("modalLista");
    if (!modal) return;

    let cargando = document.getElementById("loadingLista");
    if (!cargando) {
        cargando = document.createElement("div");
        cargando.id = "loadingLista";
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

    renderLista();

    if (!conAnimacion) {
        modal.classList.add("activa");
        return;
    }

    modal.classList.remove("activa");

    cargando.innerHTML = `
        <div class="catalogo-loading">
            <div class="catalogo-loading-icon">
                🛒
            </div>
            <div class="catalogo-loading-titulo">
                ABRIENDO MI LISTA
            </div>
            <div class="catalogo-loading-bar">
                <div></div>
            </div>
            <div class="catalogo-loading-texto">
                Preparando productos...
            </div>
        </div>
    `;

    cargando.classList.add("activa");

    cargando._timer = setTimeout(() => {
        cargando.classList.remove("activa");
        modal.classList.add("activa");
    }, 1250);
}


/* =========================
   GPS
========================= */

/* =====================================================
   GEOLOCALIZACIÓN Y MAPA
   Este bloque pide la ubicación del usuario, dibuja
   el mapa, muestra tiendas cercanas y crea rutas.
===================================================== */


function generarListaAutomaticaLegacy() {

    carrito = [

        {
            nombre:
                "Frijol Negro 900g",

            precio:
                32,

            cantidad:
                1
        },


        {
            nombre:
                "Arroz Morelos 1kg",

            precio:
                35,

            cantidad:
                2
        },


        {
            nombre:
                "Leche Entera Neto 1L",

            precio:
                26,

            cantidad:
                2
        },


        {
            nombre:
                "Pan Blanco Grande",

            precio:
                42,

            cantidad:
                1
        }

    ];


    guardar();

    abrirLista(false);

    sincronizarCarritoDesdeAPI();

}



function generarListaAutomatica() {
    detallesTiendaAbiertos = {};
    /* Despensa semanal balanceada, variada y completa con ofertas, caducidades y comparador de tiendas */
    carrito = [
        // Abarrotes esenciales
        productoSemanal("Frijol Negro 900g", 27.50, 1, "Abarrotes", {
            icono: "🫘",
            presentacion: "Bolsa 900 g",
            caducidad: "12/12/2026",
            enOferta: true,
            etiquetaOferta: "19% OFF",
            precioRegular: 34.00
        }),
        productoSemanal("Arroz Morelos 1kg", 32.00, 1, "Abarrotes", {
            icono: "🍚",
            presentacion: "Bolsa 1 kg",
            caducidad: "08/03/2027"
        }),
        productoSemanal("Aceite Vegetal 1L", 42.50, 1, "Abarrotes", {
            icono: "🫗",
            presentacion: "Botella 1 L",
            caducidad: "15/01/2027",
            enOferta: true,
            etiquetaOferta: "¡Oferta Semanal!",
            precioRegular: 49.90
        }),
        productoSemanal("Atún en Agua 140g", 18.50, 2, "Abarrotes", {
            icono: "🐟",
            presentacion: "Lata 140 g",
            caducidad: "10/11/2028",
            enOferta: true,
            etiquetaOferta: "20% OFF",
            precioRegular: 23.00
        }),
        productoSemanal("Pasta Spaghetti 200g", 15.00, 1, "Abarrotes", {
            icono: "🍝",
            presentacion: "Paquete 200 g",
            caducidad: "22/06/2028"
        }),
        productoSemanal("Avena Natural 400g", 26.00, 1, "Abarrotes", {
            icono: "🌾",
            presentacion: "Bolsa 400 g",
            caducidad: "14/02/2028"
        }),

        // Lácteos y proteína
        productoSemanal("Leche Entera Neto 1L", 23.50, 2, "Lácteos y proteína", {
            icono: "🥛",
            presentacion: "Envase 1 L",
            caducidad: "20/11/2026",
            enOferta: true,
            etiquetaOferta: "¡En Oferta!",
            precioRegular: 27.00
        }),
        productoSemanal("Huevo Blanco 18 Piezas", 48.00, 1, "Lácteos y proteína", {
            icono: "🥚",
            presentacion: "Cartón 18 piezas",
            caducidad: "15/12/2026",
            enOferta: true,
            etiquetaOferta: "14% OFF",
            precioRegular: 56.00
        }),
        productoSemanal("Queso Oaxaca 400g", 64.00, 1, "Lácteos y proteína", {
            icono: "🧀",
            presentacion: "Paquete 400 g",
            caducidad: "05/12/2026"
        }),
        productoSemanal("Yogurt Natural 1kg", 36.00, 1, "Lácteos y proteína", {
            icono: "🥛",
            presentacion: "Envase 1 kg",
            caducidad: "28/11/2026"
        }),

        // Pan y tortillas
        productoSemanal("Tortillas de Maíz 1kg", 22.00, 1, "Pan y tortillas", {
            icono: "🌮",
            presentacion: "Paquete 1 kg",
            caducidad: "22/09/2026"
        }),
        productoSemanal("Pan Blanco Grande", 38.00, 1, "Pan y tortillas", {
            icono: "🍞",
            presentacion: "Pan de caja 680 g",
            caducidad: "28/11/2026",
            enOferta: true,
            etiquetaOferta: "13% OFF",
            precioRegular: 44.00
        }),

        // Hogar y limpieza
        productoSemanal("Detergente 1kg", 46.00, 1, "Hogar y limpieza", {
            icono: "🧺",
            presentacion: "Bolsa 1 kg",
            caducidad: "01/01/2028",
            enOferta: true,
            etiquetaOferta: "15% OFF",
            precioRegular: 54.00
        }),
        productoSemanal("Cloro 1L", 22.00, 1, "Hogar y limpieza", {
            icono: "🧴",
            presentacion: "Botella 1 L",
            caducidad: "08/09/2027"
        }),
        productoSemanal("Papel Higiénico 4pz", 28.00, 1, "Hogar y limpieza", {
            icono: "🧻",
            presentacion: "Paquete 4 piezas",
            caducidad: "01/01/2030",
            enOferta: true,
            etiquetaOferta: "20% OFF",
            precioRegular: 35.00
        }),
        productoSemanal("Jabón para Trastes 750ml", 29.00, 1, "Hogar y limpieza", {
            icono: "🫧",
            presentacion: "Botella 750 ml",
            caducidad: "15/05/2028"
        })
    ];

    guardar();
    abrirLista(false);
    sincronizarCarritoDesdeAPI();
}

/* =========================
   SEGURIDAD HTML
========================= */
