import { DataTypes, Model } from 'sequelize';
import sequelize from '../../utils/sequelize';

class TaskAssignment extends Model {
    public user_id!: number;
    public task_id!: number;
}

TaskAssignment.init(
    {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        task_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'tasks',
                key: 'id',
            },
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Whether the assigned user has completed the task',
        },
    },
    {
        sequelize,
        modelName: 'TaskAssignment',
        tableName: 'user_tasks',
        timestamps: false,
    }
);

export default TaskAssignment;
