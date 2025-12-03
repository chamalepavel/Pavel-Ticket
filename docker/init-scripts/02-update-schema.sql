-- Script para actualizar el esquema de la base de datos
-- Agregar nuevos campos a la tabla events

-- Campos de ubicación detallada
ALTER TABLE events ADD COLUMN IF NOT EXISTS address VARCHAR(500);
ALTER TABLE events ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Guatemala';
ALTER TABLE events ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE events ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_name VARCHAR(200);

-- Fechas de venta
ALTER TABLE events ADD COLUMN IF NOT EXISTS sale_start_date TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS sale_end_date TIMESTAMP;

-- Información adicional
ALTER TABLE events ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS min_ticket_purchase INTEGER DEFAULT 1;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_ticket_purchase INTEGER DEFAULT 10;
ALTER TABLE events ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(10, 2) DEFAULT 0.00;

-- Crear tabla de tipos de tickets
CREATE TABLE IF NOT EXISTS ticket_types (
    ticket_type_id SERIAL PRIMARY KEY,
    eventid INTEGER NOT NULL REFERENCES events(eventid) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    quantity_sold INTEGER NOT NULL DEFAULT 0,
    sale_start_date TIMESTAMP,
    sale_end_date TIMESTAMP,
    benefits TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de códigos promocionales
CREATE TABLE IF NOT EXISTS promo_codes (
    promo_code_id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    eventid INTEGER REFERENCES events(eventid) ON DELETE CASCADE,
    max_uses INTEGER,
    times_used INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(userid) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar nuevos campos a la tabla registrations
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS ticket_type_id INTEGER REFERENCES ticket_types(ticket_type_id) ON DELETE SET NULL;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS promo_code_id INTEGER REFERENCES promo_codes(promo_code_id) ON DELETE SET NULL;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS final_price DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'cancelled', 'refunded'));
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS qr_code VARCHAR(500);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ticket_types_eventid ON ticket_types(eventid);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_eventid ON promo_codes(eventid);
CREATE INDEX IF NOT EXISTS idx_registrations_ticket_type ON registrations(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_registrations_promo_code ON registrations(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_sale_dates ON events(sale_start_date, sale_end_date);

-- Comentarios para documentación
COMMENT ON TABLE ticket_types IS 'Tipos de tickets disponibles para cada evento (VIP, General, Estudiante, etc.)';
COMMENT ON TABLE promo_codes IS 'Códigos promocionales para descuentos en eventos';
COMMENT ON COLUMN events.latitude IS 'Latitud GPS del lugar del evento';
COMMENT ON COLUMN events.longitude IS 'Longitud GPS del lugar del evento';
COMMENT ON COLUMN registrations.qr_code IS 'Código QR para check-in en el evento';
