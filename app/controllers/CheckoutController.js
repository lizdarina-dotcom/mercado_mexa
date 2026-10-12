/* Controlador de checkout: coordina dirección, pago y confirmación. */

function abrirCheckoutLista() {
    if (!carrito.length) {
        mostrarNotificacionCuenta("Lista vacía", "Agrega productos antes de continuar al pago.");
        return;
    }

    const sesion = obtenerSesionActual() || {};
    const modal = document.getElementById("modalCheckout");
    const contenido = document.getElementById("contenidoCheckout");
    if (!modal || !contenido) return;

    const sucursales = obtenerTiendasParaPedido();
    const tiendaInicial = sucursales[0] || {};
    tiendaPickupSeleccionadaId = tiendaPickupSeleccionadaId || String(tiendaInicial.id || "");
    tiendaEnvioSeleccionadaId = tiendaEnvioSeleccionadaId || String(tiendaInicial.id || "");
    const opcionesPickup = sucursales.map(tienda => `
        <option value="${escapeHTML(String(tienda.id))}" ${String(tienda.id) === tiendaPickupSeleccionadaId ? "selected" : ""}>${escapeHTML(tienda.nombre)} · ${escapeHTML(tienda.direccion)}</option>
    `).join("");
    const opcionesEnvio = sucursales.map(tienda => `
        <option value="${escapeHTML(String(tienda.id))}" ${String(tienda.id) === tiendaEnvioSeleccionadaId ? "selected" : ""}>${escapeHTML(tienda.nombre)} · ${escapeHTML(tienda.direccion)}</option>
    `).join("");
    const direccionMapa = direccionEntregaMapa || {};
    direccionEnvioAbierta = false;

    contenido.innerHTML = `
        <button class="cerrar-modal" type="button" aria-label="Cerrar" onclick="document.getElementById('modalCheckout').classList.remove('activa')">×</button>
        <span class="section-label">MERCADO MEXA · ENTREGA</span>
        <h2>¿Cómo quieres tu pedido?</h2>
        <p class="checkout-aviso">Elige recogerlo en una tienda o recibirlo en tu domicilio.</p>
        <form id="formCheckout" class="checkout-form">
            <div id="checkoutFormularioVista">
            <input type="hidden" name="modalidad" value="pickup">
            <div class="checkout-modalidades" role="group" aria-label="Modalidad del pedido">
                <button type="button" class="checkout-modalidad activa" data-modalidad="pickup" aria-pressed="true" onclick="seleccionarModalidadPedido('pickup')">
                    <span>🏪</span><strong>Pickup</strong><small>Recoge en tienda</small>
                </button>
                <button type="button" class="checkout-modalidad" data-modalidad="envio" aria-pressed="false" onclick="seleccionarModalidadPedido('envio')">
                    <span>🚚</span><strong>Envío</strong><small>Recibe en casa</small>
                </button>
            </div>
            <section class="checkout-modo-panel" id="panelPickup">
                <span class="checkout-label-tienda">Tienda para recoger</span>
                <button type="button" class="checkout-tienda-resumen" onclick="abrirSelectorTiendasPedido('pickup')" aria-label="Elegir tienda para pickup">
                    <span class="checkout-tienda-icono">🏪</span>
                    <span class="checkout-tienda-resumen-texto">
                        <small id="checkoutTiendaTipo">TIENDA NETO</small>
                        <strong id="checkoutTiendaNombre">${escapeHTML(tiendaInicial.nombre || "Elige una tienda")}</strong>
                        <span id="checkoutTiendaDireccion">${escapeHTML(tiendaInicial.direccion || "")}</span>
                    </span>
                    <span class="checkout-tienda-flecha" aria-hidden="true">›</span>
                </button>
                <select name="tiendaPickup" id="checkoutTiendaPickup" class="checkout-select-oculto" aria-hidden="true" tabindex="-1">${opcionesPickup}</select>
                <p class="checkout-modo-descripcion">Recoge tu pedido en tu tienda preferida.</p>
                <div class="checkout-horarios">
                    <button type="button" class="btn-link-cuenta" id="btnVerHorarioPickup" aria-expanded="false" onclick="alternarHorarioPickup()">Ver horario de servicio</button>
                    <p id="checkoutHorarioPickup" aria-live="polite" hidden></p>
                </div>
                ${sesion.rol === "usuario" ? "" : '<button class="btn-outline grande" type="button" onclick="abrirAccesoCheckout()">Iniciar sesión</button>'}
            </section>
            <section class="checkout-modo-panel" id="panelEnvio" hidden>
                <div class="checkout-direccion-card">
                    <div class="checkout-direccion-card-info">
                        <span class="checkout-direccion-pin" aria-hidden="true">⌖</span>
                        <div>
                            <strong id="checkoutDomicilioResumen">${escapeHTML(direccionMapa.completo || sesion.direccion || "Agrega una dirección para recibir el pedido")}</strong>
                            <small>${direccionMapa.completo ? "Ubicación del mapa" : "Activa tu ubicación o agrega tu domicilio"}</small>
                        </div>
                    </div>
                    <button type="button" class="btn-naranja checkout-agregar-direccion" id="btnAgregarDireccion" aria-expanded="false" onclick="alternarDireccionEnvioCheckout()">Agregar dirección</button>
                    <div class="checkout-direccion-form" id="formularioDireccionEnvio" hidden>
                        <button type="button" class="btn-outline checkout-ubicacion-btn" onclick="usarUbicacionMapaEnCheckout()">⌖ Usar ubicación del mapa</button>
                        <label>Calle y número
                            <input name="calle" type="text" value="${escapeHTML(direccionMapa.calle || sesion.direccion || "")}" autocomplete="street-address" disabled>
                        </label>
                        <div class="checkout-campos-dos">
                            <label>Colonia
                                <input name="colonia" type="text" value="${escapeHTML(direccionMapa.colonia || "")}" autocomplete="address-level3" disabled>
                            </label>
                            <label>Municipio o localidad
                                <input name="municipio" type="text" value="${escapeHTML(direccionMapa.municipio || "")}" autocomplete="address-level2" disabled>
                            </label>
                        </div>
                        <div class="checkout-campos-dos">
                            <label>Código postal
                                <input name="codigoPostal" type="text" inputmode="numeric" maxlength="5" value="${escapeHTML(direccionMapa.codigoPostal || "")}" autocomplete="postal-code" disabled>
                            </label>
                            <label>Referencias para llegar
                                <input name="referencias" type="text" placeholder="Color de fachada, entre calles..." disabled>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="checkout-envio-origen">
                    <div class="checkout-envio-tienda">
                        <span class="checkout-envio-tienda-texto">
                            <strong>Envío desde tienda</strong>
                            <small>Frescos, despensa y más.</small>
                        </span>
                    </div>
                    <select name="tiendaEnvio" id="checkoutTiendaEnvio" class="checkout-select-oculto" aria-hidden="true" tabindex="-1" disabled>${opcionesEnvio}</select>
                </div>
                ${sesion.rol === "usuario" ? "" : '<button class="btn-outline grande" type="button" onclick="abrirAccesoCheckout()">Iniciar sesión</button>'}
            </section>
            <button class="btn-naranja grande" type="submit">Confirmar pedido</button>
            </div>
            <section id="checkoutResumenVista" class="checkout-resumen-pedido" hidden></section>
        </form>
    `;

    modal.classList.add("activa");
    const form = document.getElementById("formCheckout");
    form?.addEventListener("submit", confirmarPedidoLista);
    sincronizarTiendasCheckout();
}

function obtenerTiendasParaPedido() {
    return tiendas.length ? tiendas : tiendasNetoZona;
}

function actualizarDetalleHorarioPickup() {
    const detalle = document.getElementById("checkoutHorarioPickup");
    const select = document.getElementById("checkoutTiendaPickup");
    if (!detalle || !select) return;

    const tienda = obtenerTiendasParaPedido().find(item => String(item.id) === String(select.value));
    const horario = String(tienda?.horario || "").trim();
    detalle.textContent = horario
        ? `Horario de servicio: ${horario}`
        : "Horario no disponible para esta sucursal. Confirma directamente en la tienda.";
}

function alternarHorarioPickup() {
    const detalle = document.getElementById("checkoutHorarioPickup");
    const boton = document.getElementById("btnVerHorarioPickup");
    if (!detalle || !boton) return;

    const mostrar = detalle.hidden;
    if (mostrar) actualizarDetalleHorarioPickup();

    detalle.hidden = !mostrar;
    boton.setAttribute("aria-expanded", String(mostrar));
    boton.textContent = mostrar ? "Ocultar horario" : "Ver horario de servicio";
}

function seleccionarModalidadPedido(modalidad) {
    const form = document.getElementById("formCheckout");
    if (!form) return;

    const esEnvio = modalidad === "envio";
    form.querySelector('[name="modalidad"]').value = esEnvio ? "envio" : "pickup";
    document.getElementById("panelPickup").hidden = esEnvio;
    document.getElementById("panelEnvio").hidden = !esEnvio;
    document.querySelectorAll(".checkout-modalidad").forEach(boton => {
        const seleccionado = boton.dataset.modalidad === modalidad;
        boton.classList.toggle("activa", seleccionado);
        boton.setAttribute("aria-pressed", String(seleccionado));
    });

    document.getElementById("formularioDireccionEnvio").querySelectorAll("input").forEach(campo => {
        campo.disabled = !esEnvio || !direccionEnvioAbierta;
        campo.required = esEnvio && direccionEnvioAbierta && ["calle", "colonia", "municipio"].includes(campo.name);
    });
    const tiendaEnvio = document.getElementById("checkoutTiendaEnvio");
    tiendaEnvio.disabled = !esEnvio;
    tiendaEnvio.required = esEnvio;
}

function alternarDireccionEnvioCheckout() {
    const form = document.getElementById("formCheckout");
    const detalle = document.getElementById("formularioDireccionEnvio");
    const boton = document.getElementById("btnAgregarDireccion");
    if (!form || !detalle || !boton) return;

    direccionEnvioAbierta = !direccionEnvioAbierta;
    detalle.hidden = !direccionEnvioAbierta;
    boton.setAttribute("aria-expanded", String(direccionEnvioAbierta));
    boton.textContent = direccionEnvioAbierta ? "Ocultar dirección" : "Agregar dirección";

    form.querySelectorAll("#formularioDireccionEnvio input").forEach(campo => {
        campo.disabled = !direccionEnvioAbierta;
        campo.required = direccionEnvioAbierta && ["calle", "colonia", "municipio"].includes(campo.name);
    });
}

function actualizarResumenDireccionEnvio() {
    const form = document.getElementById("formCheckout");
    const resumen = document.getElementById("checkoutDomicilioResumen");
    if (!form || !resumen) return;

    const partes = [form.elements.calle.value, form.elements.colonia.value, form.elements.municipio.value, form.elements.codigoPostal.value].map(valor => valor.trim()).filter(Boolean);
    resumen.textContent = partes.join(", ") || "Agrega una dirección para recibir el pedido";
}

function sincronizarTiendasCheckout() {
    document.getElementById("formularioDireccionEnvio")?.addEventListener("input", actualizarResumenDireccionEnvio);
}

async function usarUbicacionMapaEnCheckout() {
    if (!direccionEntregaMapa && ubicacionUsuario) {
        await obtenerNombreLugar(ubicacionUsuario.lat, ubicacionUsuario.lng);
    }

    const direccion = direccionEntregaMapa;
    if (!direccion) {
        mostrarNotificacionCuenta("Ubicación no disponible", "Activa tu ubicación en el mapa e inténtalo de nuevo.");
        return;
    }

    const form = document.getElementById("formCheckout");
    if (!form) return;
    if (!direccionEnvioAbierta) alternarDireccionEnvioCheckout();
    form.elements.calle.value = direccion.calle || direccion.completo;
    form.elements.colonia.value = direccion.colonia || "";
    form.elements.municipio.value = direccion.municipio || "";
    form.elements.codigoPostal.value = direccion.codigoPostal || "";
    actualizarResumenDireccionEnvio();
}

function abrirAccesoCheckout() {
    document.getElementById("modalLogin")?.classList.add("activa");
}

function actualizarInformacionClienteCheckout() {
    const panel = document.getElementById("checkoutClientePago");
    const sesion = obtenerSesionActual();
    if (!panel || !sesion || sesion.rol !== "usuario") return;

    const cuenta = obtenerCuentas().find(item => String(item.id) === String(sesion.id)) || sesion;
    const datos = [
        ["Nombre", `${cuenta.nombre || sesion.nombre || ""} ${cuenta.apellidos || sesion.apellidos || ""}`.trim()],
        ["Correo", cuenta.correo || sesion.correo || ""],
        ["Celular", cuenta.telefono || sesion.telefono || ""]
    ].filter(([, valor]) => valor);

    panel.innerHTML = `
        <strong>Datos de tu cuenta</strong>
        ${datos.map(([etiqueta, valor]) => `<span><small>${etiqueta}</small>${escapeHTML(valor)}</span>`).join("")}
    `;
    panel.hidden = false;
}

function obtenerClaveDatosPagoCheckout() {
    const sesion = obtenerSesionActual() || {};
    const identificador = sesion.id || sesion.correo;
    return identificador ? `checkoutSeguroMexa:${identificador}` : null;
}

function leerDatosPagoCheckout() {
    const clave = obtenerClaveDatosPagoCheckout();
    if (!clave) return null;

    try {
        return JSON.parse(localStorage.getItem(clave) || "null");
    } catch (error) {
        console.error("No se pudieron leer los datos guardados del checkout:", error);
        mostrarNotificacionCuenta("No se pudieron leer tus datos guardados", "Puedes escribirlos nuevamente para continuar.", "❌");
        return null;
    }
}

function abrirFormularioPagoCheckout() {
    const sesion = obtenerSesionActual() || {};
    if (sesion.rol !== "usuario") {
        finalizarPedidoDesdeResumen();
        return;
    }

    const resumen = document.getElementById("checkoutResumenVista");
    const vistaPago = document.getElementById("checkoutPagoVista");
    if (!resumen || !vistaPago) return;

    const cuenta = obtenerCuentas().find(item => String(item.id) === String(sesion.id)) || sesion;
    const guardados = leerDatosPagoCheckout();
    const nombre = `${cuenta.nombre || sesion.nombre || ""} ${cuenta.apellidos || sesion.apellidos || ""}`.trim();
    vistaPago.innerHTML = `
        <button class="cerrar-modal" type="button" aria-label="Volver al resumen" onclick="volverAResumenPagoCheckout()">×</button>
        <span class="section-label">MERCADO MEXA · PAGO</span>
        <h2>Datos para tu pedido</h2>
        <p class="checkout-aviso">Confirma tus datos y continúa a Mercado Pago para completar el cobro de forma segura.</p>
        <div class="checkout-pago-campos">
            <label>Nombre completo
                <input id="checkoutNombreCliente" type="text" autocomplete="name" maxlength="150" value="${escapeHTML(guardados?.nombre || nombre)}" required>
            </label>
            <label>Correo electrónico
                <input id="checkoutCorreoCliente" type="email" autocomplete="email" maxlength="150" value="${escapeHTML(guardados?.correo || cuenta.correo || sesion.correo || "")}" required>
            </label>
            <label>Celular
                <input id="checkoutTelefonoCliente" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" value="${escapeHTML(guardados?.telefono || cuenta.telefono || sesion.telefono || "")}" required>
            </label>
            <label class="checkout-guardar-datos">
                <input id="checkoutGuardarDatos" type="checkbox" ${guardados ? "checked" : ""}>
                <span>Guardar mis datos para la próxima compra</span>
            </label>
            <p class="checkout-pago-aviso">Mercado Pago solicitará los datos de pago en su página segura. Mercado Mexa no recibe ni guarda tu número de tarjeta o CVV.</p>
            <div class="checkout-resumen-acciones">
                <button class="btn-outline grande" type="button" onclick="volverAResumenPagoCheckout()">Volver</button>
                <button id="checkoutContinuarPago" class="btn-naranja grande" type="button" onclick="confirmarDatosPagoCheckout()">Continuar con el pedido</button>
            </div>
        </div>
    `;

    resumen.hidden = true;
    vistaPago.hidden = false;
}

function volverAResumenPagoCheckout() {
    const resumen = document.getElementById("checkoutResumenVista");
    const vistaPago = document.getElementById("checkoutPagoVista");
    if (!resumen || !vistaPago) return;
    vistaPago.hidden = true;
    resumen.hidden = false;
}

/* Valida contacto y dirección; el servidor crea el checkout seguro de Mercado Pago. */
async function confirmarDatosPagoCheckout() {
    const vistaPago = document.getElementById("checkoutPagoVista");
    const campos = [...vistaPago.querySelectorAll("input[required]")];
    const campoInvalido = campos.find(campo => !campo.checkValidity());
    if (campoInvalido) {
        campoInvalido.reportValidity();
        campoInvalido.focus();
        return;
    }

    const datosContacto = {
        nombre: document.getElementById("checkoutNombreCliente").value.trim(),
        correo: document.getElementById("checkoutCorreoCliente").value.trim(),
        telefono: document.getElementById("checkoutTelefonoCliente").value.trim()
    };
    const clave = obtenerClaveDatosPagoCheckout();
    const guardarDatos = document.getElementById("checkoutGuardarDatos").checked;
    try {
        if (guardarDatos && clave) {
            localStorage.setItem(clave, JSON.stringify(datosContacto));
        } else if (clave) {
            localStorage.removeItem(clave);
        }
    } catch (error) {
        console.error("No se pudieron guardar los datos del checkout:", error);
        mostrarNotificacionCuenta("No se pudieron guardar tus datos", "Inténtalo de nuevo o desmarca la opción para continuar sin guardarlos.", "❌");
        return;
    }

    const form = document.getElementById("formCheckout");
    if (!form || !haySesionActiva() || typeof API === "undefined") {
        mostrarNotificacionCuenta("Pago no disponible", "El cobro en línea requiere iniciar sesión y tener conectado el servidor de Mercado Pago.", "❌");
        return;
    }

    const boton = document.getElementById("checkoutContinuarPago");
    if (boton) {
        boton.disabled = true;
        boton.textContent = "Conectando con Mercado Pago...";
    }

    const datosPedido = new FormData(form);
    const modalidad = String(datosPedido.get("modalidad") || "pickup");
    const tiendaId = datosPedido.get(modalidad === "envio" ? "tiendaEnvio" : "tiendaPickup");
    const tiendaPedido = obtenerTiendasParaPedido().find(tienda => String(tienda.id) === String(tiendaId));
    if (!tiendaPedido) {
        if (boton) {
            boton.disabled = false;
            boton.textContent = "Continuar con el pedido";
        }
        mostrarNotificacionCuenta("Tienda no disponible", "Selecciona una tienda para continuar.");
        return;
    }

    const direccion = modalidad === "envio"
        ? [
            form.elements.calle.value.trim(),
            form.elements.colonia.value.trim(),
            form.elements.municipio.value.trim(),
            form.elements.codigoPostal.value.trim()
        ].filter(Boolean).join(", ")
        : tiendaPedido.direccion;

    try {
        const pedido = await API.pedidoPagar({
            tienda: tiendaPedido.id,
            modalidad,
            direccion,
            referencias: modalidad === "envio" ? form.elements.referencias.value.trim() : "",
            cliente: datosContacto.nombre,
            correo: datosContacto.correo,
            telefono: datosContacto.telefono
        });
        if (!pedido.checkoutUrl) throw new Error("Mercado Pago no devolvió el enlace seguro de pago.");
        window.location.assign(pedido.checkoutUrl);
    } catch (error) {
        if (boton) {
            boton.disabled = false;
            boton.textContent = "Continuar con el pedido";
        }
        mostrarNotificacionCuenta("No se pudo iniciar el pago", error.message, "❌");
    }
}

/* Confirma en servidor el resultado al regresar desde Mercado Pago. */
async function procesarRetornoMercadoPago() {
    const parametros = new URLSearchParams(window.location.search);
    if (!parametros.has("mp_return")) return;

    const paymentId = parametros.get("payment_id") || parametros.get("collection_id");
    const folio = parametros.get("external_reference");
    window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.hash}`);

    const modal = document.getElementById("modalCheckout");
    const contenido = document.getElementById("contenidoCheckout");
    if (!modal || !contenido) return;
    modal.classList.add("activa");

    if (!paymentId || !folio || typeof API === "undefined") {
        contenido.innerHTML = `
            <div class="ticket-confirmado">
                <h2>Pago no confirmado</h2>
                <p>No se recibió la confirmación del pago. Revisa el estado en tu cuenta o inténtalo de nuevo.</p>
                <button class="btn-naranja grande" type="button" onclick="document.getElementById('modalCheckout').classList.remove('activa')">Cerrar</button>
            </div>
        `;
        return;
    }

    contenido.innerHTML = `
        <div class="ticket-confirmado">
            <span class="section-label">MERCADO PAGO</span>
            <h2>Verificando tu pago...</h2>
            <p>Espera un momento mientras confirmamos la operación.</p>
        </div>
    `;

    try {
        const pedido = await API.pedidoConfirmarPago(folio, paymentId);
        ticketMercadoPagoActual = pedido;
        contenido.innerHTML = `
            <button class="cerrar-modal" type="button" aria-label="Cerrar" onclick="document.getElementById('modalCheckout').classList.remove('activa')">×</button>
            <div class="ticket-confirmado">
                <span class="section-label">PAGO CONFIRMADO</span>
                <h2>¡Gracias por tu compra!</h2>
                <p>Pedido <strong>${escapeHTML(pedido.folio)}</strong> · Total <strong>${formatearPrecio(Number(pedido.total))}</strong></p>
                <p>${escapeHTML(pedido.modalidad === "pickup" ? "Recoger en tienda" : "Envío a domicilio")} · ${escapeHTML(pedido.tienda || "")}</p>
                <div class="ticket-codigo">
                    <span>CÓDIGO ÚNICO PARA ENTREGAR AL REPARTIDOR</span>
                    <strong>${escapeHTML(pedido.codigoEntrega)}</strong>
                </div>
                <p>Muéstrale este código al repartidor para confirmar la entrega.</p>
                <div class="checkout-resumen-acciones">
                    <button class="btn-outline grande" type="button" onclick="descargarTicketMercadoPago()">Descargar ticket PDF</button>
                    <button class="btn-naranja grande" type="button" onclick="compartirTicketWhatsApp()">Compartir por WhatsApp</button>
                </div>
                <small>WhatsApp se abrirá con el resumen del pedido. Adjunta el PDF que acabas de descargar para enviarlo.</small>
            </div>
        `;
        sincronizarCarritoDesdeAPI();
        sincronizarPedidosDesdeAPI();
    } catch (error) {
        contenido.innerHTML = `
            <div class="ticket-confirmado">
                <span class="section-label">MERCADO PAGO</span>
                <h2>No pudimos confirmar el pago</h2>
                <p>${escapeHTML(error.message)}</p>
                <p>No compartas un código de entrega hasta que el pago aparezca como confirmado en tu cuenta.</p>
                <button class="btn-naranja grande" type="button" onclick="document.getElementById('modalCheckout').classList.remove('activa')">Cerrar</button>
            </div>
        `;
    }
}

function textoPlanoTicket(valor) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E]/g, "")
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");
}

function crearPdfTicketMercadoPago(pedido) {
    const filas = [
        "MERCADO MEXA - COMPROBANTE DE COMPRA",
        `Pedido: ${pedido.folio}`,
        `Fecha: ${pedido.fecha || new Date().toLocaleString("es-MX")}`,
        `Cliente: ${pedido.cliente || ""}`,
        `Telefono: ${pedido.telefono || ""}`,
        `Entrega: ${pedido.modalidad === "pickup" ? "Recoger en tienda" : "Envio a domicilio"}`,
        `Tienda: ${pedido.tienda || ""}`,
        `Direccion: ${pedido.direccion || ""}`,
        "Estado de pago: PAGADO",
        "",
        "PRODUCTOS"
    ];
    (pedido.items || []).forEach(item => {
        filas.push(`${item.cantidad} x ${item.nombre} - $${Number(item.subtotal ?? item.precio * item.cantidad).toFixed(2)}`);
    });
    filas.push("", `TOTAL PAGADO: $${Number(pedido.total).toFixed(2)}`, "", "CODIGO UNICO DE ENTREGA", String(pedido.codigoEntrega || ""), "", "Muestra este codigo al repartidor para confirmar que recibiste tu pedido.");

    const paginas = [];
    const filasAjustadas = filas.flatMap(fila => {
        if (!fila) return [""];
        const salida = [];
        for (let inicio = 0; inicio < fila.length; inicio += 78) {
            salida.push(fila.slice(inicio, inicio + 78));
        }
        return salida;
    });
    for (let inicio = 0; inicio < filasAjustadas.length; inicio += 34) {
        paginas.push(filasAjustadas.slice(inicio, inicio + 34));
    }

    const objetos = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        `<< /Type /Pages /Kids [${paginas.map((_, indice) => `${4 + indice * 2} 0 R`).join(" ")}] /Count ${paginas.length} >>`,
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
    ];
    paginas.forEach((lineas, indice) => {
        const contenidoId = 5 + indice * 2;
        const comandos = ["BT", "/F1 11 Tf", "14 TL", "45 790 Td"];
        lineas.forEach((linea, lineaIndice) => {
            if (lineaIndice) comandos.push("T*");
            comandos.push(`(${textoPlanoTicket(linea).slice(0, 110)}) Tj`);
        });
        comandos.push("ET");
        const flujo = comandos.join("\n");
        objetos.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contenidoId} 0 R >>`);
        objetos.push(`<< /Length ${flujo.length} >>\nstream\n${flujo}\nendstream`);
    });

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objetos.forEach((objeto, indice) => {
        offsets.push(pdf.length);
        pdf += `${indice + 1} 0 obj\n${objeto}\nendobj\n`;
    });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => {
        pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return new Blob([pdf], { type: "application/pdf" });
}

function descargarTicketMercadoPago() {
    if (!ticketMercadoPagoActual) return;
    const archivo = crearPdfTicketMercadoPago(ticketMercadoPagoActual);
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = `ticket-${ticketMercadoPagoActual.folio}.pdf`;
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
}

async function compartirTicketWhatsApp() {
    if (!ticketMercadoPagoActual) return;
    const pedido = ticketMercadoPagoActual;
    const mensaje = [
        `Ticket Mercado Mexa - pedido ${pedido.folio}`,
        `Total pagado: ${formatearPrecio(Number(pedido.total))}`,
        `Codigo de entrega: ${pedido.codigoEntrega}`,
        "Adjunto el ticket PDF de mi pedido."
    ].join("\n");
    const archivoPdf = crearPdfTicketMercadoPago(pedido);
    const archivo = typeof File === "function"
        ? new File([archivoPdf], `ticket-${pedido.folio}.pdf`, { type: "application/pdf" })
        : null;

    if (archivo && navigator.canShare?.({ files: [archivo] }) && navigator.share) {
        try {
            await navigator.share({
                files: [archivo],
                title: `Ticket ${pedido.folio}`,
                text: mensaje
            });
        } catch (error) {
            if (error.name !== "AbortError") {
                mostrarNotificacionCuenta("No se pudo compartir el ticket", error.message, "❌");
            }
        }
        return;
    }

    descargarTicketMercadoPago();
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, "_blank", "noopener");
}

async function confirmarPedidoLista(evento) {
    evento.preventDefault();

    const form = evento.currentTarget;
    const datos = new FormData(form);
    const sesion = obtenerSesionActual() || {};
    if (form.dataset.pedidoEnRevision === "true" && sesion.rol !== "usuario") {
        mostrarNotificacionCuenta("Inicia sesión", "Inicia sesión o crea una cuenta para confirmar tu pedido.");
        form.dataset.esperandoLogin = "true";
        abrirAccesoCheckout();
        return;
    }

    const telefono = String(sesion.telefono || "").trim();
    const modalidad = String(datos.get("modalidad") || "pickup");
    const tiendaId = datos.get(modalidad === "envio" ? "tiendaEnvio" : "tiendaPickup");
    const tiendaPedido = obtenerTiendasParaPedido().find(tienda => String(tienda.id) === String(tiendaId));
    const calle = modalidad === "envio" ? String(form.elements.calle.value || "").trim() : "";
    const colonia = modalidad === "envio" ? String(form.elements.colonia.value || "").trim() : "";
    const municipio = modalidad === "envio" ? String(form.elements.municipio.value || "").trim() : "";
    const codigoPostal = modalidad === "envio" ? String(form.elements.codigoPostal.value || "").trim() : "";
    const referencias = modalidad === "envio" ? String(form.elements.referencias.value || "").trim() : "";

    if (!tiendaPedido) {
        mostrarNotificacionCuenta("Tienda no disponible", "Selecciona una tienda para continuar.");
        return;
    }

    if (modalidad === "envio" && (!calle || !colonia || !municipio)) {
        if (!direccionEnvioAbierta) alternarDireccionEnvioCheckout();
        mostrarNotificacionCuenta("Completa tu dirección", "Agrega calle, colonia y municipio para recibir el pedido.");
        return;
    }

    const direccion = modalidad === "envio"
        ? [calle, colonia, municipio, codigoPostal].filter(Boolean).join(", ")
        : tiendaPedido.direccion;
    const total = carrito.reduce((suma, item) => suma + item.precio * (item.cantidad || 1), 0);
    if (form.dataset.pedidoEnRevision !== "true") {
        const cantidadArticulos = carrito.reduce((suma, item) => suma + (item.cantidad || 1), 0);
        const tipoEntrega = modalidad === "pickup" ? "Pickup en tienda" : "Envío a domicilio";
        const resumenProductos = carrito.map(item => `
            <li>
                <span class="checkout-resumen-producto">
                    <span class="checkout-resumen-producto-imagen" aria-hidden="true">${escapeHTML(item.icono || "🛒")}</span>
                    <span class="checkout-resumen-producto-datos">
                        <strong>${escapeHTML(item.nombre)}</strong>
                        <small>Cantidad: ${item.cantidad || 1}</small>
                    </span>
                </span>
                <strong>${formatearPrecio(item.precio * (item.cantidad || 1))}</strong>
            </li>
        `).join("");
        const resumen = document.getElementById("checkoutResumenVista");
        resumen.innerHTML = `
            <span class="section-label">MERCADO MEXA · REVISIÓN</span>
            <h2>Resumen del pedido</h2>
            <p class="checkout-resumen-cantidad">${cantidadArticulos} ${cantidadArticulos === 1 ? "artículo" : "artículos"}</p>
            <ul class="checkout-resumen-productos">${resumenProductos}</ul>
            <div class="checkout-total">
                <span>Precio aproximado</span>
                <strong>${formatearPrecio(total)}</strong>
            </div>
            <div class="checkout-resumen-entrega">
                <strong>${tipoEntrega}</strong>
                <span>${escapeHTML(tiendaPedido.nombre)} · ${escapeHTML(direccion)}</span>
            </div>
            <div id="checkoutClientePago" class="checkout-cliente-pago" hidden></div>
            <div class="checkout-resumen-pagos">
                <strong>Pago seguro en línea</strong>
                <span>Al continuar, completarás el cobro en Mercado Pago.</span>
            </div>
            <div class="checkout-resumen-acciones">
                <button class="btn-outline grande" type="button" onclick="volverAEditarPedido()">Volver</button>
                <button class="btn-naranja grande" type="button" onclick="abrirFormularioPagoCheckout()">Pagar ahora (${cantidadArticulos})</button>
            </div>
            <small class="checkout-resumen-nota">El pedido se confirma cuando Mercado Pago autorice el pago. El código de entrega se mostrará después de la confirmación.</small>
        `;
        resumen.insertAdjacentHTML("afterend", '<section id="checkoutPagoVista" class="checkout-pago-vista" hidden></section>');
        document.getElementById("checkoutFormularioVista").hidden = true;
        resumen.hidden = false;
        actualizarInformacionClienteCheckout();
        return;
    }

    const fecha = new Date();
    const metodoPagoSeleccionado = String(datos.get("pago") || "Efectivo al recibir");
    const tipoTarjetaSeleccionado = String(datos.get("tipoTarjeta") || "Débito");
    const metodoPagoFinal = metodoPagoSeleccionado === "Tarjeta al recibir"
        ? `Tarjeta de ${tipoTarjetaSeleccionado} al recibir`
        : metodoPagoSeleccionado;

    /* =====================================================
       CON BASE DE DATOS: el pedido se confirma en MySQL.
       El servidor lee los productos y el total del carrito,
       asi que aqui NO se mandan precios ni cantidades.
       ===================================================== */
    if (haySesionActiva() && typeof API !== "undefined") {
        try {
            const pedidoGuardado = await API.pedidoCrear({
                tienda: tiendaPedido.id,
                modalidad,
                direccion,
                referencias,
                metodoPago: metodoPagoFinal
            });

            /* La respuesta trae el folio y el codigo que dio el servidor */
            const folio = pedidoGuardado.folio;
            const codigoEntrega = pedidoGuardado.codigoEntrega;
            const totalReal = Number(pedidoGuardado.total);

            /* El servidor ya vacio el carrito en la BD */
            carrito = [];
            guardar();
            sincronizarPedidosDesdeAPI();

            const tipoEntrega = modalidad === "pickup" ? "Pickup en tienda" : "Envío a domicilio";
            const contenido = document.getElementById("contenidoCheckout");
            contenido.innerHTML = `
                <button class="cerrar-modal" type="button" aria-label="Cerrar" onclick="document.getElementById('modalCheckout').classList.remove('activa')">×</button>
                <div class="ticket-confirmado">
                    <span class="section-label">PEDIDO REGISTRADO</span>
                    <h2>Pedido confirmado</h2>
                    <p>Pedido <strong>${escapeHTML(folio)}</strong> · Total <strong>${formatearPrecio(totalReal)}</strong></p>
                    <p><strong>${tipoEntrega}</strong> · ${escapeHTML(pedidoGuardado.tienda || tiendaPedido.nombre)}</p>
                    <p>Forma de pago: <strong>${escapeHTML(metodoPagoFinal)}</strong></p>
                    <div class="ticket-codigo">
                        <span>CÓDIGO PARA EL REPARTIDOR</span>
                        <strong>${escapeHTML(codigoEntrega)}</strong>
                    </div>
                    <p>Comparte este código con el repartidor al recibir tu pedido.</p>
                    <button class="btn-naranja grande" type="button" onclick="document.getElementById('modalCheckout').classList.remove('activa')">Cerrar</button>
                    <small>Tu pedido quedó guardado en el sistema y la tienda ya lo está preparando.</small>
                </div>
            `;

            mostrarNotificacionCuenta("Pedido confirmado", `Folio ${folio}. Guarda tu código de entrega: ${codigoEntrega}`);
            return;

        } catch (error) {
            mostrarNotificacionCuenta("No se pudo confirmar el pedido", error.message, "❌");
            return;
        }
    }

    /* =====================================================
        SIN SERVIDOR: se guarda en el navegador como antes
    ===================================================== */
    const codigoEntrega = String(Math.floor(100000 + Math.random() * 900000));
    const productos = carrito.map(item => `${item.nombre} (${item.cantidad || 1})`).join(", ");
    const pedido = {
        id: `MX-${fecha.getTime().toString(36).toUpperCase()}`,
        usuarioId: sesion.id,
        cliente: `${sesion.nombre} ${sesion.apellidos || ""}`.trim(),
        telefono,
        direccion,
        referencias,
        modalidad,
        tienda: tiendaPedido.nombre,
        tiendaDireccion: tiendaPedido.direccion,
        total,
        productos,
        items: carrito.map(item => ({ nombre: item.nombre, cantidad: item.cantidad || 1, precio: item.precio })),
        metodoPago: metodoPagoFinal,
        codigoEntrega,
        estado: "pendiente",
        fecha: fecha.toLocaleString("es-MX"),
        chofer: "Por asignar"
    };

    const pedidos = obtenerPedidosMexa();
    pedidos.unshift(pedido);
    guardarPedidosMexa(pedidos);

    const cuentas = obtenerCuentas();
    const cuenta = cuentas.find(item => item.id === sesion.id);
    if (cuenta) {
        if (modalidad === "envio") cuenta.direccion = calle;
        guardarCuentas(cuentas);
        guardarSesion(cuenta);
    }

    const tipoEntrega = modalidad === "pickup" ? "Pickup en tienda" : "Envío a domicilio";

    /* El pedido se acaba de confirmar: el carrito se vacia
       aqui y tambien en MySQL. */
    carrito = [];
    guardar();
    vaciarCarritoEnAPI();

    const contenido = document.getElementById("contenidoCheckout");
    contenido.innerHTML = `
        <button class="cerrar-modal" type="button" aria-label="Cerrar" onclick="document.getElementById('modalCheckout').classList.remove('activa')">×</button>
        <div class="ticket-confirmado">
            <span class="section-label">PEDIDO REGISTRADO</span>
            <h2>Pedido confirmado</h2>
            <p>Pedido <strong>${escapeHTML(pedido.id)}</strong> · Total <strong>${formatearPrecio(total)}</strong></p>
            <p><strong>${tipoEntrega}</strong> · ${escapeHTML(tiendaPedido.nombre)}</p>
            <p>Forma de pago: <strong>${escapeHTML(pedido.metodoPago)}</strong></p>
            <div class="ticket-codigo">
                <span>CÓDIGO PARA EL REPARTIDOR</span>
                <strong>${escapeHTML(codigoEntrega)}</strong>
            </div>
            <p>Comparte este código con el repartidor al recibir tu pedido.</p>
            <button class="btn-naranja grande" type="button" onclick="document.getElementById('modalCheckout').classList.remove('activa')">Cerrar</button>
            <small>El pedido se guardó en este dispositivo. El pago se coordina con la tienda; no se realizó ningún cargo en línea.</small>
        </div>
    `;

    mostrarNotificacionCuenta("Pedido confirmado", `Guarda tu código de entrega: ${codigoEntrega}`);
}

function finalizarPedidoDesdeResumen() {
    const form = document.getElementById("formCheckout");
    if (!form) return;
    const sesion = obtenerSesionActual();
    if (!sesion || sesion.rol !== "usuario") {
        form.dataset.esperandoLogin = "true";
        mostrarNotificacionCuenta("Inicia sesión para continuar", "Necesitas iniciar sesión o crear una cuenta antes de realizar el pago.");
        abrirAccesoCheckout();
        return;
    }
    form.dataset.pedidoEnRevision = "true";
    form.requestSubmit();
}

function actualizarOpcionesTarjetaCheckout() {
    const tipoTarjeta = document.getElementById("checkoutTiposTarjeta");
    const pagoSeleccionado = document.querySelector('input[name="pago"]:checked')?.value;
    if (tipoTarjeta) tipoTarjeta.hidden = pagoSeleccionado !== "Tarjeta al recibir";
}

function volverAEditarPedido() {
    const form = document.getElementById("formCheckout");
    if (!form) return;
    delete form.dataset.pedidoEnRevision;
    document.getElementById("checkoutPagoVista")?.remove();
    document.getElementById("checkoutResumenVista").hidden = true;
    document.getElementById("checkoutFormularioVista").hidden = false;
}


function abrirSelectorTiendasPedido(modalidad = "pickup") {
    modalidadSelectorTienda = modalidad;
    const select = document.getElementById(modalidad === "envio" ? "checkoutTiendaEnvio" : "checkoutTiendaPickup");
    if (!select) return;

    tiendaPickupTemporalId = select.value;
    filtroTiendasPedido = "todas";

    document.getElementById("selectorTiendasPedido")?.remove();
    const panel = document.createElement("div");
    panel.id = "selectorTiendasPedido";
    panel.className = "selector-tiendas-backdrop";
    panel.setAttribute("role", "presentation");
    panel.innerHTML = `
        <aside class="selector-tiendas-panel" role="dialog" aria-modal="true" aria-labelledby="selectorTiendasTitulo">
            <header class="selector-tiendas-header">
                <h2 id="selectorTiendasTitulo">Elegir tienda</h2>
                <button type="button" class="selector-tiendas-cerrar" aria-label="Cerrar" onclick="cerrarSelectorTiendasPedido()">×</button>
            </header>
            <div class="selector-tiendas-controles">
                <label class="selector-tiendas-busqueda" aria-label="Buscar tienda">
                    <span aria-hidden="true">⌕</span>
                    <input type="search" id="buscarTiendaPedido" placeholder="Buscar tienda, calle o colonia" autocomplete="off">
                </label>
                <button type="button" class="selector-tiendas-ubicacion" onclick="usarUbicacionParaSelectorTiendas()">⌖ <span>Usar mi ubicación actual</span></button>
                <div class="selector-tiendas-filtros" role="group" aria-label="Filtrar tiendas">
                    <button type="button" class="activo" data-filtro-tiendas="todas">Todas</button>
                    <button type="button" data-filtro-tiendas="cercanas">Más cercanas</button>
                </div>
            </div>
            <div class="selector-tiendas-lista" id="selectorTiendasPedidoLista" role="radiogroup" aria-label="Sucursales disponibles"></div>
            <footer class="selector-tiendas-footer">
                <button type="button" class="btn-naranja grande" onclick="confirmarTiendaPickup()">Elegir tienda</button>
            </footer>
        </aside>
    `;
    panel.addEventListener("click", evento => {
        if (evento.target === panel) cerrarSelectorTiendasPedido();
    });
    document.body.appendChild(panel);
    panel.querySelector("#buscarTiendaPedido").addEventListener("input", renderTiendasSelectorPedido);
    panel.querySelectorAll("[data-filtro-tiendas]").forEach(boton => {
        boton.addEventListener("click", () => {
            filtroTiendasPedido = boton.dataset.filtroTiendas;
            panel.querySelectorAll("[data-filtro-tiendas]").forEach(tab => tab.classList.toggle("activo", tab === boton));
            renderTiendasSelectorPedido();
        });
    });
    renderTiendasSelectorPedido();
    panel.querySelector("#buscarTiendaPedido").focus();
}

function renderTiendasSelectorPedido() {
    const lista = document.getElementById("selectorTiendasPedidoLista");
    if (!lista) return;

    const busqueda = document.getElementById("buscarTiendaPedido")?.value.trim().toLowerCase() || "";
    const sucursales = obtenerTiendasParaPedido().filter(tienda => {
        const texto = `${tienda.nombre} ${tienda.direccion} ${tienda.ciudad || ""}`.toLowerCase();
        const coincideBusqueda = texto.includes(busqueda);
        const coincideFiltro = filtroTiendasPedido !== "cercanas" || (Number.isFinite(tienda.distancia) ? tienda.distancia <= 25 : true);
        return coincideBusqueda && coincideFiltro;
    });

    lista.innerHTML = sucursales.length ? sucursales.map(tienda => `
        <button type="button" class="selector-tienda-opcion ${String(tienda.id) === String(tiendaPickupTemporalId) ? "seleccionada" : ""}" role="radio" aria-checked="${String(tienda.id) === String(tiendaPickupTemporalId)}" onclick="seleccionarTiendaPickupTemporal('${escapeJS(String(tienda.id))}')">
            <span class="selector-tienda-radio" aria-hidden="true"></span>
            <span class="selector-tienda-datos">
                <span class="selector-tienda-titulo">
                    <small>${escapeHTML(tienda.categoria || "TIENDA NETO")}</small>
                    <strong>${escapeHTML(tienda.nombre)}</strong>
                </span>
                <span class="selector-tienda-direccion">${escapeHTML(tienda.direccion)}</span>
                <span class="selector-tienda-distancia">${Number.isFinite(tienda.distancia) ? `${tienda.distancia.toFixed(1)} km · ` : ""}✓ Pickup en tienda</span>
            </span>
        </button>
    `).join("") : '<p class="selector-tiendas-vacio">No encontramos tiendas con esa búsqueda.</p>';
}

function seleccionarTiendaPickupTemporal(tiendaId) {
    tiendaPickupTemporalId = tiendaId;
    renderTiendasSelectorPedido();
}

function confirmarTiendaPickup() {
    const tienda = obtenerTiendasParaPedido().find(item => String(item.id) === String(tiendaPickupTemporalId));
    const esEnvio = modalidadSelectorTienda === "envio";
    const select = document.getElementById(esEnvio ? "checkoutTiendaEnvio" : "checkoutTiendaPickup");
    if (!tienda || !select) return;

    select.value = String(tienda.id);
    if (esEnvio) {
        tiendaEnvioSeleccionadaId = String(tienda.id);
    } else {
        tiendaPickupSeleccionadaId = String(tienda.id);
        document.getElementById("checkoutTiendaTipo").textContent = tienda.categoria || "TIENDA NETO";
        document.getElementById("checkoutTiendaNombre").textContent = tienda.nombre;
        document.getElementById("checkoutTiendaDireccion").textContent = tienda.direccion;
        if (!document.getElementById("checkoutHorarioPickup")?.hidden) actualizarDetalleHorarioPickup();
    }
    cerrarSelectorTiendasPedido();
}

function cerrarSelectorTiendasPedido() {
    document.getElementById("selectorTiendasPedido")?.remove();
}

function usarUbicacionParaSelectorTiendas() {
    const sucursales = obtenerTiendasParaPedido();
    if (!ubicacionUsuario) {
        obtenerUbicacion();
        mostrarNotificacionCuenta("Buscando tu ubicación", "Cuando aparezcan las sucursales cercanas, vuelve a elegir la más próxima.");
        return;
    }

    const tiendaCercana = sucursales.reduce((cercana, tienda) => {
        const distancia = calcularDistancia(ubicacionUsuario.lat, ubicacionUsuario.lng, tienda.lat, tienda.lng);
        return !cercana || distancia < cercana.distanciaCalculada ? { ...tienda, distanciaCalculada: distancia } : cercana;
    }, null);
    if (tiendaCercana) {
        tiendaPickupTemporalId = tiendaCercana.id;
        filtroTiendasPedido = "todas";
        renderTiendasSelectorPedido();
    }
}


