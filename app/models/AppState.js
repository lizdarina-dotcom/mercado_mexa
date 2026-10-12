/* Modelo de estado: valores compartidos por los módulos de la aplicación. */

let mapa = null;
let ubicacionUsuario = null;
let direccionEntregaMapa = null;
let tiendaPickupTemporalId = null;
let tiendaPickupSeleccionadaId = null;
let tiendaEnvioSeleccionadaId = null;
let modalidadSelectorTienda = "pickup";
let direccionEnvioAbierta = false;
let filtroTiendasPedido = "todas";
let rutaActual = null;
let marcadoresRuta = [];
let marcadorUsuario = null;
let marcadoresTiendas = [];
let tiendas = [];
let tiendasVisibles = 6;
let tiendasDesdeAPI = null;
let ticketMercadoPagoActual = null;

let carrito = JSON.parse(localStorage.getItem("carritoMexa") || "[]");
carrito = carrito.map(p => ({
    ...p,
    cantidad: p.cantidad || 1,
    comprado: Boolean(p.comprado)
}));
let favoritosMexa =
    JSON.parse(
        localStorage.getItem("favoritosMexa") || "[]"
    );

let temporizadorLista = null;
let detallesTiendaAbiertos = {};
