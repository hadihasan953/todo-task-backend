import sequelize from './sequelize';
import { createDatabaseIfNotExists } from './database';
import User from '../api/user/user.model';
import Task from '../api/task/task.model';
import bcrypt from 'bcrypt';


// Initialize model associations
export async function initializeAssociations() {
    User.hasMany(Task, { foreignKey: 'createdBy', as: 'tasks', onDelete: 'CASCADE' });
    Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator', onDelete: 'CASCADE' });

    User.belongsToMany(Task, { through: 'user_tasks', foreignKey: 'user_id', otherKey: 'task_id', as: 'assignedTasks', timestamps: false });
    Task.belongsToMany(User, { through: 'user_tasks', foreignKey: 'task_id', otherKey: 'user_id', as: 'assignees', timestamps: false });

    console.log('✅ Model associations initialized');
}

// Create default admin user if none exists
export async function createDefaultAdmin() {
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('ad1234', 10);
        await User.create({
            name: 'Admin User',
            email: 'admin@todoapp.com',
            password: hashedPassword,
            role: 'admin',
            createdBy: null
        });
        console.log('✅ Default admin user created');
    } else {
        console.log('ℹ️ Admin user already exists');
    }
}

// Create sample data if none exists
export async function createSampleData() {
    const taskCount = await Task.count();
    if (taskCount > 0) {
        console.log('ℹ️ Sample data already exists');
        return;
    }
    let admin = await User.findOne({ where: { role: 'admin' } }) as User & { id: number };
    if (!admin) {
        // Create admin if not exists
        const hashedPassword = await bcrypt.hash('ad1234', 10);
        await User.create({
            name: 'Admin User',
            email: 'admin@todoapp.com',
            password: hashedPassword,
            role: 'admin',
            createdBy: null
        });// Create admin user
        admin = await User.findOne({ where: { role: 'admin' } }) as User & { id: number };
    }// Now admin is guaranteed to exist
    if (!admin || typeof admin.id !== 'number') return console.log('⚠️ No admin user found');
    const sampleTasks = [
        { title: 'Setup Development Environment', description: 'Configure Node.js, Express, and database', status: 'completed', createdBy: admin.id },
        { title: 'Create User Authentication', description: 'Login, registration, password management', status: 'in-progress', createdBy: admin.id },
        { title: 'Design Task Management UI', description: 'UI for creating/editing tasks', status: 'pending', createdBy: admin.id }
    ];
    for (const t of sampleTasks) await Task.create(t);
    console.log('✅ Sample tasks created successfully');
}// Main initialization function

export async function initializeDatabase() {
    try {
        await createDatabaseIfNotExists();
        await sequelize.authenticate();

        // Ensure model associations are set before syncing so Sequelize can create proper FKs/indexes once.
        await initializeAssociations();

        await sequelize.sync();

        await createDefaultAdmin();
        // await createSampleData();
        console.log('🎉 Database initialization completed!');
        return true;
    } catch (error) {
        console.error('💥 Database initialization failed:', error);
        return false;
    }
}

if (require.main === module) {
    initializeDatabase().then(success => process.exit(success ? 0 : 1));
}
