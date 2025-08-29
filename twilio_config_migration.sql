
-- Script para crear tabla de configuración de Twilio
-- Ejecutar en NeonDB

CREATE TABLE IF NOT EXISTS twilio_config (
  id SERIAL PRIMARY KEY,
  account_sid VARCHAR(500),
  auth_token VARCHAR(500),
  whatsapp_number VARCHAR(20), -- +14155238886
  is_production BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar registro inicial vacío
INSERT INTO twilio_config (account_sid, auth_token, whatsapp_number, is_production) 
VALUES ('', '', '', false)
ON CONFLICT DO NOTHING;

-- Comentarios para documentar
COMMENT ON TABLE twilio_config IS 'Configuración de Twilio WhatsApp API';
COMMENT ON COLUMN twilio_config.account_sid IS 'Account SID de Twilio';
COMMENT ON COLUMN twilio_config.auth_token IS 'Auth Token de Twilio';
COMMENT ON COLUMN twilio_config.whatsapp_number IS 'Número de WhatsApp de Twilio (+14155238886)';
COMMENT ON COLUMN twilio_config.is_production IS 'false = Sandbox, true = Producción';
