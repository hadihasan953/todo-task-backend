import Task from './task.model';

export default class TaskService {
    public async getTasks(id: number, role: string) {
        const userId = id;
        const userRole = role;
        try {
            let tasks;
            if (userRole === 'admin') {
                tasks = await Task.findAll();
            } else {
                tasks = await Task.findAll({
                    where: {
                        createdBy: userId
                    }
                });
            }
            return tasks;
        } catch (error) {
            throw new Error('Error fetching tasks: ' + (error as Error).message);
        }
    }

    public async createTask(id: number, title: string, description: string) {
        const userId = id;
        try {
            const task = await Task.create({
                'title': title,
                'description': description,
                'createdBy': userId
            });

            return task;
        } catch (error) {
            throw new Error('Error creating task: ' + (error as Error).message);
        }
    }

    public async updateTask(id: number, role: string, taskId: number, updates: any) {
        const userId = id;
        const userRole = role;
        const taskID = taskId;
        try {
            const task = await Task.findByPk(taskID);
            if (!task) {
                throw new Error('Task not found');
            }
            const taskOwner = (task as any).createdBy;
            if (userRole !== 'admin' && taskOwner !== userId) {
                throw new Error('Unauthorized to update this task');
            }
            await task.update(updates);
            return task;
        } catch (error) {
            throw new Error('Error updating task: ' + (error as Error).message);
        }
    }

    public async deleteTask(userId: number, role: string, taskId: number) {
        try {
            const task = await Task.findByPk(taskId);
            if (!task) {
                throw new Error('Task not found');
            }
            const taskOwner = (task as any).createdBy;
            if (role !== 'admin' && taskOwner !== userId) {
                throw new Error('Unauthorized to delete this task');
            }
            await task.destroy();
            return {
                status: 'success',
                message: `Task ${taskId} deleted successfully`
            };
        } catch (error) {
            throw new Error('Error deleting task: ' + (error as Error).message);
        }
    }
}