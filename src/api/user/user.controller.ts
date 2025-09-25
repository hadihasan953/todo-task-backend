import { Request, Response, NextFunction } from 'express';
import UserService from './user.service';
import sequelize from '../../utils/sequelize';

export default class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
        this.registerUser = this.registerUser.bind(this);
        this.getAllUsers = this.getAllUsers.bind(this);
    }

    // Admin-only registration
    async registerUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'Name, email, and password are required.' });
            }
            req.body.createdBy = req.user?.id;
            const result = await this.userService.registerUser(req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    // Admin-only user listing
    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.getAllUsers();
            // Exclude the current admin and other admins
            const filteredUsers = users.filter((user: any) => user.id !== req.user?.id && user.role !== 'admin');
            res.status(200).json(filteredUsers);
        } catch (error) {
            next(error);
        }
    }
}
