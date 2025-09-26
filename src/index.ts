import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { initializeDatabase } from './utils/initDatabase';

// Import Routes
import AuthRouter from './api/auth/auth.routes';
import TaskRouter from './api/task/task.routes';
import UserRouter from './api/user/user.routes';

// Centralized error handler
import errorHandler from './middlewares/error.middleware';

dotenv.config();

const app: Express = express();

const allowedOrigins = [
    'http://localhost:5500'
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

const port = process.env.PORT || 3000;
const prefix = process.env.PREFIX || 'api/';
const version = process.env.VERSION || 'v1';

const baseUrl = `/${prefix}${version}`;

// Health Check - used to check if the server is running
app.get(`${baseUrl}/health`, (_req: Request, res: Response) => {
    res.json({
        status: 'success',
        statusCode: 200,
        message: 'Server is running fine',
    });
});

// Auth Routes
const authRouter = new AuthRouter();
app.use(`${baseUrl}/auth`, authRouter.getRouter());


// Task routes
const taskRouter = new TaskRouter();
app.use(`${baseUrl}/task`, taskRouter.getRouter());

// User routes
const userRouter = new UserRouter();
app.use(`${baseUrl}/user`, userRouter.getRouter());


// 404 - Must be below all other routes
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        status: 'fail',
        statusCode: 404,
        message: 'Route not found',
    });
});

// Centralized error handling (must come after routes/404)
app.use(errorHandler);

app.listen(port, () => {
    // Test DB connection on startup
    initializeDatabase().then(success => {
        if (success) {
            console.log('Database connected successfully');
        } else {
            console.log('Database connection failed');
        }
    });
    console.log(`Server is running on: http://localhost:${port}${baseUrl}`); // http://localhost:3000/api/v1/
});