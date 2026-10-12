/* Controlador de tiendas: coordina ubicación, mapa y rutas. */

function obtenerUbicacion() {

    estadoUbicacion.textContent =
        "SOLICITANDO GPS...";


    storesStatus.innerHTML = `
        <div class="mini-loader"></div>
        <span>Obteniendo tu ubicación real...</span>
    `;


    listaTiendas.innerHTML = "";


    if (!navigator.geolocation) {

        mostrarErrorUbicacion(
            "Tu navegador no permite geolocalización."
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        async pos => {

            ubicacionUsuario = {

                lat:
                    pos.coords.latitude,

                lng:
                    pos.coords.longitude

            };


            estadoUbicacion.textContent =
                "GPS ACTIVO";


            crearMapa(
                ubicacionUsuario.lat,
                ubicacionUsuario.lng
            );


            await obtenerNombreLugar(
                ubicacionUsuario.lat,
                ubicacionUsuario.lng
            );

        },


        err => {

            let mensaje =
                "No fue posible obtener tu ubicación.";


            if (err.code === 1) {

                mensaje =
                    "Permiso de ubicación rechazado. Activa Ubicación en el candado del navegador.";

            } else if (err.code === 2) {

                mensaje =
                    "No se pudo determinar tu ubicación.";

            } else if (err.code === 3) {

                mensaje =
                    "La ubicación tardó demasiado en responder.";

            }


            mostrarErrorUbicacion(mensaje);

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );

}


/* =========================
   ERROR GPS
========================= */

function mostrarErrorUbicacion(mensaje) {

    estadoUbicacion.textContent =
        "GPS NO DISPONIBLE";


    storesStatus.innerHTML = `
        <div class="empty-stores">

            <strong>
                ⌖ NO SE PUDO ACTIVAR EL GPS
            </strong>

            <p>
                ${mensaje}
            </p>

            <button
                class="btn-naranja"
                style="margin-top:12px;min-height:34px"
                onclick="obtenerUbicacion()">

                REINTENTAR

            </button>

        </div>
    `;


    if (!mapa) {

        crearMapa(
            17.0672,
            -97.6835,
            true
        );

    }

}


/* =========================
   MAPA
========================= */

/* ---
   Esta función crea el mapa que se ve en la pantalla,
   posiciona la vista del usuario y deja listo el centro
   de trabajo para cada tienda o ruta que se abra.
--- */


async function crearTiendasReales(
    lat,
    lng
) {

    tiendas = [];

    tiendasVisibles = 6;


    storesStatus.innerHTML = `

        <div class="mini-loader"></div>

        <span>
            Localizando tiendas Neto...
        </span>

    `;


    listaTiendas.innerHTML = "";


    distanciaCercana.textContent =
        "BUSCANDO...";


    /*
     * Las tiendas salen de la base de datos (tabla tiendas), no de un
     * servicio externo. El id que viaja al servidor es el slug, que es
     * la misma clave que usa api/pedidos.php para resolver la tienda,
     * asi el checkout no depende de que Overpass responda.
     */

    try {

        if (!tiendasDesdeAPI) {

            tiendasDesdeAPI = await API.tiendas();

        }

        tiendas = tiendasDesdeAPI.map(tienda => ({
            ...tienda,
            distancia: calcularDistancia(lat, lng, tienda.lat, tienda.lng)
        }));


    } catch (error) {

        console.warn("No se pudieron obtener las tiendas de la API.", error);

        /* Respaldo sin conexion. Los ids de esta lista ya son los
           slugs de la base de datos, asi que el checkout funciona. */
        tiendas = tiendasNetoZona.map(tienda => ({
            ...tienda,
            distancia: calcularDistancia(lat, lng, tienda.lat, tienda.lng)
        }));
    }


    /*
     * Ordenar por distancia.
     */

    tiendas.sort(
        (a, b) =>
            a.distancia -
            b.distancia
    );


    /*
     * Preparar información.
     */

    tiendas.forEach(
        tienda => {

            tienda.categoria =
                "TIENDA NETO";

            tienda.tiempos =
                calcularTiempos(
                    tienda.distancia
                );

        }
    );

    window.tiendas = tiendas;


    /*
     * Si no hay tiendas.
     */

    if (!tiendas.length) {

        storesStatus.innerHTML = `

            <div class="empty-stores">

                <strong>
                    NO ENCONTRAMOS TIENDAS NETO
                </strong>

                <p>
                    No hay tiendas disponibles
                    en este momento.
                </p>

            </div>

        `;

        listaTiendas.innerHTML = "";

        distanciaCercana.textContent =
            "SIN TIENDAS";

        return;

    }


    /*
     * Actualizar contador.
     */

    cantidadTiendasTexto(
        tiendas.length
    );


    storesStatus.innerHTML = `

        <span>
            ✓ ${tiendas.length}
            tiendas Neto encontradas
        </span>

    `;


    /*
     * Mostrar tarjetas.
     */

    mostrarTiendas();


    /*
     * Mostrar marcadores.
     */

    mostrarMarcadores();


    /*
     * Mostrar distancia más cercana.
     */

    distanciaCercana.textContent =
        `${tiendas[0].distancia.toFixed(2)} KM · MÁS CERCANA`;


    /*
     * Ajustar mapa.
     */

    const puntos = [

        [
            lat,
            lng
        ],

        ...tiendas
            .slice(0, 12)
            .map(
                tienda => [

                    tienda.lat,
                    tienda.lng

                ]
            )

    ];


    if (
        mapa &&
        puntos.length > 1
    ) {

        mapa.fitBounds(
            puntos,
            {

                padding:
                    [45, 45],

                maxZoom:
                    14

            }
        );

    }

}


/* =========================
   DIRECCIÓN
========================= */


async function verRuta(id) {

    const tienda =
        tiendas.find(
            t =>
                String(t.id) ===
                String(id)
        );


    if (
        !tienda ||
        !ubicacionUsuario
    ) {

        alert(
            "Necesitamos tu ubicación GPS para calcular una ruta."
        );

        return;

    }


    limpiarRuta();


    try {

        storesStatus.innerHTML = `

            <div class="mini-loader"></div>

            <span>
                Calculando ruta real por calles...
            </span>

        `;


        const url =

            `https://router.project-osrm.org/route/v1/driving/` +

            `${ubicacionUsuario.lng},${ubicacionUsuario.lat};` +

            `${tienda.lng},${tienda.lat}` +

            `?overview=full&geometries=geojson`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "No se pudo consultar OSRM."
            );

        }


        const data =
            await response.json();


        if (
            !data.routes?.length
        ) {

            throw new Error(
                "No existe una ruta."
            );

        }


        const ruta =
            data.routes[0];


        const distanciaReal =
            ruta.distance / 1000;


        const duracionAuto =
            Math.round(
                ruta.duration / 60
            );


        rutaActual =
            L.geoJSON(
                ruta.geometry,
                {

                    style: {

                        color:
                            "#ff4b12",

                        weight:
                            7,

                        opacity:
                            .95

                    }

                }
            ).addTo(mapa);


        const inicio =
            L.marker(
                [
                    ubicacionUsuario.lat,
                    ubicacionUsuario.lng
                ]
            )
            .addTo(mapa)
            .bindPopup(
                "⌖ Tu ubicación"
            );


        const destino =
            L.marker(
                [
                    tienda.lat,
                    tienda.lng
                ]
            )
            .addTo(mapa)
            .bindPopup(
                escapeHTML(
                    tienda.nombre
                )
            );


        marcadoresRuta.push(
            inicio,
            destino
        );


        mapa.fitBounds(
            rutaActual.getBounds(),
            {
                padding:
                    [70, 70],

                maxZoom:
                    16
            }
        );


        const tiempos =
            calcularTiempos(
                distanciaReal
            );


        const panel =
            L.control({
                position:
                    "topright"
            });


        panel.onAdd =
            () => {

                const div =
                    L.DomUtil.create(
                        "div",
                        "panel-ruta"
                    );


                div.innerHTML = `

                    <div class="titulo-ruta">

                        <span>
                            RUTA REAL POR CALLES
                        </span>

                        <button
                            onclick="cerrarRuta()"
                        >
                            ×
                        </button>

                    </div>


                    <div class="nombre-ruta">

                        🏪
                        ${escapeHTML(
                            tienda.nombre
                        )}

                    </div>


                    <div
                        style="
                            padding:0 14px 8px;
                            font-size:8px;
                            color:#666
                        "
                    >

                        ${escapeHTML(
                            tienda.direccion
                        )}

                    </div>


                    <div class="datos-ruta">

                        <div>

                            📏

                            <strong>
                                ${distanciaReal.toFixed(2)}
                                km
                            </strong>

                            <br>

                            <small>
                                distancia real
                            </small>

                        </div>


                        <div>

                            🚗

                            <strong>
                                ${formatearTiempo(
                                    duracionAuto
                                )}
                            </strong>

                            <br>

                            <small>
                                en auto
                            </small>

                        </div>

                    </div>


                    <div class="modos-ruta">

                        <span>
                            🚶
                            <br>
                            A PIE
                            <br>
                            ${formatearTiempo(
                                tiempos.pie
                            )}
                        </span>


                        <span>
                            🚗
                            <br>
                            AUTO
                            <br>
                            ${formatearTiempo(
                                duracionAuto
                            )}
                        </span>


                        <span>
                            🏍
                            <br>
                            MOTO
                            <br>
                            ${formatearTiempo(
                                tiempos.motocicleta
                            )}
                        </span>


                        <span>
                            🚲
                            <br>
                            BICI
                            <br>
                            ${formatearTiempo(
                                tiempos.bicicleta
                            )}
                        </span>

                    </div>

                `;


                return div;

            };


        panel.addTo(mapa);

        window.panelRutaActual =
            panel;


        storesStatus.innerHTML =
            `<span>✓ Ruta calculada por calles</span>`;


    } catch (error) {

        console.error(error);


        storesStatus.innerHTML =
            `<span>No se pudo calcular la ruta.</span>`;


        alert(
            "No se pudo calcular la ruta real por calles en este momento."
        );

    }

}


/* =========================
   CERRAR RUTA
========================= */

function cerrarRuta() {

    limpiarRuta();


    if (
        ubicacionUsuario &&
        mapa
    ) {

        mapa.flyTo(

            [
                ubicacionUsuario.lat,
                ubicacionUsuario.lng
            ],

            13,

            {
                duration: 1
            }

        );

    }


    storesStatus.innerHTML =
        tiendas.length

            ? `<span>✓ ${tiendas.length} tiendas encontradas con datos reales</span>`

            : `<span>Esperando tiendas...</span>`;

}


/* =========================
   LIMPIAR RUTA
========================= */

function limpiarRuta() {

    if (
        rutaActual &&
        mapa
    ) {

        mapa.removeLayer(
            rutaActual
        );

    }


    rutaActual = null;


    marcadoresRuta
        .forEach(m => {

            if (mapa) {

                mapa.removeLayer(m);

            }

        });


    marcadoresRuta = [];


    if (
        window.panelRutaActual &&
        mapa
    ) {

        mapa.removeControl(
            window.panelRutaActual
        );

        window.panelRutaActual =
            null;

    }

}


/* =========================
   NOMBRE DE UBICACIÓN
========================= */

async function obtenerNombreLugar(
    lat,
    lon
) {

    try {

        const url =

            `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +

            `&lat=${lat}` +

            `&lon=${lon}` +

            `&zoom=10` +

            `&accept-language=es`;


        const response =
            await fetch(url);


        const data =
            await response.json();


        const a =
            data.address || {};

        const calle = [a.house_number, a.road].filter(Boolean).join(" ");
        const colonia = a.neighbourhood || a.suburb || a.quarter || "";
        const municipio = a.city || a.town || a.village || a.municipality || a.county || "";
        const codigoPostal = a.postcode || "";
        const partesDireccion = [calle, colonia, municipio, codigoPostal, a.state].filter(Boolean);
        direccionEntregaMapa = {
            calle,
            colonia,
            municipio,
            codigoPostal,
            completo: partesDireccion.join(", ") || data.display_name || `Ubicación: ${lat.toFixed(5)}, ${lon.toFixed(5)}`
        };
        window.direccionEntregaMapa = direccionEntregaMapa;


        const lugar =

            a.city ||

            a.town ||

            a.village ||

            a.municipality ||

            a.county ||

            "Ubicación detectada";


        estadoUbicacion.textContent =
            lugar.toUpperCase();

        return direccionEntregaMapa;

    } catch (error) {

        estadoUbicacion.textContent =
            "GPS ACTIVO";

        return null;

    }

}
/* =========================
   CATÁLOGO
========================= */
