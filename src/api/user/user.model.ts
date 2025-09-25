import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../utils/sequelize';

interface UserAttributes {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    createdBy?: number | null;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'createdBy'>;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
    public role!: string;
    public createdBy?: number | null;

    // timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user',
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, { sequelize, modelName: 'User' });

export default User;
