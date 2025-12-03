# 🎫 E-TICKET - Sistema de Gestión de Eventos

Sistema completo de gestión y venta de boletos para eventos desarrollado con Node.js, React y PostgreSQL.

## 📋 Descripción

E-TICKET es una plataforma web que permite la gestión integral de eventos, desde la creación y administración hasta la venta de boletos y registro de asistentes. El sistema cuenta con dos roles principales: Administrador y Usuario, cada uno con funcionalidades específicas.

## ✨ Características Principales

### Para Usuarios
- ✅ Registro e inicio de sesión
- ✅ Exploración de eventos por categorías
- ✅ Compra de boletos (múltiples entradas por transacción)
- ✅ Visualización de eventos registrados
- ✅ Gestión de perfil
- ✅ Cálculo automático de precios

### Para Administradores
- ✅ Panel de administración completo
- ✅ Gestión de eventos (crear, editar, eliminar)
- ✅ Gestión de usuarios
- ✅ Reportes y estadísticas
- ✅ Visualización de ventas y revenue
- ✅ Control de capacidad de eventos

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js v18+
- Express.js
- PostgreSQL 15
- Sequelize ORM
- JWT para autenticación
- Multer para carga de archivos
- Docker para contenedores

### Frontend
- React 18
- React Router DOM
- Axios para peticiones HTTP
- CSS3 para estilos

## 📦 Instalación

### Prerrequisitos
- Node.js 18 o superior
- Docker Desktop
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd proyecto-eventos
```

2. **Instalar dependencias del backend**
```bash
npm install
```

3. **Instalar dependencias del frontend**
```bash
cd frontend
npm install
cd ..
```

4. **Configurar variables de entorno**

Crear archivo `.env` en la raíz del proyecto:
```env
PORT=8000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=event_management
DB_USER=event_admin
DB_PASSWORD=event_password_2024

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui_2024
JWT_EXPIRES_IN=7d
```

Crear archivo `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

5. **Iniciar la base de datos (Docker)**
```bash
db-start.bat
```

6. **Verificar que la base de datos esté lista**
```bash
db-logs.bat
```

7. **Iniciar el backend**
```bash
npm run dev
```

8. **Iniciar el frontend** (en otra terminal)
```bash
cd frontend
npm start
```

## 🚀 Uso del Sistema

### Acceso Inicial

**Usuario de prueba:**
- Email: `juan@example.com`
- Password: `password123`
- Rol: Usuario

**Administrador:**
- Email: `admin@eventmanager.com`
- Password: `password123`
- Rol: Administrador

### Flujo de Compra de Boletos

1. Navegar a "Eventos"
2. Seleccionar un evento
3. Elegir cantidad de entradas (botones +/-)
4. Ver el total calculado en tiempo real
5. Click en "Comprar X Entrada(s)"
6. Confirmar compra
7. Ver en "Mis Registros"

### Panel de Administración

1. Iniciar sesión como administrador
2. Acceder a `/admin`
3. Opciones disponibles:
   - **Dashboard**: Estadísticas generales
   - **Gestión de Eventos**: Crear, editar, eliminar eventos
   - **Gestión de Usuarios**: Ver y administrar usuarios
   - **Reportes**: Estadísticas de ventas y eventos

## 📁 Estructura del Proyecto

```
proyecto-eventos/
├── src/                          # Código backend
│   ├── controllers/              # Controladores
│   ├── models/                   # Modelos Sequelize
│   ├── routes/                   # Rutas API
│   ├── middleware/               # Middlewares
│   ├── utils/                    # Utilidades
│   └── index.js                  # Punto de entrada
├── frontend/                     # Código frontend
│   ├── public/                   # Archivos públicos
│   └── src/
│       ├── components/           # Componentes React
│       ├── pages/                # Páginas
│       ├── services/             # Servicios API
│       └── context/              # Context API
├── docker/                       # Configuración Docker
├── public/uploads/               # Archivos subidos
├── .env                          # Variables de entorno backend
├── docker-compose.yml            # Configuración Docker Compose
├── package.json                  # Dependencias backend
└── README.md                     # Este archivo
```

## 🔧 Scripts Útiles

### Backend
```bash
npm run dev          # Modo desarrollo con nodemon
npm start            # Modo producción
```

### Frontend
```bash
npm start            # Inicia servidor de desarrollo
npm build            # Construye para producción
```

### Base de Datos
```bash
db-start.bat         # Inicia contenedor PostgreSQL
db-stop.bat          # Detiene contenedor
db-reset.bat         # Reinicia base de datos
db-logs.bat          # Ver logs del contenedor
```

## 🌐 API Endpoints

### Autenticación
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Iniciar sesión
- `GET /api/v1/auth/me` - Obtener usuario actual

### Eventos
- `GET /api/v1/events` - Listar eventos
- `GET /api/v1/events/:id` - Detalles de evento
- `POST /api/v1/events` - Crear evento (Admin)
- `PUT /api/v1/events/:id` - Actualizar evento (Admin)
- `DELETE /api/v1/events/:id` - Eliminar evento (Admin)

### Registros/Compras
- `POST /api/v1/registrations/registerUserForEvent/:id` - Comprar boletos
- `GET /api/v1/registrations/my-registrations` - Mis registros
- `POST /api/v1/registrations/cancelRegistration/:id` - Cancelar registro

### Categorías
- `GET /api/v1/categories` - Listar categorías
- `POST /api/v1/categories` - Crear categoría (Admin)

## 🔒 Seguridad

- Autenticación mediante JWT
- Contraseñas hasheadas con bcrypt
- Validación de datos en backend
- Protección de rutas por rol
- Variables de entorno para datos sensibles

## 🐳 Docker

El proyecto incluye configuración Docker Compose para PostgreSQL:

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

- Equipo de Desarrollo E-TICKET

## 📞 Soporte

Para soporte o preguntas:
- Email: soporte@eticket.gt
- Issues: [GitHub Issues](link-a-issues)

## 🙏 Agradecimientos

- A todos los contribuidores del proyecto
- Comunidad de Node.js y React
- PostgreSQL team

---

Desarrollado con ❤️ para la gestión eficiente de eventos
