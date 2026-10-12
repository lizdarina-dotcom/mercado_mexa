/* Modelo del catálogo: obtiene y adapta los datos para la aplicación. */
window.CatalogoModel = (() => {
    function normalizarProducto(producto) {
        return {
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio),
            presentacion: producto.presentacion,
            desc: producto.descripcion || producto.presentacion,
            caducidad: producto.caducidad
                ? new Date(producto.caducidad + "T00:00:00").toLocaleDateString("es-MX")
                : "Consumo habitual",
            lote: producto.lote || "—",
            icono: producto.icono,
            resenas: Number(producto.resenas) || 0,
            enOferta: Boolean(producto.en_oferta),
            etiquetaOferta: producto.etiqueta_oferta || "",
            precioRegular: producto.precio_regular
                ? Number(producto.precio_regular)
                : null
        };
    }

    // Obtiene datos del endpoint PHP y adapta su formato para las vistas.
    async function obtenerCatalogo() {
        const respuesta = await fetch("api/productos.php");
        if (!respuesta.ok) throw new Error("HTTP " + respuesta.status);

        const datos = await respuesta.json();
        if (!datos.ok || !Array.isArray(datos.categorias)) {
            throw new Error(datos.error || "Respuesta de catálogo no válida");
        }

        return {
            tiendas: Array.isArray(datos.tiendas) ? datos.tiendas : null,
            categorias: datos.categorias.map(categoria => ({
                nombre: categoria.nombre,
                icono: categoria.icono,
                productos: (categoria.productos || []).map(normalizarProducto)
            })),
            total: datos.total
        };
    }

    return { obtenerCatalogo };
})();
function productoCatalogo(
    nombre,
    precio,
    presentacion,
    caducidad,
    lote,
    icono,
    resenas
) {

    return {

        nombre,

        precio,

        presentacion,

        desc:
            presentacion,

        caducidad,

        lote,

        icono,

        resenas:
            resenas || 120

    };

}


/* =========================
   CATEGORÍAS DESDE LA API
   (MySQL via api/productos.php)
   Los productos vienen de MySQL (api/productos.php).
   Si la API falla, se usa el catalogo local como respaldo.
========================= */

let categoriasDesdeAPI = null;
let catalogoCargando = false;

/* El modelo obtiene y normaliza los datos; el controlador conserva el estado de la pantalla. */
function getCategoriasLocales() {

    return [

        /* =========================
           ABARROTES - 13
        ========================= */

        {
            nombre:
                "ABARROTES",

            icono:
                "🥫",

            productos: [

                productoCatalogo(
                    "Frijol Negro 900g",
                    32,
                    "Bolsa 900 g",
                    "12/12/2026",
                    "L-8841",
                    "🫘",
                    245
                ),

                productoCatalogo(
                    "Arroz Morelos 1kg",
                    35,
                    "Bolsa 1 kg",
                    "08/03/2027",
                    "L-9021",
                    "🍚",
                    198
                ),

                productoCatalogo(
                    "Aceite Vegetal 1L",
                    48,
                    "Botella 1 L",
                    "15/01/2027",
                    "L-1120",
                    "🫗",
                    176
                ),

                productoCatalogo(
                    "Azúcar Estándar 1kg",
                    29,
                    "Bolsa 1 kg",
                    "20/08/2027",
                    "A-2231",
                    "🍬",
                    143
                ),

                productoCatalogo(
                    "Sal de Mesa 1kg",
                    18,
                    "Bolsa 1 kg",
                    "14/05/2028",
                    "S-3412",
                    "🧂",
                    112
                ),

                productoCatalogo(
                    "Atún en Agua 140g",
                    22,
                    "Lata 140 g",
                    "10/11/2028",
                    "AT-5541",
                    "🐟",
                    221
                ),

                productoCatalogo(
                    "Sopa Instantánea Pollo 85g",
                    12,
                    "Vaso 85 g",
                    "18/09/2027",
                    "SP-1182",
                    "🍜",
                    245
                ),

                productoCatalogo(
                    "Pasta Spaghetti 200g",
                    17,
                    "Paquete 200 g",
                    "22/06/2028",
                    "PS-2201",
                    "🍝",
                    189
                ),

                productoCatalogo(
                    "Avena 400g",
                    28,
                    "Bolsa 400 g",
                    "14/02/2028",
                    "AV-402",
                    "🌾",
                    134
                ),

                productoCatalogo(
                    "Mayonesa 390g",
                    39,
                    "Frasco 390 g",
                    "05/07/2027",
                    "MY-390",
                    "🥚",
                    167
                ),

                productoCatalogo(
                    "Salsa Cátsup 397g",
                    31,
                    "Botella 397 g",
                    "12/08/2027",
                    "SC-397",
                    "🍅",
                    154
                ),

                productoCatalogo(
                    "Puré de Tomate 210g",
                    14,
                    "Lata 210 g",
                    "18/10/2028",
                    "PT-210",
                    "🍅",
                    98
                ),

                productoCatalogo(
                    "Café Soluble 100g",
                    58,
                    "Frasco 100 g",
                    "22/04/2028",
                    "CF-100",
                    "☕",
                    203
                )

            ]
        },


        /* =========================
           LÁCTEOS - 13
        ========================= */

        {
            nombre:
                "LÁCTEOS",

            icono:
                "🥛",

            productos: [

                productoCatalogo(
                    "Leche Entera Neto 1L",
                    26,
                    "Envase 1 L",
                    "20/11/2026",
                    "L-5512",
                    "🥛",
                    201
                ),

                productoCatalogo(
                    "Leche Deslactosada 1L",
                    29,
                    "Envase 1 L",
                    "25/11/2026",
                    "LD-4310",
                    "🥛",
                    187
                ),

                productoCatalogo(
                    "Leche Light 1L",
                    28,
                    "Envase 1 L",
                    "22/11/2026",
                    "LL-2201",
                    "🥛",
                    143
                ),

                productoCatalogo(
                    "Queso Oaxaca 400g",
                    68,
                    "Paquete 400 g",
                    "05/12/2026",
                    "L-5518",
                    "🧀",
                    178
                ),

                productoCatalogo(
                    "Queso Panela 400g",
                    62,
                    "Paquete 400 g",
                    "08/12/2026",
                    "QP-4418",
                    "🧀",
                    165
                ),

                productoCatalogo(
                    "Yogurt Natural 1kg",
                    38,
                    "Envase 1 kg",
                    "28/11/2026",
                    "L-5520",
                    "🥛",
                    143
                ),

                productoCatalogo(
                    "Yogurt Fresa 1kg",
                    42,
                    "Envase 1 kg",
                    "27/11/2026",
                    "YF-3312",
                    "🍓",
                    190
                ),

                productoCatalogo(
                    "Crema Ácida 450ml",
                    35,
                    "Envase 450 ml",
                    "30/11/2026",
                    "CR-7721",
                    "🥛",
                    122
                ),

                productoCatalogo(
                    "Mantequilla 90g",
                    31,
                    "Barra 90 g",
                    "18/01/2027",
                    "MA-8820",
                    "🧈",
                    156
                ),

                productoCatalogo(
                    "Margarina 225g",
                    25,
                    "Barra 225 g",
                    "16/03/2027",
                    "MG-225",
                    "🧈",
                    109
                ),

                productoCatalogo(
                    "Huevo Blanco 18 Piezas",
                    52,
                    "Cartón 18 piezas",
                    "15/12/2026",
                    "HB-018",
                    "🥚",
                    198
                ),

                productoCatalogo(
                    "Bebida Láctea Chocolate 1L",
                    34,
                    "Envase 1 L",
                    "29/11/2026",
                    "BC-100",
                    "🥛",
                    132
                ),

                productoCatalogo(
                    "Requesón 300g",
                    44,
                    "Envase 300 g",
                    "06/12/2026",
                    "RQ-300",
                    "🧀",
                    87
                )

            ]
        },


        /* =========================
           BEBIDAS - 13
        ========================= */

        {
            nombre:
                "BEBIDAS",

            icono:
                "🥤",

            productos: [

                productoCatalogo(
                    "Refresco Cola 3L",
                    35,
                    "Botella 3 L",
                    "10/06/2027",
                    "B-101",
                    "🥤",
                    276
                ),

                productoCatalogo(
                    "Agua Purificada 1.5L",
                    14,
                    "Botella 1.5 L",
                    "10/06/2028",
                    "B-102",
                    "💧",
                    198
                ),

                productoCatalogo(
                    "Jumex Mango 450ml",
                    18,
                    "Botella 450 ml",
                    "15/04/2027",
                    "JM-451",
                    "🥭",
                    189
                ),

                productoCatalogo(
                    "Agua Natural 1L",
                    11,
                    "Botella 1 L",
                    "21/07/2028",
                    "AN-321",
                    "💧",
                    145
                ),

                productoCatalogo(
                    "Refresco Manzana 600ml",
                    19,
                    "Botella 600 ml",
                    "02/08/2027",
                    "RM-602",
                    "🍎",
                    176
                ),

                productoCatalogo(
                    "Bebida de Naranja 1L",
                    24,
                    "Envase 1 L",
                    "19/05/2027",
                    "NA-100",
                    "🍊",
                    134
                ),

                productoCatalogo(
                    "Agua Mineral 600ml",
                    16,
                    "Botella 600 ml",
                    "12/10/2027",
                    "AM-612",
                    "💧",
                    121
                ),

                productoCatalogo(
                    "Jugo de Naranja 1L",
                    32,
                    "Envase 1 L",
                    "05/02/2027",
                    "JO-778",
                    "🍊",
                    203
                ),

                productoCatalogo(
                    "Néctar de Mango 1L",
                    27,
                    "Envase 1 L",
                    "18/04/2027",
                    "NM-100",
                    "🥭",
                    166
                ),

                productoCatalogo(
                    "Té de Limón 1.5L",
                    25,
                    "Botella 1.5 L",
                    "20/05/2027",
                    "TL-150",
                    "🍋",
                    115
                ),

                productoCatalogo(
                    "Bebida de Jamaica 1L",
                    24,
                    "Envase 1 L",
                    "16/05/2027",
                    "BJ-100",
                    "🌺",
                    104
                ),

                productoCatalogo(
                    "Bebida de Horchata 1L",
                    26,
                    "Envase 1 L",
                    "17/05/2027",
                    "BH-100",
                    "🥛",
                    98
                ),

                productoCatalogo(
                    "Café Frío 450ml",
                    29,
                    "Botella 450 ml",
                    "09/04/2027",
                    "CF-450",
                    "☕",
                    142
                )

            ]
        },


        /* =========================
           PAN Y TORTILLAS - 13
        ========================= */

        {
            nombre:
                "PAN Y TORTILLAS",

            icono:
                "🍞",

            productos: [

                productoCatalogo(
                    "Pan Blanco Grande",
                    42,
                    "Pan de caja 680 g",
                    "18/11/2026",
                    "P-201",
                    "🍞",
                    167
                ),

                productoCatalogo(
                    "Pan Integral 680g",
                    48,
                    "Pan de caja integral",
                    "20/11/2026",
                    "PI-301",
                    "🍞",
                    156
                ),

                productoCatalogo(
                    "Pan Dulce Surtido",
                    38,
                    "Caja surtida",
                    "17/11/2026",
                    "PD-442",
                    "🥐",
                    188
                ),

                productoCatalogo(
                    "Bolillo 6 Piezas",
                    28,
                    "Paquete 6 piezas",
                    "15/11/2026",
                    "BO-602",
                    "🥖",
                    142
                ),

                productoCatalogo(
                    "Tostadas de Maíz 300g",
                    31,
                    "Paquete 300 g",
                    "12/04/2027",
                    "TM-331",
                    "🌮",
                    134
                ),

                productoCatalogo(
                    "Tortillas de Maíz 1kg",
                    24,
                    "Paquete 1 kg",
                    "16/11/2026",
                    "P-202",
                    "🌮",
                    134
                ),

                productoCatalogo(
                    "Tortillas de Harina 500g",
                    27,
                    "Paquete 500 g",
                    "19/11/2026",
                    "TH-501",
                    "🌯",
                    119
                ),

                productoCatalogo(
                    "Pan para Hamburguesa 8pz",
                    45,
                    "Paquete 8 piezas",
                    "23/11/2026",
                    "PH-808",
                    "🍔",
                    233
                ),

                productoCatalogo(
                    "Pan Tostado 250g",
                    35,
                    "Paquete 250 g",
                    "25/11/2026",
                    "PT-250",
                    "🍞",
                    101
                ),

                productoCatalogo(
                    "Conchas 6 Piezas",
                    39,
                    "Paquete 6 piezas",
                    "18/11/2026",
                    "CO-606",
                    "🥐",
                    178
                ),

                productoCatalogo(
                    "Galletas Marías 170g",
                    18,
                    "Paquete 170 g",
                    "10/06/2027",
                    "GM-170",
                    "🍪",
                    214
                ),

                productoCatalogo(
                    "Galletas Saladas 186g",
                    20,
                    "Paquete 186 g",
                    "14/07/2027",
                    "GS-186",
                    "🍪",
                    132
                ),

                productoCatalogo(
                    "Roles de Canela 6pz",
                    42,
                    "Paquete 6 piezas",
                    "21/11/2026",
                    "RC-606",
                    "🍩",
                    147
                )

            ]
        },


        /* =========================
           LIMPIEZA - 13
        ========================= */

        {
            nombre:
                "LIMPIEZA",

            icono:
                "🧴",

            productos: [

                productoCatalogo(
                    "Detergente 1kg",
                    52,
                    "Bolsa 1 kg",
                    "01/01/2028",
                    "C-301",
                    "🧺",
                    122
                ),

                productoCatalogo(
                    "Detergente Líquido 1L",
                    58,
                    "Botella 1 L",
                    "10/02/2028",
                    "DL-100",
                    "🧴",
                    156
                ),

                productoCatalogo(
                    "Suavizante 1L",
                    45,
                    "Botella 1 L",
                    "12/03/2028",
                    "C-302",
                    "🧴",
                    143
                ),

                productoCatalogo(
                    "Cloro 1L",
                    24,
                    "Botella 1 L",
                    "08/09/2027",
                    "C-401",
                    "🧴",
                    134
                ),

                productoCatalogo(
                    "Limpiador Multiusos 1L",
                    34,
                    "Botella 1 L",
                    "20/02/2028",
                    "C-402",
                    "🧽",
                    167
                ),

                productoCatalogo(
                    "Jabón para Trastes 750ml",
                    32,
                    "Botella 750 ml",
                    "15/05/2028",
                    "C-503",
                    "🫧",
                    201
                ),

                productoCatalogo(
                    "Esponjas para Cocina 4pz",
                    18,
                    "Paquete 4 piezas",
                    "01/01/2030",
                    "C-601",
                    "🧽",
                    109
                ),

                productoCatalogo(
                    "Limpiavidrios 500ml",
                    29,
                    "Botella 500 ml",
                    "10/08/2028",
                    "C-701",
                    "🪟",
                    118
                ),

                productoCatalogo(
                    "Desinfectante 1L",
                    39,
                    "Botella 1 L",
                    "18/06/2028",
                    "C-801",
                    "🧴",
                    154
                ),

                productoCatalogo(
                    "Bolsas para Basura 30pz",
                    35,
                    "Paquete 30 piezas",
                    "01/01/2030",
                    "BB-030",
                    "🗑️",
                    88
                ),

                productoCatalogo(
                    "Papel Higiénico 4pz",
                    32,
                    "Paquete 4 piezas",
                    "01/01/2030",
                    "PH-004",
                    "🧻",
                    189
                ),

                productoCatalogo(
                    "Servitoallas 120 Hojas",
                    29,
                    "Paquete 120 hojas",
                    "01/01/2030",
                    "ST-120",
                    "🧻",
                    94
                ),

                productoCatalogo(
                    "Jabón de Barra 3pz",
                    27,
                    "Paquete 3 piezas",
                    "01/01/2030",
                    "JB-003",
                    "🧼",
                    145
                )

            ]
        },


    ];
    

}

/* =========================
   CARRITO
========================= */
function obtenerProductosEnOferta() {
    const categorias = getCategoriasBase();
    const resultado = [];
    const vistos = new Set();

    categorias.forEach(cat => {
        (cat.productos || []).forEach(p => {
            if (vistos.has(p.nombre)) return;

            const enOferta =
                p.enOferta === true ||
                (p.precioRegular && Number(p.precio) < Number(p.precioRegular));

            if (enOferta) {
                vistos.add(p.nombre);
                resultado.push({
                    ...p,
                    categoria: cat.nombre,
                    enOferta: true,
                    descuento: p.precioRegular
                        ? Math.round((1 - p.precio / p.precioRegular) * 100)
                        : null
                });
            }
        });
    });

    // Si no hay ninguno marcado como oferta, generamos
    // ofertas automáticas con descuento del 15% al 35%
    if (!resultado.length) {
        categorias.forEach(cat => {
            (cat.productos || []).slice(0, 3).forEach(p => {
                if (vistos.has(p.nombre)) return;
                vistos.add(p.nombre);
                const descuento = 15 + Math.floor(Math.random() * 20);
                resultado.push({
                    ...p,
                    categoria: cat.nombre,
                    enOferta: true,
                    etiquetaOferta: `-${descuento}%`,
                    precioRegular: p.precio,
                    precio: Math.round(p.precio * (1 - descuento / 100) * 10) / 10,
                    descuento
                });
            });
        });
    }

    return resultado;
}


/* =====================================================
   ACTUALIZAR CONTADOR DE OFERTAS
===================================================== */




