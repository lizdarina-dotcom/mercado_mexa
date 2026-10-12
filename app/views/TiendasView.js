/* Vista de tiendas: dibuja el mapa, marcadores y resultados. */

function cantidadTiendasTexto(
    cantidad
) {

    const titulo =
        document.querySelector(
            ".stores-head h2"
        );


    if (!titulo) return;


    titulo.innerHTML =
        `TIENDAS NETO <em>CERCA</em>
        <span style="font-size:11px;color:#777">
            (${cantidad})
        </span>`;

}


/* =========================
   DISTANCIA
========================= */


function mostrarTiendas() {

    listaTiendas.innerHTML = "";


    if (!tiendas.length)
        return;


    tiendas
        .slice(
            0,
            tiendasVisibles
        )
        .forEach(
            (t, index) => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "tarjeta-tienda";


                div.style.animationDelay =
                    `${index * 45}ms`;


                div.innerHTML = `

                    <div class="store-top">

                        <div class="store-icon">
                            N
                        </div>


                        <div class="store-main">

                            <h3>
                                ${escapeHTML(t.nombre)}
                            </h3>

                            <p>
                                📍
                                ${escapeHTML(t.direccion)}
                            </p>

                        </div>


                        <div class="store-distance">

                            <strong>
                                ${t.distancia.toFixed(2)} km
                            </strong>

                            <small>
                                ${
                                    index === 0
                                    ? "MÁS CERCANA"
                                    : "TIENDA REAL"
                                }
                            </small>

                        </div>

                    </div>


                    <div class="store-times">

                        <span>
                            🚶
                            ${formatearTiempo(t.tiempos.pie)}
                        </span>

                        <span>
                            🚗
                            ${formatearTiempo(t.tiempos.auto)}
                        </span>

                        <span>
                            🏍
                            ${formatearTiempo(t.tiempos.motocicleta)}
                        </span>

                        <span>
                            🚲
                            ${formatearTiempo(t.tiempos.bicicleta)}
                        </span>

                    </div>


                    <div class="store-buttons">

                        <button
                            class="btn-route"
                            onclick="verRuta('${t.id}')">

                            ↗ VER RUTA

                        </button>


                        <button
                            class="btn-enter"
                            onclick="entrarTienda('${t.id}')">

                            ENTRAR →

                        </button>

                    </div>

                `;


                listaTiendas
                    .appendChild(div);

            }
        );

}


/* =========================
   MARCADORES TIENDAS
========================= */

function mostrarMarcadores() {

    marcadoresTiendas
        .forEach(
            m =>
                mapa.removeLayer(m)
        );


    marcadoresTiendas = [];


    tiendas.forEach(t => {

        const icono =
            L.divIcon({

                className:
                    "marcador-tienda",

                html:
                    `<div class="store-pin">
                        <span>N</span>
                    </div>`,

                iconSize:
                    [38, 38],

                iconAnchor:
                    [19, 34]

            });


        const marcador =
            L.marker(
                [
                    t.lat,
                    t.lng
                ],
                {
                    icon: icono
                }
            )
            .addTo(mapa);


        marcador.bindPopup(`

            <div
                style="
                    font-family:Inter,sans-serif;
                    min-width:180px
                "
            >

                <strong>
                    ${escapeHTML(t.nombre)}
                </strong>

                <br>

                <small>
                    ${escapeHTML(t.direccion)}
                </small>

                <br><br>

                📏
                ${t.distancia.toFixed(2)}
                km

                <br>

                🚶
                ${formatearTiempo(
                    t.tiempos.pie
                )}

                <br>

                🚗
                ${formatearTiempo(
                    t.tiempos.auto
                )}

                <br><br>

                <button
                    onclick="verRuta('${t.id}')"
                    style="
                        width:100%;
                        padding:9px;
                        border:0;
                        background:#111820;
                        color:white;
                        font-weight:800;
                        border-radius:6px
                    "
                >

                    VER RUTA REAL

                </button>

            </div>

        `);


        marcadoresTiendas
            .push(marcador);

    });

}


/* =========================
   RUTA REAL
========================= */


function crearMapa(
    lat,
    lng,
    esDemo = false
) {

    if (mapa) {
        mapa.remove();
    }


    mapa = L.map("mapa", {

        zoomControl: false,

        attributionControl: false

    }).setView(
        [lat, lng],
        13
    );


    /*
     * Base vectorial moderna; los marcadores y rutas de Leaflet se
     * conservan por encima de esta capa.
     */
    window.mapa = mapa;
    window.ubicacionUsuario = ubicacionUsuario || { lat, lng };
    window.crearTiendasReales = crearTiendasReales;
    window.obtenerUbicacion = obtenerUbicacion;

    if (window.GoogleMapsMexa && typeof window.GoogleMapsMexa.inicializarCapas === "function") {
        window.GoogleMapsMexa.inicializarCapas(mapa);
        window.GoogleMapsMexa.configurarEventos();
    } else if (typeof L.maplibreGL === "function") {

        L.maplibreGL({
            style: "https://tiles.openfreemap.org/styles/liberty"
        }).addTo(mapa);

    } else {

        L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {

            maxZoom: 19,

            attribution:
                "Tiles &copy; Esri — Sources: Esri, HERE, Garmin, FAO, NOAA, USGS, &copy; OpenStreetMap contributors"

        }

        ).addTo(mapa);
    }


    if (!esDemo) {

        crearMarcadorUsuario(
            lat,
            lng
        );

        crearTiendasReales(
            lat,
            lng
        );

    } else {

        listaTiendas.innerHTML = `

            <div class="empty-stores">

                <strong>
                    MAPA EN MODO DEMOSTRACIÓN
                </strong>

                <p>
                    Activa el GPS para buscar tiendas Neto reales alrededor de tu ubicación.
                </p>

            </div>

        `;


        storesStatus.innerHTML =
            `<span>Esperando GPS real...</span>`;


        distanciaCercana.textContent =
            "ACTIVA TU GPS";

    }


    setTimeout(
        () => mapa.invalidateSize(),
        150
    );

}


/* =========================
   MARCADOR USUARIO
========================= */


function crearMarcadorUsuario(
    lat,
    lng
) {

    if (
        marcadorUsuario &&
        mapa
    ) {

        mapa.removeLayer(
            marcadorUsuario
        );

    }


    const icono = L.divIcon({

        className:
            "marcador-usuario",

        html:
            `<div class="user-dot"></div>`,

        iconSize:
            [22, 22],

        iconAnchor:
            [11, 11]

    });


    marcadorUsuario =
        L.marker(
            [lat, lng],
            {
                icon: icono
            }
        )
        .addTo(mapa)
        .bindPopup(
            "<strong>⌖ Tú estás aquí</strong>"
        );

}

/* =========================
   TIENDAS NETO
   BASE LOCAL
========================= */
