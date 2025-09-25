import { Router } from 'express';
import { authorize, authorizeAdmin } from '../../middlewares/auth.middleware';
import UserController from './user.controller';

export default class TaskRouter {
    private router: Router
    private userController: UserController

    constructor() {
        this.router = Router();
        this.userController = new UserController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Admin-only registration
        this.router.post(
            "/register",
            authorize,
            authorizeAdmin,
            this.userController.registerUser
        );

        // Admin-only user listing
        this.router.get(
            "/users",
            authorize,
            authorizeAdmin,
            this.userController.getAllUsers
        );
    }
    public getRouter(): Router {
        return this.router;
    }
}