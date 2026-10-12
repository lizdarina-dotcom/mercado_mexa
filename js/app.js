/*
 * Punto de entrada del frontend.
 * Orden: librerías externas, modelos, vistas y controladores.
 * Los módulos se mantienen como scripts clásicos para conservar las funciones
 * globales que usa el HTML y comunicarse sin un framework o bundler.
 */
(() => {
    const scripts = [
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
        "https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js",
        "https://unpkg.com/@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl.js",
        "js/mapa-google.js",
        "app/models/ApiModel.js",
        "app/models/AppState.js",
        "app/models/CatalogoModel.js",
        "app/models/CarritoModel.js",
        "app/models/TiendasModel.js",
        "app/models/UsuarioModel.js",
        "app/models/BusquedaModel.js",
        "app/models/FavoritosModel.js",
        "app/views/AppView.js",
        "app/views/BusquedaView.js",
        "app/views/CatalogoView.js",
        "app/views/CarritoView.js",
        "app/views/FavoritosView.js",
        "app/views/TiendasView.js",
        "app/controllers/BusquedaController.js",
        "app/controllers/UsuarioController.js",
        "app/controllers/TiendasController.js",
        "app/controllers/CheckoutController.js",
        "app/controllers/CarritoController.js",
        "app/controllers/CatalogoController.js",
        "app/controllers/FavoritosController.js",
        "app/controllers/AsistenteController.js",
        "app/controllers/OfertasController.js",
        "app/controllers/AppController.js",
        "app/controllers/RolesController.js"
    ];

    function cargarScript(ruta) {
        return new Promise((resolver, rechazar) => {
            const script = document.createElement("script");
            script.src = ruta;
            script.onload = resolver;
            script.onerror = () => rechazar(new Error(`No se pudo cargar ${ruta}`));
            document.head.appendChild(script);
        });
    }

    async function iniciar() {
        try {
            for (const ruta of scripts) {
                await cargarScript(ruta);
            }
            document.dispatchEvent(new Event("mercado-mexa:modules-ready"));
        } catch (error) {
            console.error("[Mercado Mexa] Error al cargar la aplicación:", error);
            const mensaje = document.getElementById("splashTexto");
            if (mensaje) mensaje.textContent = "No se pudo cargar la aplicación. Recarga la página.";
        }
    }

    iniciar();
})();
