import bcrypt from 'bcryptjs';
import { sequelize, Role, Category, User, Event } from '../models/index.model.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Sync database (create tables)
        await sequelize.sync({ force: true });
        console.log('✅ Database synced');

        // Seed Roles (Only User and Admin)
        console.log('📝 Seeding roles...');
        const roles = await Role.bulkCreate([
            { name: 'user', description: 'Regular user with basic permissions' },
            { name: 'admin', description: 'Full system access and administration - Can create and manage everything' }
        ]);
        console.log('✅ Roles seeded');

        // Seed Categories
        console.log('📝 Seeding categories...');
        const categories = await Category.bulkCreate([
            { name: 'Conciertos', description: 'Eventos musicales y conciertos en vivo' },
            { name: 'Deportes', description: 'Eventos deportivos y competencias' },
            { name: 'Tecnología', description: 'Conferencias y eventos tecnológicos' },
            { name: 'Arte y Cultura', description: 'Exposiciones, teatro y eventos culturales' },
            { name: 'Educación', description: 'Talleres, seminarios y cursos' },
            { name: 'Networking', description: 'Eventos de networking profesional' }
        ]);
        console.log('✅ Categories seeded');

        // Seed Users
        console.log('📝 Seeding users...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        const users = await User.bulkCreate([
            {
                name: 'Administrador',
                email: 'admin@eventmanager.com',
                password: hashedPassword,
                phone: '+502 1234-5678',
                role_id: roles.find(r => r.name === 'admin').role_id
            },
            {
                name: 'Juan Pérez',
                email: 'juan@example.com',
                password: hashedPassword,
                phone: '+502 3456-7890',
                role_id: roles.find(r => r.name === 'user').role_id
            },
            {
                name: 'María González',
                email: 'maria@example.com',
                password: hashedPassword,
                phone: '+502 4567-8901',
                role_id: roles.find(r => r.name === 'user').role_id
            },
            {
                name: 'Carlos López',
                email: 'carlos@example.com',
                password: hashedPassword,
                phone: '+502 5678-9012',
                role_id: roles.find(r => r.name === 'user').role_id
            }
        ]);
        console.log('✅ Users seeded');

        // Seed Events (created by admin)
        console.log('📝 Seeding events...');
        const adminId = users.find(u => u.email === 'admin@eventmanager.com').userid;
        
        await Event.bulkCreate([
            {
                title: 'Festival de Música Electrónica 2025',
                description: 'El festival más grande de música electrónica en Guatemala. Con DJs internacionales y locales.',
                event_date: new Date('2025-12-15T20:00:00'),
                location: 'Oakland Mall, Guatemala City',
                capacity: 500,
                category_id: categories.find(c => c.name === 'Conciertos').category_id,
                price: 250.00,
                is_featured: true,
                organizer_id: adminId
            },
            {
                title: 'Tech Summit Guatemala 2025',
                description: 'Conferencia tecnológica con expertos de la industria. Networking, talleres y charlas inspiradoras.',
                event_date: new Date('2025-11-20T09:00:00'),
                location: 'Hotel Westin Camino Real, Guatemala',
                capacity: 300,
                category_id: categories.find(c => c.name === 'Tecnología').category_id,
                price: 150.00,
                is_featured: true,
                organizer_id: adminId
            },
            {
                title: 'Maratón Ciudad de Guatemala',
                description: 'Maratón anual 10K y 21K. Categorías para todas las edades.',
                event_date: new Date('2025-10-05T06:00:00'),
                location: 'Plaza de la Constitución, Guatemala',
                capacity: 1000,
                category_id: categories.find(c => c.name === 'Deportes').category_id,
                price: 75.00,
                is_featured: true,
                organizer_id: adminId
            },
            {
                title: 'Exposición de Arte Contemporáneo',
                description: 'Exhibición de artistas guatemaltecos emergentes. Entrada gratuita.',
                event_date: new Date('2025-11-10T10:00:00'),
                location: 'Museo Nacional de Arte Moderno',
                capacity: 200,
                category_id: categories.find(c => c.name === 'Arte y Cultura').category_id,
                price: 0.00,
                is_featured: false,
                organizer_id: adminId
            },
            {
                title: 'Workshop: Desarrollo Web con React',
                description: 'Taller intensivo de 2 días sobre React, Next.js y mejores prácticas.',
                event_date: new Date('2025-12-01T14:00:00'),
                location: 'Universidad Galileo, Guatemala',
                capacity: 50,
                category_id: categories.find(c => c.name === 'Educación').category_id,
                price: 300.00,
                is_featured: false,
                organizer_id: adminId
            },
            {
                title: 'Networking Event: Startups Guatemala',
                description: 'Evento de networking para emprendedores y startups. Pitch sessions y mentorías.',
                event_date: new Date('2025-11-25T18:00:00'),
                location: 'Impact Hub Guatemala',
                capacity: 100,
                category_id: categories.find(c => c.name === 'Networking').category_id,
                price: 50.00,
                is_featured: true,
                organizer_id: adminId
            }
        ]);
        console.log('✅ Events seeded');

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📋 Default credentials:');
        console.log('👑 ADMINISTRADOR (Panel completo):');
        console.log('  Email: admin@eventmanager.com');
        console.log('  Password: password123');
        console.log('\n👤 USUARIO (Vista simplificada):');
        console.log('  Email: juan@example.com');
        console.log('  Password: password123\n');
        console.log('✨ Sistema con 2 roles: Admin y Usuario');
        console.log('✨ El Admin tiene acceso al panel de administración completo\n');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
};

seedDatabase();
