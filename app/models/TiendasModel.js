/* Modelo de tiendas: datos, direcciones y cálculos de distancia. */

function calcularDistancia(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371;


    const dLat =
        (lat2 - lat1) *
        Math.PI /
        180;


    const dLon =
        (lon2 - lon1) *
        Math.PI /
        180;


    const a =

        Math.sin(
            dLat / 2
        ) ** 2 +

        Math.cos(
            lat1 *
            Math.PI /
            180
        ) *

        Math.cos(
            lat2 *
            Math.PI /
            180
        ) *

        Math.sin(
            dLon / 2
        ) ** 2;


    return R *
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

}


/* =========================
   TIEMPOS
========================= */

function calcularTiempos(
    dist
) {

    const velocidades = {

        pie: 5,

        bicicleta: 15,

        motocicleta: 40,

        auto: 35

    };


    const calc =
        velocidad =>
            Math.max(
                1,
                Math.round(
                    (
                        dist /
                        velocidad
                    ) * 60
                )
            );


    return {

        pie:
            calc(
                velocidades.pie
            ),

        bicicleta:
            calc(
                velocidades.bicicleta
            ),

        motocicleta:
            calc(
                velocidades.motocicleta
            ),

        auto:
            calc(
                velocidades.auto
            )

    };

}


function formatearTiempo(
    min
) {

    if (min < 60)
        return `${min} min`;


    const h =
        Math.floor(
            min / 60
        );


    const m =
        min % 60;


    return m === 0

        ? `${h} h`

        : `${h} h ${m} min`;

}


/* =========================
   MOSTRAR TIENDAS
========================= */


const tiendasNetoZona = [

    {
        id: "neto-tlaxiaco-hidalgo",

        nombre:
            "Neto Tlaxiaco",

        ciudad:
            "Tlaxiaco",

        direccion:
            "C. Hidalgo 17, Centro, Tlaxiaco, Oaxaca",

        lat:
            17.2678,

        lng:
            -97.6790

    },


    {
        id: "neto-tlaxiaco-rafael",

        nombre:
            "Tiendas Neto Tlaxiaco",

        ciudad:
            "Tlaxiaco",

        direccion:
            "Rafael Reyes Espíndola 8, Centro, Tlaxiaco, Oaxaca",

        lat:
            17.2671,

        lng:
            -97.6788

    },


    {
        id: "neto-tlaxiaco-juarez",

        nombre:
            "Tienda Neto Tlaxiaco Juárez 1331",

        ciudad:
            "Tlaxiaco",

        direccion:
            "C. Hipódromo 214B, Centro, Tlaxiaco, Oaxaca",

        lat:
            17.2690,

        lng:
            -97.6778

    },


    {
        id: "neto-chalcatongo-1325",

        nombre:
            "Tienda Neto Chalcatongo 1325",

        ciudad:
            "Chalcatongo de Hidalgo",

        direccion:
            "20 de Noviembre 100, Chalcatongo de Hidalgo, Oaxaca",

        lat:
            17.0292,

        lng:
            -97.5694

    }

];


/* =========================
   BUSCAR TIENDAS NETO
========================= */


function construirDireccion(
    tags,
    lat,
    lng
) {

    const partes = [

        tags["addr:housenumber"],

        tags["addr:street"],

        tags["addr:suburb"],

        tags["addr:city"] ||
        tags["addr:town"] ||
        tags["addr:village"],

        tags["addr:state"]

    ].filter(Boolean);


    return partes.length

        ? partes.join(", ")

        : `Ubicación: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

}


/* =========================
   LISTA SEMANAL
========================= */
