import Task from './task.model';

export default class TaskService {
    public async getTasks(id: number, role: string) {
        const userId = id;
        const userRole = role;
        // TODO
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
        // TODO
    }

    public async deleteTask(id: string) {
        // TODO
    }
}