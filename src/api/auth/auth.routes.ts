import { Router } from "express";
import AuthController from "./auth.controller";

export default class AuthRouter {
    private router: Router;
    private authController: AuthController;

    constructor() {
        this.router = Router();
        this.authController = new AuthController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            "/login",
            this.authController.login
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}
