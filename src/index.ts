import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app: Express = express();

const allowedOrigins = [
    'http://localhost:5500'
]

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

// 404 - Must be be below all other routes
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        status: 'fail',
        statusCode: 404,
        message: 'Route not found',
    });
});

app.listen(port, () => {
    console.log(`Server is running on: http://localhost:${port}${baseUrl}`); // http://localhost:3000/api/v1/
});