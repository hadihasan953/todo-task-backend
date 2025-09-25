import { Router } from "express";
import TaskController from "./task.controller";
import { authorize } from "../../middlewares/auth.middleware";

export default class TaskRouter {
    private router: Router;
    private taskController: TaskController;

    constructor() {
        this.router = Router();
        this.taskController = new TaskController();
        this.initializeRoutes();
    }
    private initializeRoutes() {
        // Get all tasks - for both users and admins
        this.router.get(
            "/get",
            authorize,
            this.taskController.getTasks
        )

        // Create new task - for both users and admins
        this.router.post(
            "/create",
            authorize,
            this.taskController.createTask
        )

        // Update a task - for both users and admins
        this.router.put(
            "/update/:id",
            authorize,
            this.taskController.updateTask
        )

        // Delete a task - for both users and admins
        this.router.delete(
            "/delete/:id",
            authorize,
            this.taskController.deleteTask
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}