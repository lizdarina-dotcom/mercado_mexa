/* Modelo de búsqueda: normaliza términos y localiza productos. */

function normalizarBusqueda(texto) {
    return String(texto || "")
        .toLocaleLowerCase("es-MX")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

const equivalenciasBusqueda = {
    leche: ["leche", "lacteo", "lacteos"],
    lacteo: ["leche", "lacteo", "lacteos", "queso", "yogurt"],
    lacteos: ["leche", "lacteo", "lacteos", "queso", "yogurt"],
    refresco: ["refresco", "refrescos", "soda", "bebida"],
    refrescos: ["refresco", "refrescos", "soda", "bebida"],
    limpieza: ["limpieza", "jabon", "cloro", "detergente"],
    botana: ["botana", "papas", "galletas"],
    despensa: ["abarrotes", "despensa"]
};

const productosLimpiezaCocina = /detergente|cloro|limpiador multiusos|jabon para trastes|esponjas|limpiavidrios|desinfectante/;

function terminosBusqueda(texto) {
    return normalizarBusqueda(texto)
        .split(" ")
        .filter(Boolean)
        .flatMap(termino => [termino, ...(equivalenciasBusqueda[termino] || [])]);
}

function obtenerResultadosProductos(texto) {
    const terminos = terminosBusqueda(texto);
    if (!terminos.length) return [];

    const consulta = normalizarBusqueda(texto);
    const limpiezaCocina = consulta.includes("limpieza") &&
        (consulta.includes("cocina") || consulta.includes("traste") || consulta.includes("plato"));

    return getCategoriasBase().flatMap(categoria =>
        (categoria.productos || [])
            .filter(producto => {
                const contenido = normalizarBusqueda(`${producto.nombre} ${categoria.nombre}`);
                const coincide = terminos.some(termino => contenido.includes(termino));
                return coincide && (!limpiezaCocina || productosLimpiezaCocina.test(contenido));
            })
            .map(producto => ({ producto, categoria }))
    );
}

function obtenerMejorPrecio(producto) {
    const comparativa = generarComparativaTiendas(producto.precio, producto.nombre);
    return comparativa.reduce((mejor, actual) =>
        actual.precio < mejor.precio ? actual : mejor
    );
}
