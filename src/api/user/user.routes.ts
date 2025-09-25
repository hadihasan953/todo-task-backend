import { Router } from 'express';
import TaskController from './user.controller';

export default class TaskRouter {
    private router: Router
    private taskController: TaskController

    constructor() {
        this.router = Router();
        this.taskController = new TaskController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            "/create",
            this.taskController.createTask
        )
        this.router.post(
            "/get",
            this.taskController.getUser
        )
        this.router.put(
            "/update",
            this.taskController.updateUser
        )
        this.router.delete(
            "/delete",
            this.taskController.deleteUser
        )
        this.router.post(
            "/tasks",
            this.taskController.getUserTasks
        )
    }
    public getRouter(): Router {
        return this.router;
    }
}