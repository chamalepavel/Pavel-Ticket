# 🎯 EJEMPLOS PRÁCTICOS PARA LA PRESENTACIÓN

## 📌 DEMOSTRACIÓN EN VIVO - PASO A PASO

### 1️⃣ **MOSTRAR CÓMO INICIAR EL PROYECTO**

```bash
# Terminal 1: Base de Datos
docker-compose up -d
# Explicar: "Este comando levanta PostgreSQL en un contenedor Docker"
# Mostrar: docker ps (para ver contenedores corriendo)

# Terminal 2: Backend
npm run dev
# Explicar: "nodemon observa cambios y reinicia automáticamente"
# Mostrar: Los logs de conexión a BD

# Terminal 3: Frontend
cd frontend && npm start
# Explicar: "React se compila y abre en el navegador"
# Mostrar: La aplicación funcionando
```

---

### 2️⃣ **DEMOSTRAR UN FLUJO COMPLETO DE USUARIO**

#### **Escenario: Usuario se registra y compra un boleto**

**Paso 1: Registro de Usuario**
```
URL: http://localhost:3000/register

Frontend → envía datos → Backend
Backend → encripta password → Guarda en BD
BD → retorna usuario creado → Backend
Backend → genera JWT token → Frontend
Frontend → guarda token en localStorage
```

**Código que se ejecuta (backend)**:
```javascript
// src/controllers/auth.controller.js - register()
const hashedPassword = await bcrypt.hash(password, 10);
const user = await User.create({
  name,
  email,
  password: hashedPassword
});
const token = generateToken({ userId: user.userid });
```

**Paso 2: Ver Eventos**
```
Frontend llama: eventService.getEvents()
↓
GET http://localhost:8000/api/v1/events
↓
Backend ejecuta: Event.findAll({ include: [Category] })
↓
PostgreSQL ejecuta: 
  SELECT * FROM events 
  LEFT JOIN categories ON events.category_id = categories.category_id
↓
Retorna JSON con eventos
↓
React renderiza tarjetas de eventos
```

**Paso 3: Registrarse a un Evento**
```
Usuario hace click en "Registrarse"
↓
Frontend envía: POST /api/v1/registrations
Headers: { Authorization: Bearer eyJhbGc... }
Body: { eventId: "123", quantity: 2 }
↓
Middleware verifica token
↓
Controller valida disponibilidad
↓
Crea registro en BD
↓
Actualiza available_tickets del evento
↓
Genera tickets automáticamente
↓
Retorna confirmación
```

---

### 3️⃣ **MOSTRAR EL PANEL DE ADMIN**

**Login como Admin**:
```
Email: admin@eventmanager.com
Password: password123

Frontend → POST /api/v1/auth/login → Backend
Backend verifica credenciales
Backend verifica rol del usuario
Retorna usuario con role: "Admin"
Frontend detecta rol y muestra opciones admin
```

**Crear un Evento (Admin)**:
```javascript
// Frontend: AdminEventManagement.js
const handleCreateEvent = async (eventData) => {
  // Validar datos
  if (!eventData.title || !eventData.date) {
    alert('Faltan campos obligatorios');
    return;
  }
  
  // Enviar al backend
  const response = await adminService.createEvent(eventData);
  
  // Actualizar lista
  loadEvents();
};

// Backend: event.controller.js - createEvent()
const event = await Event.create({
  title: req.body.title,
  description: req.body.description,
  event_date: req.body.event_date,
  organizer_id: req.user.userid, // Del token JWT
  capacity: req.body.capacity,
  available_tickets: req.body.capacity
});
```

**Ver Estadísticas en Dashboard**:
```javascript
// Backend calcula:
const stats = {
  totalEvents: await Event.count(),
  totalUsers: await User.count(),
  totalRegistrations: await Registration.count(),
  revenue: await Registration.sum('total_amount')
};

// SQL generado por Sequelize:
SELECT COUNT(*) FROM events;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM registrations;
SELECT SUM(total_amount) FROM registrations;
```

---

### 4️⃣ **EXPLICAR LA SEGURIDAD**

#### **Ejemplo de Ataque Prevenido: SQL Injection**

**❌ Código Vulnerable (NO usamos esto)**:
```javascript
// NUNCA hacer esto
const query = `SELECT * FROM users WHERE email = '${email}'`;
// Si email = "' OR '1'='1" → retorna todos los usuarios
```

**✅ Código Seguro (Lo que usamos)**:
```javascript
// Sequelize previene SQL injection
const user = await User.findOne({ 
  where: { email: email } 
});
// Sequelize escapa automáticamente los valores
```

#### **Protección de Rutas**

```javascript
// Ruta pública (cualquiera puede acceder)
router.get('/events', eventController.getAllEvents);

// Ruta protegida (requiere login)
router.post('/registrations', 
  protect,  // ← Middleware verifica token
  registrationController.create
);

// Ruta admin (requiere login + rol admin)
router.post('/events', 
  protect,        // ← Verifica token
  restrictTo('Admin'),  // ← Verifica rol
  eventController.createEvent
);
```

#### **Ejemplo de Token JWT**

```javascript
// Cuando el usuario hace login, generamos:
const token = jwt.sign(
  { userId: user.userid, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Token resultante (3 partes separadas por puntos):
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzAxNDU2Nzg5LCJleHAiOjE3MDIwNjE1ODl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

// Parte 1: Header (algoritmo)
// Parte 2: Payload (datos del usuario)
// Parte 3: Signature (firma para verificar autenticidad)
```

---

### 5️⃣ **MOSTRAR CONSULTAS A LA BASE DE DATOS**

#### **Usando Sequelize (Lo que hacemos)**

```javascript
// Obtener eventos con sus categorías y organizador
const events = await Event.findAll({
  include: [
    { model: Category, as: 'category' },
    { model: User, as: 'organizer', attributes: ['name', 'email'] }
  ],
  where: { status: 'active' },
  order: [['event_date', 'ASC']],
  limit: 10
});

// Sequelize genera automáticamente:
SELECT 
  events.*,
  categories.name as "category.name",
  users.name as "organizer.name",
  users.email as "organizer.email"
FROM events
LEFT JOIN categories ON events.category_id = categories.category_id
LEFT JOIN users ON events.organizer_id = users.userid
WHERE events.status = 'active'
ORDER BY events.event_date ASC
LIMIT 10;
```

#### **Ejemplo de Transacción (Registro a Evento)**

```javascript
// Usar transacción para garantizar consistencia
const t = await sequelize.transaction();

try {
  // 1. Verificar disponibilidad
  const event = await Event.findByPk(eventId, { transaction: t });
  
  if (event.available_tickets < quantity) {
    throw new Error('No hay suficientes boletos');
  }
  
  // 2. Crear registro
  const registration = await Registration.create({
    user_id: userId,
    event_id: eventId,
    quantity: quantity,
    total_amount: event.price * quantity
  }, { transaction: t });
  
  // 3. Actualizar tickets disponibles
  await event.decrement('available_tickets', {
    by: quantity,
    transaction: t
  });
  
  // 4. Crear tickets
  const tickets = [];
  for (let i = 0; i < quantity; i++) {
    tickets.push({
      registration_id: registration.registrationid,
      ticket_code: generateTicketCode()
    });
  }
  await Ticket.bulkCreate(tickets, { transaction: t });
  
  // Si todo sale bien, confirmar
  await t.commit();
  
} catch (error) {
  // Si algo falla, revertir todo
  await t.rollback();
  throw error;
}
```

---

### 6️⃣ **DEMOSTRAR COMUNICACIÓN FRONTEND-BACKEND**

#### **Usando Browser DevTools**

```javascript
// Abrir Chrome DevTools (F12)
// Ir a la pestaña "Network"
// Hacer una acción (ej: login)

// Ver la petición:
Request URL: http://localhost:8000/api/v1/auth/login
Request Method: POST
Status Code: 200 OK

// Headers enviados:
Content-Type: application/json

// Payload (Body):
{
  "email": "admin@eventmanager.com",
  "password": "password123"
}

// Respuesta:
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "userid": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Admin User",
      "email": "admin@eventmanager.com",
      "role": "Admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### **Código del Service en Frontend**

```javascript
// frontend/src/services/authService.js
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Guardar token en localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data;
    }
    
    throw new Error(data.message);
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};
```

---

### 7️⃣ **EXPLICAR DOCKER Y DOCKER COMPOSE**

#### **docker-compose.yml Explicado**

```yaml
version: '3.8'

services:
  postgres:                          # Nombre del servicio
    image: postgres:15-alpine        # Imagen base de Docker Hub
    container_name: event_management_db  # Nombre del contenedor
    restart: unless-stopped          # Reiniciar si se cae
    environment:                     # Variables de entorno
      POSTGRES_USER: event_admin
      POSTGRES_PASSWORD: SecureP@ssw0rd2024
      POSTGRES_DB: event_management
    ports:
      - "5432:5432"                  # Puerto HOST:CONTENEDOR
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Persistencia
      - ./docker/init-scripts:/docker-entrypoint-initdb.d  # Scripts SQL
    networks:
      - event_network                # Red interna
    healthcheck:                     # Verificar salud
      test: ["CMD-SHELL", "pg_isready"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:                     # Volumen persistente
    driver: local

networks:
  event_network:                     # Red para comunicación
    driver: bridge
```

#### **Comandos Docker útiles**

```bash
# Ver contenedores corriendo
docker ps

# Ver logs de la base de datos
docker logs event_management_db

# Ver logs en tiempo real
docker logs -f event_management_db

# Entrar al contenedor (acceso a PostgreSQL)
docker exec -it event_management_db psql -U event_admin -d event_management

# Ver volúmenes
docker volume ls

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: borra datos)
docker-compose down -v
```

---

### 8️⃣ **VARIABLES DE ENTORNO EXPLICADAS**

```bash
# .env file

# ===== BASE DE DATOS =====
PGHOST=localhost
# Dónde está la BD. localhost = esta máquina
# Si fuera producción podría ser: db.produccion.com

PGUSER=event_admin
# Usuario de PostgreSQL con permisos en la BD

PGDATABASE=event_management
# Nombre de la base de datos

PGPASSWORD=SecureP@ssw0rd2024
# Contraseña del usuario
# En producción usar contraseña más segura y rotarla

PGPORT=5432
# Puerto estándar de PostgreSQL
# Si hay conflicto, cambiar a 5433, 5434, etc.

# ===== SERVIDOR =====
PORT=8000
# Puerto donde corre el backend
# Frontend hace peticiones a localhost:8000

NODE_ENV=development
# Ambiente de ejecución
# Opciones: development, production, test
# Afecta logs, optimizaciones, errores detallados

# ===== JWT =====
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# Clave secreta para firmar tokens
# NUNCA exponer en código
# Cambiar en producción a valor aleatorio largo

JWT_EXPIRE=7d
# Tiempo de expiración del token
# Opciones: 1h, 24h, 7d, 30d
# Más corto = más seguro pero usuario debe relogin

# ===== CORS =====
CORS_ORIGIN=http://localhost:3000
# Origen permitido para peticiones
# En producción sería: https://pavelticket.com
# Previene que otros sitios accedan tu API

# ===== ARCHIVOS =====
MAX_FILE_SIZE=5242880
# 5MB en bytes (5 * 1024 * 1024)
# Límite para imágenes de eventos

UPLOAD_PATH=./public/uploads
# Carpeta donde se guardan archivos subidos
# El backend sirve estos archivos como estáticos
```

---

### 9️⃣ **ERRORES COMUNES Y SOLUCIONES**

#### **Error: "ECONNREFUSED" al iniciar backend**

```bash
# Problema: Backend no puede conectar a PostgreSQL
# Solución:

# 1. Verificar que Docker está corriendo
docker ps

# 2. Si no aparece, iniciar
docker-compose up -d

# 3. Esperar 10 segundos a que PostgreSQL inicie completamente

# 4. Verificar logs
docker logs event_management_db
```

#### **Error: "Port 8000 already in use"**

```bash
# Problema: Otro proceso usa el puerto 8000
# Soluciones:

# Opción 1: Matar el proceso
# Windows
netstat -ano | findstr :8000
taskkill /PID <numero_pid> /F

# Opción 2: Cambiar puerto en .env
PORT=8001
```

#### **Error: "relation does not exist"**

```bash
# Problema: Tablas no existen en BD
# Solución: Correr seed

npm run seed

# Si persiste, resetear BD completamente:
docker-compose down -v
docker-compose up -d
# Esperar 10 segundos
npm run seed
```

---

### 🔟 **MÉTRICAS Y PERFORMANCE**

#### **Tiempos de Respuesta (visibles en logs)**

```bash
# Logs del backend muestran:
GET /api/v1/events 200 45.969 ms - 1790
# 200 = Status OK
# 45.969 ms = Tiempo de respuesta (rápido)
# 1790 = Bytes enviados

GET /api/v1/events 304 11.717 ms - -
# 304 = Not Modified (cache)
# 11.717 ms = Mucho más rápido (usa cache del navegador)
```

#### **Optimizaciones Implementadas**

1. **Índices en BD**:
```sql
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_users_email ON users(email);
```

2. **Paginación**:
```javascript
const { page = 1, limit = 10 } = req.query;
const offset = (page - 1) * limit;

const events = await Event.findAndCountAll({
  limit: parseInt(limit),
  offset: parseInt(offset)
});
```

3. **Eager Loading (evita N+1 queries)**:
```javascript
// ❌ Malo: N+1 queries
const events = await Event.findAll();
for (let event of events) {
  event.category = await Category.findByPk(event.category_id);
  // 1 query por evento + 1 query inicial = N+1
}

// ✅ Bueno: 1 query
const events = await Event.findAll({
  include: [Category]
  // 1 query con JOIN
});
```

---

## 🎤 PUNTOS CLAVE PARA LA PRESENTACIÓN

### **Al Hablar del Frontend**:
1. "Usé React porque permite crear interfaces dinámicas y reutilizables"
2. "Context API me permite compartir el estado de autenticación sin prop drilling"
3. "Los servicios separan la lógica de red de los componentes visuales"

### **Al Hablar del Backend**:
1. "Express es minimalista pero muy poderoso para crear APIs"
2. "El patrón MVC hace el código más organizado y mantenible"
3. "Los middleware me permiten reutilizar lógica como autenticación"

### **Al Hablar de la Base de Datos**:
1. "PostgreSQL es robusto y soporta transacciones ACID"
2. "Sequelize me ahorra escribir SQL y previene inyecciones"
3. "Las relaciones están bien definidas con foreign keys"

### **Al Hablar de Seguridad**:
1. "JWT es stateless, perfecto para APIs REST"
2. "bcrypt hace imposible revertir los passwords hasheados"
3. "CORS previene que sitios maliciosos accedan mi API"

---

## 📊 DIAGRAMA FINAL DEL FLUJO

```
USUARIO
  ↓
NAVEGADOR (React App - localhost:3000)
  ↓
[HTTP Request con JWT Token]
  ↓
BACKEND API (Express - localhost:8000)
  ↓
[Middleware: Auth, Validation, Error Handler]
  ↓
CONTROLLER (Lógica de Negocio)
  ↓
MODEL (Sequelize ORM)
  ↓
[SQL Query]
  ↓
BASE DE DATOS (PostgreSQL - localhost:5432)
  ↓
[Resultado]
  ↓
CONTROLLER formatea respuesta
  ↓
[JSON Response]
  ↓
REACT actualiza UI
  ↓
USUARIO ve resultado
```

---

**¡Éxito en tu presentación! 🚀**
