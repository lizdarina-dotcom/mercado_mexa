<?php
/* Funciones comunes usadas por los endpoints PHP de la aplicación. */

function obtenerCatalogo(PDO $bd) {
    $sql = "SELECT
                p.id, p.nombre, p.presentacion, p.descripcion, p.precio,
                p.precio_regular, p.en_oferta, p.etiqueta_oferta, p.caducidad,
                p.lote, p.icono, p.resenas,
                c.nombre AS categoria, c.icono AS categoria_icono
            FROM productos p
            INNER JOIN categorias c ON c.id = p.categoria_id
            WHERE p.activo = 1 AND c.activo = 1
            ORDER BY c.nombre, p.nombre";

    $productos = $bd->query($sql)->fetchAll();
    $catalogo = [];

    foreach ($productos as $producto) {
        $categoria = $producto['categoria'];
        if (!isset($catalogo[$categoria])) {
            $catalogo[$categoria] = [
                'nombre' => $categoria,
                'icono' => $producto['categoria_icono'],
                'productos' => [],
            ];
        }
        $catalogo[$categoria]['productos'][] = $producto;
    }

    return array_values($catalogo);
}

function obtenerTiendas(PDO $bd) {
    $sql = 'SELECT slug, nombre, ciudad, direccion, lat, lng
            FROM tiendas WHERE activo = 1 ORDER BY nombre';
    $tiendas = [];

    foreach ($bd->query($sql)->fetchAll() as $fila) {
        $tiendas[] = [
            'id' => $fila['slug'],
            'nombre' => $fila['nombre'],
            'ciudad' => $fila['ciudad'],
            'direccion' => $fila['direccion'],
            'lat' => (float) $fila['lat'],
            'lng' => (float) $fila['lng'],
        ];
    }

    return $tiendas;
}

function refrescarSesion(PDO $bd) {
    if (empty($_SESSION['usuario']['id'])) return;

    $q = $bd->prepare(
        'SELECT rol, estado_chofer, entregas, activo
         FROM usuarios WHERE id = ? LIMIT 1'
    );
    $q->execute([(int) $_SESSION['usuario']['id']]);
    $fila = $q->fetch();

    if (!$fila || !(int) $fila['activo']) {
        $_SESSION = [];
        return;
    }

    $_SESSION['usuario']['rol'] = $fila['rol'];
    $_SESSION['usuario']['estado_chofer'] = $fila['estado_chofer'];
    $_SESSION['usuario']['entregas'] = (int) $fila['entregas'];
}

function usuarioPublico(array $fila) {
    return [
        'id' => (int) $fila['id'],
        'nombre' => $fila['nombre'],
        'apellidos' => $fila['apellidos'],
        'correo' => $fila['correo'],
        'telefono' => $fila['telefono'],
        'direccion' => $fila['direccion'],
        'rol' => $fila['rol'],
        'estadoChofer' => $fila['estado_chofer'],
        'entregas' => (int) $fila['entregas'],
    ];
}
