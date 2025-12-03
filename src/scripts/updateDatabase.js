import { sequelize, Event, TicketType, PromoCode, Registration } from '../models/index.model.js';

async function updateDatabase() {
    try {
        console.log('🔄 Iniciando actualización de base de datos...');

        // Sincronizar modelos con la base de datos
        // alter: true modificará las tablas existentes sin eliminar datos
        await sequelize.sync({ alter: true });

        console.log('✅ Base de datos actualizada exitosamente!');
        console.log('\n📊 Tablas creadas/actualizadas:');
        console.log('  - events (campos adicionales agregados)');
        console.log('  - registrations (campos adicionales agregados)');
        console.log('  - ticket_types (nueva tabla)');
        console.log('  - promo_codes (nueva tabla)');

        console.log('\n🎯 Nuevas funcionalidades disponibles:');
        console.log('  ✓ Sistema de tickets multinivel');
        console.log('  ✓ Gestión de precios y promociones');
        console.log('  ✓ Información de ubicación detallada');
        console.log('  ✓ Códigos promocionales');
        console.log('  ✓ Sistema de check-in con QR');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al actualizar la base de datos:', error);
        process.exit(1);
    }
}

updateDatabase();
