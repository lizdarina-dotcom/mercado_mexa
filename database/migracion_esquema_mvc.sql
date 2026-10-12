-- Migracion de la base anterior de Mercado Mexa al esquema esperado por la API MVC.
-- Se ejecuta una sola vez y conserva las filas existentes.
-- Se hizo respaldo antes de aplicar: C:/xampp/tmp/mercado_mexa-before-mvc-migration-20261009.sql

USE mercado_mexa;

-- Categorias y tiendas: el esquema anterior nombraba estas columnas en femenino.
ALTER TABLE categorias ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1;
UPDATE categorias SET activo = COALESCE(activa, 1);

ALTER TABLE tiendas
    ADD COLUMN slug VARCHAR(60) NULL,
    ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1;
UPDATE tiendas SET slug = id, activo = COALESCE(activa, 1);
ALTER TABLE tiendas MODIFY slug VARCHAR(60) NOT NULL;
ALTER TABLE tiendas ADD UNIQUE KEY uq_tiendas_slug (slug);

-- Usuarios: copia correo y hash desde las columnas antiguas y conserva las originales.
ALTER TABLE usuarios
    ADD COLUMN apellidos VARCHAR(100) NOT NULL DEFAULT '' AFTER nombre,
    ADD COLUMN correo VARCHAR(150) NULL,
    ADD COLUMN password_hash VARCHAR(255) NULL,
    ADD COLUMN rol ENUM('usuario','chofer','admin') NOT NULL DEFAULT 'usuario',
    ADD COLUMN estado_chofer ENUM('disponible','en_ruta') NOT NULL DEFAULT 'disponible',
    ADD COLUMN entregas INT UNSIGNED NOT NULL DEFAULT 0,
    ADD COLUMN cuenta_demo TINYINT(1) NOT NULL DEFAULT 0;
UPDATE usuarios SET correo = email, password_hash = password;
ALTER TABLE usuarios
    MODIFY email VARCHAR(150) NULL,
    MODIFY password VARCHAR(255) NULL,
    MODIFY correo VARCHAR(150) NOT NULL,
    MODIFY password_hash VARCHAR(255) NOT NULL,
    ADD UNIQUE KEY uq_usuarios_correo (correo);

-- Columnas que necesita el catálogo nuevo. Los productos anteriores quedan sin oferta.
ALTER TABLE productos
    ADD COLUMN descripcion VARCHAR(255) NULL,
    ADD COLUMN precio_regular DECIMAL(10,2) NULL,
    ADD COLUMN en_oferta TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN etiqueta_oferta VARCHAR(40) NULL;
UPDATE productos SET descripcion = presentacion, precio_regular = precio, en_oferta = 0;

-- Completa datos del carrito y favoritos sin eliminar lo que ya estuviera guardado.
ALTER TABLE carrito
    ADD COLUMN precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN comprado TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN agregado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE carrito car
INNER JOIN productos pr ON pr.id = car.producto_id
SET car.precio_unitario = pr.precio, car.agregado_en = car.fecha_agregado;

ALTER TABLE favoritos ADD COLUMN creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE favoritos SET creado_en = fecha_agregado;

-- Extiende pedidos para el checkout actual y mantiene los campos antiguos.
ALTER TABLE pedidos
    ADD COLUMN folio VARCHAR(20) NULL,
    ADD COLUMN chofer_id INT NULL,
    ADD COLUMN modalidad ENUM('pickup','envio') NOT NULL DEFAULT 'envio',
    ADD COLUMN cliente_nombre VARCHAR(150) NOT NULL DEFAULT '',
    ADD COLUMN cliente_telefono VARCHAR(20) NOT NULL DEFAULT '',
    ADD COLUMN direccion VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN referencias VARCHAR(255) NULL,
    ADD COLUMN estado_pago VARCHAR(20) NOT NULL DEFAULT 'no_aplica',
    ADD COLUMN mp_preferencia_id VARCHAR(100) NULL,
    ADD COLUMN mp_pago_id VARCHAR(100) NULL,
    ADD COLUMN mp_carrito_limpiado TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN codigo_entrega CHAR(6) NULL,
    ADD COLUMN pedido_en TIMESTAMP NULL,
    ADD COLUMN entregado_en TIMESTAMP NULL;

UPDATE pedidos p
LEFT JOIN usuarios u ON u.id = p.usuario_id
LEFT JOIN tiendas t ON t.id = p.tienda_id
SET p.folio = CONCAT('LEG-', LPAD(p.id, 6, '0')),
    p.codigo_entrega = LPAD(MOD(p.id, 1000000), 6, '0'),
    p.cliente_nombre = COALESCE(NULLIF(u.nombre, ''), 'Cliente'),
    p.cliente_telefono = COALESCE(u.telefono, ''),
    p.direccion = COALESCE(NULLIF(t.direccion, ''), 'Sin dirección registrada'),
    p.pedido_en = p.fecha_pedido;

ALTER TABLE pedidos
    MODIFY folio VARCHAR(20) NOT NULL,
    MODIFY codigo_entrega CHAR(6) NOT NULL,
    MODIFY pedido_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY metodo_pago VARCHAR(60) NOT NULL DEFAULT 'Efectivo al recibir',
    MODIFY estado ENUM('pendiente','en_ruta','entregado','procesando','completado','cancelado') NOT NULL DEFAULT 'pendiente',
    ADD UNIQUE KEY uq_pedidos_folio (folio),
    ADD UNIQUE KEY uq_pedidos_codigo (codigo_entrega);

-- El checkout nuevo usa pedido_items; copia el detalle legado si existiera.
CREATE TABLE IF NOT EXISTS pedido_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NULL,
    producto_nombre VARCHAR(150) NOT NULL,
    producto_icono VARCHAR(16) NOT NULL DEFAULT '',
    cantidad SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    INDEX idx_items_pedido (pedido_id),
    INDEX idx_items_producto (producto_id),
    CONSTRAINT fk_mvc_items_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_mvc_items_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO pedido_items
    (id, pedido_id, producto_id, producto_nombre, producto_icono, cantidad, precio_unitario, subtotal)
SELECT d.id, d.pedido_id, d.producto_id,
       COALESCE(pr.nombre, 'Producto eliminado'), COALESCE(pr.icono, ''),
       d.cantidad, d.precio_unitario, d.subtotal
FROM pedido_detalles d
LEFT JOIN productos pr ON pr.id = d.producto_id;

CREATE TABLE IF NOT EXISTS entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    chofer_id INT NOT NULL,
    codigo_entrega CHAR(6) NOT NULL,
    entregado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tiempo_entrega_min INT UNSIGNED NULL,
    UNIQUE KEY uq_entrega_pedido (pedido_id),
    INDEX idx_entregas_chofer (chofer_id, entregado_en),
    CONSTRAINT fk_mvc_entrega_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_mvc_entrega_chofer FOREIGN KEY (chofer_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
