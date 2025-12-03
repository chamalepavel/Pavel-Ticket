/**
 * Script de prueba para verificar la API
 * Ejecutar después de iniciar PostgreSQL y el servidor
 */

const http = require('http');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m'
};

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body ? JSON.parse(body) : null
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testHealthCheck() {
    console.log(`\n${colors.blue}[1/5] Probando Health Check...${colors.reset}`);
    
    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 8000,
            path: '/health',
            method: 'GET'
        });

        if (response.statusCode === 200) {
            console.log(`${colors.green}✓ Health Check exitoso${colors.reset}`);
            console.log(`  Respuesta:`, response.body);
            return true;
        } else {
            console.log(`${colors.red}✗ Health Check falló (Status: ${response.statusCode})${colors.reset}`);
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
        console.log(`${colors.yellow}  Asegúrate de que el servidor esté ejecutándose en el puerto 8000${colors.reset}`);
        return false;
    }
}

async function testRegister() {
    console.log(`\n${colors.blue}[2/5] Probando registro de usuario...${colors.reset}`);
    
    const testUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'test123456',
        full_name: 'Test User'
    };

    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 8000,
            path: '/api/v1/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, testUser);

        if (response.statusCode === 201) {
            console.log(`${colors.green}✓ Registro exitoso${colors.reset}`);
            console.log(`  Usuario creado: ${testUser.username}`);
            return true;
        } else {
            console.log(`${colors.red}✗ Registro falló (Status: ${response.statusCode})${colors.reset}`);
            console.log(`  Respuesta:`, response.body);
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
        return false;
    }
}

async function testLogin() {
    console.log(`\n${colors.blue}[3/5] Probando inicio de sesión (usuario admin)...${colors.reset}`);
    
    const credentials = {
        email: 'admin@example.com',
        password: 'admin123'
    };

    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 8000,
            path: '/api/v1/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, credentials);

        if (response.statusCode === 200) {
            console.log(`${colors.green}✓ Login exitoso${colors.reset}`);
            console.log(`  Usuario: ${response.body.data?.user?.username || 'admin'}`);
            console.log(`  Token recibido: ${response.body.data?.token ? 'Sí' : 'No'}`);
            return response.body.data?.token;
        } else {
            console.log(`${colors.red}✗ Login falló (Status: ${response.statusCode})${colors.reset}`);
            console.log(`  Respuesta:`, response.body);
            console.log(`${colors.yellow}  Nota: Ejecuta 'npm run seed' primero si el usuario admin no existe${colors.reset}`);
            return null;
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
        return null;
    }
}

async function testGetEvents(token) {
    console.log(`\n${colors.blue}[4/5] Probando listado de eventos...${colors.reset}`);
    
    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 8000,
            path: '/api/v1/events',
            method: 'GET',
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        });

        if (response.statusCode === 200) {
            console.log(`${colors.green}✓ Listado de eventos exitoso${colors.reset}`);
            const events = response.body.data?.events || response.body.data || [];
            console.log(`  Total de eventos: ${events.length}`);
            return true;
        } else {
            console.log(`${colors.red}✗ Listado falló (Status: ${response.statusCode})${colors.reset}`);
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
        return false;
    }
}

async function testGetCategories() {
    console.log(`\n${colors.blue}[5/5] Probando listado de categorías...${colors.reset}`);
    
    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 8000,
            path: '/api/v1/categories',
            method: 'GET'
        });

        if (response.statusCode === 200) {
            console.log(`${colors.green}✓ Listado de categorías exitoso${colors.reset}`);
            const categories = response.body.data?.categories || response.body.data || [];
            console.log(`  Total de categorías: ${categories.length}`);
            if (categories.length > 0) {
                console.log(`  Categorías:`, categories.map(c => c.name).join(', '));
            }
            return true;
        } else {
            console.log(`${colors.red}✗ Listado falló (Status: ${response.statusCode})${colors.reset}`);
            return false;
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
        return false;
    }
}

async function runTests() {
    console.log(`\n${colors.blue}========================================${colors.reset}`);
    console.log(`${colors.blue}  Prueba de API - Event Management${colors.reset}`);
    console.log(`${colors.blue}========================================${colors.reset}`);

    let passed = 0;
    let failed = 0;

    // Test 1: Health Check
    const healthOk = await testHealthCheck();
    healthOk ? passed++ : failed++;

    if (!healthOk) {
        console.log(`\n${colors.red}❌ El servidor no está respondiendo. Detención de pruebas.${colors.reset}`);
        console.log(`${colors.yellow}\nPasos para resolver:${colors.reset}`);
        console.log(`  1. Inicia PostgreSQL: net start postgresql-x64-17 (como admin)`);
        console.log(`  2. Inicia el servidor: npm run dev`);
        console.log(`  3. Vuelve a ejecutar: node test-api.js`);
        return;
    }

    // Test 2: Register
    const registerOk = await testRegister();
    registerOk ? passed++ : failed++;

    // Test 3: Login
    const token = await testLogin();
    token ? passed++ : failed++;

    // Test 4: Get Events
    const eventsOk = await testGetEvents(token);
    eventsOk ? passed++ : failed++;

    // Test 5: Get Categories
    const categoriesOk = await testGetCategories();
    categoriesOk ? passed++ : failed++;

    // Resumen
    console.log(`\n${colors.blue}========================================${colors.reset}`);
    console.log(`${colors.blue}  Resumen de Pruebas${colors.reset}`);
    console.log(`${colors.blue}========================================${colors.reset}`);
    console.log(`${colors.green}  Exitosas: ${passed}${colors.reset}`);
    console.log(`${colors.red}  Fallidas: ${failed}${colors.reset}`);
    
    if (failed === 0) {
        console.log(`\n${colors.green}✓ ¡Todas las pruebas pasaron! La API está funcionando correctamente.${colors.reset}`);
    } else {
        console.log(`\n${colors.yellow}⚠ Algunas pruebas fallaron. Revisa los mensajes de error arriba.${colors.reset}`);
    }
    
    console.log(`\n${colors.blue}Para más información, consulta VERIFICATION_GUIDE.md${colors.reset}\n`);
}

// Ejecutar pruebas
runTests().catch(console.error);
