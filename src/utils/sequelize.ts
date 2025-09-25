import { Sequelize } from 'sequelize';

// Update these values with your actual database credentials
const sequelize = new Sequelize('database_name', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql',
});

export default sequelize;