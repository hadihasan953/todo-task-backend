import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('database_name', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
});

export default sequelize;