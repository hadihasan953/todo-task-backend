import { Request, Response, NextFunction } from 'express';
import TaskService from './task.service';

export default class TaskController {
    private taskService: TaskService;

    constructor() {
        this.taskService = new TaskService();
        // bind all handlers so 'this' remains the controller instance when used by Express
        this.getTasks = this.getTasks.bind(this);
        this.createTask = this.createTask.bind(this);
        this.updateTask = this.updateTask.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
    }

    async getTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, role } = req.user || {};

            if (id === undefined || id === null) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const result = await this.taskService.getTasks(id, role);
            res.status(200).json({
                status: "success",
                message: "Tasks fetched successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async createTask(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('Request user:', req.user);
            const { id } = req.user || {};

            if (id === undefined || id === null) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const { title, description } = req.body;
            const result = await this.taskService.createTask(id, title, description);
            res.status(200).json({
                status: "success",
                message: "Task created successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async updateTask(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, role } = req.user || {};

            if (id === undefined || id === null) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const { id: taskIdParam } = req.params;
            const taskIdInt = parseInt(taskIdParam, 10);
            const { updates } = req.body;
            const result = await this.taskService.updateTask(id, role, taskIdInt, updates);
            res.status(200).json({
                status: "success",
                message: "Task updated successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteTask(req: Request, res: Response, next: NextFunction) {
        try {
            // Use authenticated user info (like other handlers) for authorization
            const { id: userId, role } = req.user || {};
            if (userId === undefined || userId === null) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const { id: taskIdParam } = req.params;
            const taskIdInt = parseInt(taskIdParam, 10);
            if (Number.isNaN(taskIdInt)) {
                return res.status(400).json({ message: 'Invalid task id' });
            }

            const result = await this.taskService.deleteTask(userId, role, taskIdInt);
            res.status(200).json({
                status: "success",
                message: "Task deleted successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}
