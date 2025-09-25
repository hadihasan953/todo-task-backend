import { Router } from "express";
import TaskController from "./task.controller";

export default class TaskRouter {
    private router: Router;
    private taskController: TaskController;

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
        this.router.get(
            "/get",
            this.taskController.getTask
        )
        this.router.put(
            "/update",
            this.taskController.updateTask
        )
        this.router.delete(
            "/delete",
            this.taskController.deleteTask
        )
    }
    public getRouter(): Router {
        return this.router;
    }
}