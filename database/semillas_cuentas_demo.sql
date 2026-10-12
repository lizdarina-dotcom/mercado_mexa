-- Cuentas locales de demostración requeridas por los botones de acceso rápido.
-- Las credenciales de prueba también están documentadas en el código del frontend.
USE mercado_mexa;

INSERT IGNORE INTO usuarios
    (nombre, apellidos, correo, telefono, password_hash, rol, estado_chofer, entregas, activo, cuenta_demo)
VALUES
    ('Alexandra', 'Gómez', 'usuario@mexamexa.com', '9511234567', '$2y$10$6eSevbBjHVggblfhKgaUAeg8IEnDuR.hvNI3cAf6.4nlU4fPm82D2', 'usuario', 'disponible', 0, 1, 1),
    ('Carlos', 'Ramírez', 'chofer@mexamexa.com', '9512345678', '$2y$10$ZiTm6tJbK1tSMpkbG2FIyu6BohfzG2oJGRtCzqYSjY4fsFrQSH88O', 'chofer', 'disponible', 14, 1, 1),
    ('Administrador', 'Mercado Mexa', 'admin@mexamexa.com', '9513456789', '$2y$10$GvsOR.q6EIKolZK2XQwwvOPmfknD2leebU9Fyl7SVnpSVPm59pmf6', 'admin', 'disponible', 0, 1, 1);
