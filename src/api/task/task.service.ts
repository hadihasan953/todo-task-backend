import Task from './task.model';
import TaskAssignment from '../user_tasks/userTask.model';
import { UniqueConstraintError, Op } from 'sequelize';

export default class TaskService {
    public async getTasks(id: number, role: string) {
        const userId = id;
        const userRole = role;
        try {
            let tasks;
            if (userRole === 'admin') {
                tasks = await Task.findAll();
            } else {
                // Find task IDs assigned to this user
                const assignments = await TaskAssignment.findAll({ where: { user_id: userId } });
                const assignedTaskIds = assignments.map(a => a.task_id);

                tasks = await Task.findAll({
                    where: {
                        [Op.or]: [
                            { createdBy: userId },
                            assignedTaskIds.length > 0 ? { id: { [Op.in]: assignedTaskIds } } : {}
                        ]
                    }
                });
            }
            return tasks;
        } catch (error) {
            throw new Error('Error fetching tasks: ' + (error as Error).message);
        }
    }

    public async createTask(id: number, title: string, description: string, assignedUserIds?: number[]) {
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

            // Assign users if provided
            if (assignedUserIds && Array.isArray(assignedUserIds) && assignedUserIds.length > 0) {
                // Remove duplicates
                const uniqueUserIds = Array.from(new Set(assignedUserIds));
                await TaskAssignment.bulkCreate(
                    uniqueUserIds.map(user_id => ({ task_id: task.id, user_id })),
                    { ignoreDuplicates: true }
                );
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
            const TaskAssignment = require('../user_tasks/userTask.model').default;
            let allowedFields: string[] = [];
            let isAssigned = false;
            const assignment = await TaskAssignment.findOne({ where: { user_id: userId, task_id: taskID } });
            if (assignment) isAssigned = true;

            if (userRole === 'admin') {
                allowedFields = ['title', 'description', 'status'];
            } else if (taskOwner === userId || isAssigned) {
                allowedFields = ['status'];
            } else {
                throw new Error('Unauthorized to update this task');
            }

            // Filter updates to only allowed fields
            const filteredUpdates: any = {};
            for (const key of allowedFields) {
                if (updates.hasOwnProperty(key)) {
                    filteredUpdates[key] = updates[key];
                }
            }
            if (Object.keys(filteredUpdates).length === 0) {
                throw new Error('No valid fields to update');
            }

            // Special logic for status update to 'completed'
            if (filteredUpdates.status === 'completed') {
                if (userRole === 'admin' || taskOwner === userId) {
                    // Admin or creator: mark task and all assignments as complete
                    await task.update({ status: 'completed', ...filteredUpdates });
                    await TaskAssignment.update(
                        { completed: true },
                        { where: { task_id: taskID } }
                    );
                } else if (isAssigned) {
                    // Assigned user: mark only their assignment as complete
                    await TaskAssignment.update(
                        { completed: true },
                        { where: { task_id: taskID, user_id: userId } }
                    );
                    // Check if all assigned users have completed
                    const totalAssignments = await TaskAssignment.count({ where: { task_id: taskID } });
                    const completedAssignments = await TaskAssignment.count({ where: { task_id: taskID, completed: true } });
                    if (totalAssignments > 0 && totalAssignments === completedAssignments) {
                        await task.update({ status: 'completed' });
                    }
                }
                // If not admin/creator/assigned, error already thrown above
                return task;
            } else {
                // Normal update (title/description/status not 'completed')
                await task.update(filteredUpdates);
                return task;
            }
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

    public async assignUsersToTask(taskId: number, userIds: number[]) {
        // Remove duplicates
        const uniqueUserIds = Array.from(new Set(userIds));
        // Bulk create assignments with correct column names
        await TaskAssignment.bulkCreate(
            uniqueUserIds.map(user_id => ({ task_id: taskId, user_id })),
            { ignoreDuplicates: true }
        );
        return { status: 'success', message: 'Users assigned to task.' };
    }
}