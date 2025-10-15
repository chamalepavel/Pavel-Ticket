import app from './app.js';
import dotenv from 'dotenv';
import { sequelize } from './models/index.model.js';

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 8080;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        await sequelize.sync({ alter: true });

        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });
    } catch (err) {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    }
}

startServer();
