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
            const result = await this.authService.login(email, password);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}