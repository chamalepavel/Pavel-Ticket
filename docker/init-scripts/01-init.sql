-- Archivo de inicialización de PostgreSQL
-- Este script se ejecuta automáticamente cuando se crea el contenedor por primera vez

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Crear el usuario de la aplicación con permisos completos sobre la base de datos
-- (esto es adicional al usuario por defecto creado por Docker)
DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = 'event_app_user'
   ) THEN
      CREATE USER event_app_user WITH PASSWORD 'AppP@ssw0rd2024';
   END IF;
END
$$;

-- Otorgar permisos al usuario de la aplicación
GRANT ALL PRIVILEGES ON DATABASE event_management TO event_app_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO event_app_user;

-- Asegurar que el usuario pueda crear tablas y modificar datos
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO event_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO event_app_user;

-- Mensaje de confirmación
\echo '✅ Base de datos inicializada correctamente'
\echo '✅ Usuario event_app_user creado con permisos completos'
\echo '✅ Extensiones instaladas: uuid-ossp, pg_trgm'
