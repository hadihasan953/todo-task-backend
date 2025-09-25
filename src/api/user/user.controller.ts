import { Request, Response, NextFunction } from 'express';
import UserService from './user.service';
import sequelize from '../../utils/sequelize';

export default class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
        this.createTask = this.createTask.bind(this);
        this.createUser = this.createUser.bind(this);
        this.getUser = this.getUser.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.assignTaskToUser = this.assignTaskToUser.bind(this);
        this.getUserTasks = this.getUserTasks.bind(this);
        this.getUsers = this.getUsers.bind(this);
    }
    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.userService.getUsers();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async createTask(req: Request, res: Response, next: NextFunction) {
        try {
            const { taskData } = req.body;
            const result = await this.userService.createTask(taskData);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            // Only admin can create user
            const result = await this.userService.createUser(req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.body;
            const result = await this.userService.getUser(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, updates } = req.body;
            const result = await this.userService.updateUser(id, updates);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.body;
            const result = await this.userService.deleteUser(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async assignTaskToUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, taskId } = req.body;
            const result = await this.userService.assignTaskToUser(userId, taskId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getUserTasks(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.body;
            const result = await this.userService.getUserTasks(userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
