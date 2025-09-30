import { Router } from 'express';
import { authorize, authorizeAdmin } from '../../middlewares/auth.middleware';
import UserController from './user.controller';

export default class UserRouter {
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

        // All authenticated users can fetch user list
        this.router.get(
            "/users",
            authorize,
            this.userController.getAllUsers
        );
    }
    public getRouter(): Router {
        return this.router;
    }
}