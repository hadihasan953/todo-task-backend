import Task from './task.model';
import { UniqueConstraintError } from 'sequelize';

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
            // compute smallest missing positive integer id (start from 1)
            const rows = await Task.findAll({ attributes: ['id'], order: [['id', 'ASC']] });
            const idList = rows
                .map(r => (r.get('id') as number))
                .filter(Boolean)
                .sort((a, b) => a - b);

            let nextId = 1;
            for (const existingId of idList) {
                if (existingId === nextId) {
                    nextId++;
                } else if (existingId > nextId) {
                    break;
                }
            }

            const payload: any = {
                title,
                description,
                createdBy: userId,
                id: nextId
            };

            // Attempt create; on unique id conflict (concurrent), recompute and retry
            const maxAttempts = 3;
            let attempt = 0;
            let task;
            while (attempt < maxAttempts) {
                try {
                    task = await Task.create(payload);
                    break;
                } catch (err) {
                    if (err instanceof UniqueConstraintError) {
                        attempt++;
                        // recompute gap and retry
                        const rows2 = await Task.findAll({ attributes: ['id'], order: [['id', 'ASC']] });
                        const idList2 = rows2
                            .map(r => (r.get('id') as number))
                            .filter(Boolean)
                            .sort((a, b) => a - b);

                        let nextId2 = 1;
                        for (const existingId2 of idList2) {
                            if (existingId2 === nextId2) nextId2++;
                            else if (existingId2 > nextId2) break;
                        }
                        payload.id = nextId2;
                        continue;
                    }
                    throw err;
                }
            }

            if (!task) {
                throw new Error('Could not create task after retries.');
            }

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