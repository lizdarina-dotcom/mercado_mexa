/* Controlador de usuario: conecta eventos de cuenta y sesión. */

function prepararEventos() {

    // =========================
    // ASISTENTE NETO
    // =========================

    const botonAsistente = document.querySelector('.chip-ai[data-categoria="ia"]');

    if (botonAsistente) {
        botonAsistente.addEventListener("click", abrirAsistenteNeto);
    }

    


    document
        .getElementById("botonUbicacion")
        ?.addEventListener("click", obtenerUbicacion);

    document
        .getElementById("heroUbicacion")
        ?.addEventListener("click", obtenerUbicacion);

    document
        .getElementById("heroVerMapa")
        ?.addEventListener("click", () => {

            document
                .getElementById("mapaSeccion")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        });


    document
        .getElementById("centrarMapa")
        ?.addEventListener("click", () => {

            if (mapa && ubicacionUsuario) {

                mapa.flyTo(
                    [
                        ubicacionUsuario.lat,
                        ubicacionUsuario.lng
                    ],
                    14,
                    {
                        duration: 1.2
                    }
                );

            }

        });


    document
        .getElementById("botonLista")
        ?.addEventListener("click", () => {

            const tiendaSeleccionada =
                tiendaPickupTemporalId
                    ? tiendas.find(
                        t =>
                            String(t.id) ===
                            String(tiendaPickupTemporalId)
                    )
                    : tiendas[0];

            if (!tiendaSeleccionada) {

                mostrarNotificacionCuenta(
                    "Sin tiendas",
                    "No hay tiendas disponibles para mostrar la ruta.",
                    "⚠️"
                );

                return;

            }

            if (!ubicacionUsuario) {

                mostrarNotificacionCuenta(
                    "Ubicación no disponible",
                    "Activa tu ubicación para ver la ruta del repartidor.",
                    "⌖"
                );

                return;

            }

            verRuta(String(tiendaSeleccionada.id));

        });

    document
        .getElementById("navLista")
        ?.addEventListener("click", () => abrirLista(true));


    document
        .getElementById("cerrarLista")
        ?.addEventListener("click", () => {

            document
                .getElementById("modalLista")
                ?.classList.remove("activa");

        });






/* =====================================================
   ELEMENTOS DE CUENTA
   Las cuentas, el login, el registro, los terminos y los
   roles viven en app/controllers/RolesController.js. Aqui solo se usan estos dos
   modales, y tampoco hay copia: si se declara dos veces con
   const, el script lanza "Identifier has already been declared".
===================================================== */

const modalCuenta =
    document.getElementById("modalCuenta");

const modalLogin =
    document.getElementById("modalLogin");




    document
        .querySelectorAll(".ventana-modal")
        .forEach(modal => {

            modal.addEventListener("click", e => {

                if (e.target === modal) {
                    modal.classList.remove("activa");
                }

            });

        });


    document
        .getElementById("mostrarMas")
        ?.addEventListener("click", () => {

            tiendasVisibles =
                tiendasVisibles >= tiendas.length
                    ? 6
                    : tiendas.length;

            mostrarTiendas();

        });


    document
        .getElementById("buscador")
        ?.addEventListener("input", e => {

            const texto = e.target.value.trim();
            const busquedaNormalizada = normalizarBusqueda(texto);
            const terminos = terminosBusqueda(texto);
            const productos = actualizarResultadosBusqueda(texto);

            document
                .querySelectorAll(".tarjeta-tienda")
                .forEach(card => {

                    const contenidoTienda = normalizarBusqueda(card.textContent);
                    const visible = !busquedaNormalizada ||
                        terminos.some(termino => contenidoTienda.includes(termino)) ||
                        productos.length > 0;

                    card.style.display =
                        visible ? "" : "none";

                });

        });

    document
        .getElementById("buscador")
        ?.addEventListener("keydown", e => {
            if (e.key !== "Enter") return;

            const resultados = obtenerResultadosProductos(e.target.value);
            if (resultados[0]) abrirResultadoProducto(resultados[0]);
        });

    document.addEventListener("click", e => {
        if (!e.target.closest(".buscador")) {
            document.getElementById("buscadorResultados")?.classList.remove("visible");
        }
    });


    document
        .getElementById("mobileMenu")
        ?.addEventListener("click", () => {

            document
                .querySelector(".sidebar")
                ?.classList.toggle("abierta");

        });


    document
        .querySelectorAll(".nav-item[data-target]")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                document
                    .querySelectorAll(".nav-item")
                    .forEach(n =>
                        n.classList.remove("activo")
                    );

                btn.classList.add("activo");

                const target = btn.dataset.target;


                if (target === "mapa") {

                    document
                        .getElementById("mapaSeccion")
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });

                }


                if (target === "inicio") {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }


                if (target === "catalogo") {

                    if (tiendas.length > 0) {

                        entrarTienda(
                            tiendas[0].id
                        );

                    } else if (tiendasDesdeAPI?.length || tiendasNetoZona?.length) {

                        // El catálogo no debe depender de que el usuario comparta su ubicación.
                        const tienda = tiendasDesdeAPI?.[0] || tiendasNetoZona[0];
                        abrirCatalogo(tienda);

                    } else {

                        alert(
                            "Primero espera a que aparezcan las tiendas reales."
                        );

                    }

                }

                if (target === "favoritos") {
                    abrirFavoritos();
                }

                if (target === "ofertas") {
    abrirOfertas();
}

            });

        });

}


/* =========================
   LISTA
========================= */
