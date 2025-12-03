# E-TICKET Frontend - Sistema de Gestión de Eventos

Frontend desarrollado en React para el sistema de gestión de eventos E-TICKET, inspirado en eticket.gt

## 🚀 Características

- ✅ Diseño moderno y responsivo inspirado en eticket.gt
- ✅ Autenticación de usuarios (Login/Register)
- ✅ Visualización de eventos por categorías
- ✅ Sistema de registro a eventos con selección de tickets
- ✅ Panel de usuario para ver eventos registrados
- ✅ Panel de administración (solo para admins)
- ✅ Integración completa con backend API REST

## 📋 Requisitos Previos

- Node.js 14+ instalado
- Backend API corriendo en http://localhost:8000
- PostgreSQL configurado y corriendo

## 🛠️ Instalación

### 1. Instalar Dependencias

```bash
cd frontend
npm install
```

### 2. Configurar Variables de Entorno

El archivo `.env` ya está creado con:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

Si el backend corre en otro puerto, modifica esta variable.

### 3. Iniciar el Servidor de Desarrollo

```bash
npm start
```

La aplicación se abrirá en: http://localhost:3000

## 📁 Estructura del Proyecto

```
frontend/
├── public/                 # Archivos públicos
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── Header/       # Header con navegación
│   │   └── Footer/       # Footer
│   ├── pages/            # Páginas de la aplicación
│   │   ├── Home/         # Página principal
│   │   ├── Login/        # Inicio de sesión
│   │   ├── Register/     # Registro de usuarios
│   │   ├── Events/       # Listado de eventos
│   │   ├── EventDetail/  # Detalle de evento
│   │   ├── MyRegistrations/ # Mis eventos registrados
│   │   ├── Profile/      # Perfil de usuario
│   │   └── Admin/        # Panel de administración
│   ├── services/         # Servicios API
│   │   ├── authService.js
│   │   ├── eventService.js
│   │   └── registrationService.js
│   ├── context/          # Context API
│   │   └── AuthContext.js
│   ├── config/           # Configuración
│   │   └── api.js
│   ├── App.js           # Componente principal
│   ├── App.css          # Estilos globales
│   └── index.js         # Punto de entrada
├── .env                  # Variables de entorno
├── package.json
└── README.md
```

## 🎨 Páginas y Funcionalidades

### 1. Página Principal (/)
- Hero section con llamado a la acción
- Grid de categorías de eventos
- Eventos destacados
- Listado de todos los eventos

### 2. Login (/login)
- Formulario de inicio de sesión
- Credenciales de prueba mostradas
- Redirección automática después del login

### 3. Registro (/register)
- Formulario de registro de nuevo usuario
- Validación de campos
- Login automático después del registro

### 4. Eventos (/eventos)
- Listado completo de eventos
- Filtro por categorías
- Cards con información del evento
- Navegación a detalle de evento

### 5. Detalle de Evento (/eventos/:id)
- Información completa del evento
- Selección de tipo de ticket
- Selección de cantidad
- Cálculo de precio total
- Registro al evento

### 6. Mis Registros (/mis-registros)
- Lista de eventos en los que estoy registrado
- Información de tickets comprados
- Opción para cancelar registros
- Estado de cada registro

### 7. Perfil (/perfil)
- Información del usuario
- Datos de cuenta
- Rol y permisos

### 8. Admin (/admin)
- Panel de estadísticas
- Total de eventos, usuarios, registros
- Acciones rápidas (en desarrollo)
- Solo accesible para usuarios con rol admin

## 🔐 Usuarios de Prueba

Una vez que ejecutes el seed del backend (`npm run seed`), tendrás estos usuarios disponibles:

### Administrador
- **Email**: admin@example.com
- **Password**: admin123
- **Permisos**: Acceso total

### Organizador
- **Email**: organizer@example.com
- **Password**: organizer123
- **Permisos**: Gestión de eventos

### Usuario Regular
- **Email**: user@example.com
- **Password**: user123
- **Permisos**: Ver y registrarse a eventos

## 🔌 Conexión con Backend

El frontend se conecta al backend a través de:

1. **Axios** para peticiones HTTP
2. **JWT Tokens** para autenticación
3. **LocalStorage** para persistencia de sesión
4. **Interceptores** para manejo automático de tokens

### Endpoints Utilizados

- POST `/api/v1/auth/login` - Iniciar sesión
- POST `/api/v1/auth/register` - Registrar usuario
- GET `/api/v1/auth/me` - Obtener usuario actual
- GET `/api/v1/events` - Listar eventos
- GET `/api/v1/events/:id` - Detalle de evento
- GET `/api/v1/categories` - Listar categorías
- GET `/api/v1/tickets` - Listar tickets
- POST `/api/v1/registrations` - Registrarse a evento
- GET `/api/v1/registrations/my-registrations` - Mis registros
- DELETE `/api/v1/registrations/:id` - Cancelar registro
- GET `/api/v1/admin/dashboard` - Dashboard admin

## 🎨 Personalización de Estilos

Los colores principales están definidos en `src/App.css`:

```css
:root {
  --primary-color: #e63946;      /* Rojo principal */
  --secondary-color: #1d3557;    /* Azul oscuro */
  --accent-color: #f1faee;       /* Blanco/crema */
  --hover-color: #d62839;        /* Rojo hover */
  --success-color: #06d6a0;      /* Verde */
  --danger-color: #ef476f;       /* Rojo error */
}
```

## 📱 Responsive Design

El sitio es completamente responsivo con breakpoints en:
- 768px (tablets)
- 480px (móviles)

## 🚀 Scripts Disponibles

### `npm start`
Inicia el servidor de desarrollo en http://localhost:3000

### `npm run build`
Crea una versión optimizada para producción en la carpeta `build/`

### `npm test`
Ejecuta las pruebas (si las hay)

### `npm run eject`
Expone la configuración de webpack (irreversible)

## 🔄 Flujo de Usuario

### Usuario Normal
1. Registrarse o iniciar sesión
2. Ver eventos disponibles
3. Seleccionar un evento
4. Elegir tipo de ticket y cantidad
5. Registrarse al evento
6. Ver sus registros en "Mis Eventos"
7. Cancelar registros si es necesario

### Administrador
1. Iniciar sesión con cuenta admin
2. Acceder al panel de administración
3. Ver estadísticas del sistema
4. Gestionar eventos (próximamente)
5. Gestionar usuarios (próximamente)

## 🐛 Solución de Problemas

### El frontend no se conecta al backend
- Verifica que el backend esté corriendo en http://localhost:8000
- Verifica la variable `REACT_APP_API_URL` en `.env`
- Revisa la consola del navegador para errores de CORS

### Error 401 (No autorizado)
- El token ha expirado o es inválido
- Cierra sesión y vuelve a iniciar sesión

### Los eventos no se cargan
- Verifica que el backend esté corriendo
- Asegúrate de haber ejecutado el seed: `npm run seed`
- Revisa que PostgreSQL esté activo

### Error de CORS
- Verifica que el backend tenga CORS configurado correctamente
- La URL del frontend debe estar en `CORS_ORIGIN` del backend

## 📦 Dependencias Principales

- **react**: ^18.x - Framework principal
- **react-router-dom**: ^6.x - Enrutamiento
- **axios**: ^1.x - Cliente HTTP
- **react-slick**: ^0.x - Carrusel (opcional)
- **slick-carousel**: ^1.x - Estilos del carrusel

## 🌐 Despliegue

### Producción Local

```bash
npm run build
npm install -g serve
serve -s build -p 3000
```

### Netlify/Vercel

1. Conecta tu repositorio
2. Configura las variables de entorno
3. Comando de build: `npm run build`
4. Directorio de publicación: `build`

## 📝 Notas Importantes

1. **Autenticación**: Los tokens JWT se guardan en localStorage
2. **Sesión**: La sesión persiste al recargar la página
3. **Seguridad**: Las rutas de admin están protegidas por rol
4. **API**: Todas las peticiones incluyen el token automáticamente
5. **Errores**: Los errores 401 redirigen automáticamente al login

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto fue desarrollado con fines educativos.

## 👥 Autor

Desarrollado como proyecto final

## 🙏 Agradecimientos

- Diseño inspirado en eticket.gt
- Backend API proporcionado como base del proyecto

---

**¿Necesitas ayuda?** Consulta también:
- `../VERIFICATION_GUIDE.md` - Guía de verificación del proyecto completo
- `../RESUMEN_PROYECTO.md` - Resumen general del proyecto
- `../API_DOCUMENTATION.md` - Documentación de la API
