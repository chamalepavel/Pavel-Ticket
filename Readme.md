# PAVEL TICKET - Sistema de Gestión de Eventos

Sistema completo de gestión y venta de boletos para eventos desarrollado con Node.js, React y PostgreSQL.

## Video Explicativo

Puedes ver el video completo explicando la API y sus funcionalidades aquí:
[Ver Video Explicativo](https://drive.google.com/file/d/1jBvrOSNZXvTK0C4tDXkR01uW3QT4RoEN/view?usp=drive_link)

## Descripción

PAVEL TICKET es una plataforma web moderna que permite la gestión integral de eventos, desde la creación y administración hasta la venta de boletos y registro de asistentes. El sistema cuenta con roles de Administrador y Usuario, cada uno con funcionalidades específicas para una experiencia completa.

## Características Principales

### Para Usuarios
- Registro e inicio de sesión seguro
- Exploración de eventos por categorías
- Compra de boletos múltiples por transacción
- Visualización de eventos registrados
- Gestión de perfil personal
- Cálculo automático de precios y totales

### Para Administradores
- Panel de administración completo con estadísticas
- Gestión de eventos (crear, editar, eliminar, subir imágenes)
- Gestión de usuarios del sistema
- Reportes y estadísticas de ventas
- Control de capacidad y disponibilidad
- Visualización de revenue por evento

## Tecnologías Utilizadas

### Backend
- Node.js v18+ con Express.js
- PostgreSQL 15 como base de datos
- Sequelize ORM para modelado de datos
- JWT para autenticación segura
- Multer para carga de imágenes
- Docker para contenedores de base de datos
- bcryptjs para encriptación de contraseñas

### Frontend
- React 18 con Hooks
- React Router DOM para navegación
- Axios para peticiones HTTP
- Recharts para gráficos y estadísticas
- CSS3 personalizado para estilos

## Instalación y Configuración

### Prerrequisitos
- Node.js 18 o superior
- Docker Desktop instalado y ejecutándose
- Git

### Instalación Rápida

1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/pavel-ticket.git
cd pavel-ticket
```

2. Instalar dependencias del backend
```bash
npm install
```

3. Instalar dependencias del frontend
```bash
cd frontend
npm install
cd ..
```

4. Configurar variables de entorno

Copiar el archivo de ejemplo y configurar:
```bash
copy .env.example .env
```

Editar `.env` con tus configuraciones:
```env
# Database Configuration
PGHOST=localhost
PGUSER=event_admin
PGDATABASE=event_management
PGPASSWORD=SecureP@ssw0rd2024
PGPORT=5432

# Server Configuration
PORT=8000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/uploads
```

5. Iniciar el proyecto completo

Opción 1 - Script automático:
```bash
start-all.bat
```

Opción 2 - Manual:
```bash
# Terminal 1: Iniciar base de datos
docker-compose up -d

# Terminal 2: Iniciar backend
npm run dev

# Terminal 3: Iniciar frontend
cd frontend
npm start
```

## Uso del Sistema

### Acceso de Prueba

Usuario Regular:
- Email: `juan@example.com`
- Password: `password123`

Administrador:
- Email: `admin@eventmanager.com`
- Password: `password123`

### URLs de Acceso
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- PgAdmin: http://localhost:5050

### Flujo de Compra de Boletos

1. Iniciar sesión como usuario
2. Navegar a la sección "Eventos"
3. Filtrar por categoría si lo deseas
4. Seleccionar un evento para ver detalles
5. Usar botones +/- para seleccionar cantidad
6. Ver el total calculado en tiempo real
7. Click en "Comprar X Entrada(s)"
8. Confirmar compra
9. Revisar en "Mis Registros"

### Panel de Administración

1. Iniciar sesión como administrador
2. Acceder a `/admin`
3. Dashboard: Ver estadísticas generales, gráficos de revenue
4. Gestión de Eventos: Crear, editar, eliminar eventos, subir imágenes
5. Gestión de Usuarios: Ver y administrar todos los usuarios
6. Reportes: Estadísticas detalladas de ventas por período

## Estructura del Proyecto

```
pavel-ticket/
├── src/                          # Backend
│   ├── controllers/              # Lógica de negocio
│   ├── models/                   # Modelos de datos
│   ├── routes/                   # Rutas de API
│   ├── middleware/               # Autenticación y validación
│   ├── utils/                    # Utilidades y helpers
│   ├── scripts/                  # Scripts de base de datos
│   ├── app.js                    # Configuración de Express
│   └── index.js                  # Punto de entrada
│
├── frontend/                     # Frontend React
│   ├── public/                   # Archivos estáticos
│   └── src/
│       ├── components/           # Componentes reutilizables
│       ├── pages/                # Páginas principales
│       ├── services/             # Servicios de API
│       ├── context/              # Context para autenticación
│       └── config/               # Configuración
│
├── docker/                       # Configuración Docker
│   └── init-scripts/             # Scripts de inicialización DB
│
├── public/uploads/               # Archivos subidos
├── .env                          # Variables de entorno
├── docker-compose.yml            # Configuración contenedores
└── package.json                  # Dependencias backend
```

## Scripts Disponibles

### Backend
```bash
npm run dev          # Desarrollo con nodemon (auto-reload)
npm start            # Producción
npm run seed         # Poblar base de datos con datos de prueba
```

### Frontend
```bash
npm start            # Servidor de desarrollo (puerto 3000)
npm build            # Build de producción
npm test             # Ejecutar tests
```

### Base de Datos (Windows)
```bash
db-start.bat         # Iniciar contenedor PostgreSQL
db-stop.bat          # Detener contenedor
db-reset.bat         # Reiniciar y limpiar base de datos
db-logs.bat          # Ver logs del contenedor
```

## Endpoints Principales de la API

### Autenticación (`/api/v1/auth`)
- `POST /register` - Registrar nuevo usuario
- `POST /login` - Iniciar sesión
- `POST /logout` - Cerrar sesión
- `GET /me` - Obtener usuario autenticado

### Eventos (`/api/v1/events`)
- `GET /` - Listar todos los eventos
- `GET /:id` - Obtener detalles de un evento
- `POST /` - Crear evento (Admin)
- `PUT /:id` - Actualizar evento (Admin)
- `DELETE /:id` - Eliminar evento (Admin)

### Registros (`/api/v1/registrations`)
- `POST /registerUserForEvent/:id` - Comprar boletos
- `GET /my-registrations` - Ver mis registros
- `POST /cancelRegistration/:id` - Cancelar registro

### Categorías (`/api/v1/categories`)
- `GET /` - Listar todas las categorías
- `POST /` - Crear categoría (Admin)
- `PUT /:id` - Actualizar categoría (Admin)

### Administración (`/api/v1/admin`)
- `GET /dashboard/stats` - Estadísticas del dashboard
- `GET /reports/sales` - Reporte de ventas por período
- `GET /users` - Listar todos los usuarios
- `PATCH /events/:id/sales` - Modificar ventas de evento

## Seguridad Implementada

- Autenticación basada en JSON Web Tokens (JWT)
- Contraseñas encriptadas con bcrypt (10 rounds)
- Validación de datos con express-validator
- Protección de rutas por roles (middleware)
- Sanitización de inputs
- Variables de entorno para datos sensibles
- Helmet.js para headers de seguridad HTTP
- CORS configurado específicamente

## Docker y Base de Datos

El proyecto utiliza Docker Compose para gestionar PostgreSQL:

Servicios incluidos:
- PostgreSQL 15 (puerto 5432)
- PgAdmin 4 (puerto 5050)

Comandos útiles:
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Detener servicios
docker-compose down

# Limpiar volúmenes (CUIDADO: borra datos)
docker-compose down -v
```

## Características del Frontend

- Diseño responsive y moderno
- Navegación intuitiva con React Router
- Sistema de autenticación con Context API
- Componentes reutilizables (Header, Footer)
- Carga dinámica de imágenes de eventos
- Filtrado de eventos por categoría
- Carrito de compra con cálculo automático
- Dashboard administrativo con gráficos
- Manejo de errores y feedback al usuario

## Modelos de Base de Datos

### Principales Entidades
- Users: Usuarios del sistema (clientes y admins)
- Events: Eventos disponibles
- Categories: Categorías de eventos
- Registrations: Compras/registros de usuarios
- Tickets: Boletos individuales generados
- TicketTypes: Tipos de boletos por evento
- PromoCodes: Códigos promocionales (opcional)

### Relaciones
- Un evento pertenece a una categoría
- Un evento tiene múltiples tipos de boletos
- Un usuario puede tener múltiples registros
- Un registro genera múltiples tickets

## Despliegue a Producción

### Variables de Entorno Importantes
```env
NODE_ENV=production
PORT=8000
PGHOST=tu-servidor-postgres
JWT_SECRET=clave-super-segura-diferente
CORS_ORIGIN=https://tu-dominio.com
```

### Recomendaciones
1. Usar PostgreSQL en servidor dedicado
2. Configurar HTTPS con certificado SSL
3. Usar PM2 para gestión de procesos Node.js
4. Implementar sistema de backups de BD
5. Configurar logs centralizados
6. Monitorear con herramientas como New Relic

## Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request


## Autor

Pavel Huberto

Desarrollado como proyecto académico para la Universidad de San Carlos de Guatemala.
