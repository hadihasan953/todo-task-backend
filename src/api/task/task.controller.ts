import { Request, Response, NextFunction } from 'express';
import TaskService from './task.service';
const { authenticateToken } = require('../../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

export default class TaskController {
    private taskService: TaskService;

    constructor() {
        this.taskService = new TaskService();
        this.createTask = this.createTask.bind(this);
    }

    async createTask(req: Request, res: Response, next: NextFunction) {
        try {
            const { taskData } = req.body;
            const result = await this.taskService.createTask(taskData);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async updateTask(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, updates } = req.body;
            const result = await this.taskService.updateTask(id, updates);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async deleteTask(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.body;
            const result = await this.taskService.deleteTask(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getTask(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.body;
            const result = await this.taskService.getTask(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
