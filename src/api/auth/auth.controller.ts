import { Request, Response, NextFunction } from 'express';
import AuthService from './auth.service';

export default class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
        this.login = this.login.bind(this);
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    status: "error",
                    message: "Email and password are required"
                });
            }

            const result = await this.authService.login(email, password);

            res.status(200).json({
                status: "success",
                message: "User logged in successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}