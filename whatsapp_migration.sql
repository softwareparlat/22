
-- Script para agregar campo WhatsApp a la tabla users
-- Ejecutar en NeonDB

ALTER TABLE users 
ADD COLUMN whatsapp_number VARCHAR(20);

-- Opcionalmente agregar índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp_number);

-- Comentario para documentar el campo
COMMENT ON COLUMN users.whatsapp_number IS 'Número de WhatsApp con código de país (+595...)';
