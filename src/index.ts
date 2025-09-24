import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app: Express = express();

const allowedOrigins = [
    'http://localhost::5500'
]

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

const port = process.env.PORT || 3000;
const prefix = process.env.PREFIX || 'api/';
const version = process.env.VERSION || 'v1/';

app.listen(port, () => {
    console.log(`Server is running on: http://localhost:${port}/${prefix}${version}`); // http://localhost:3000/api/v1/
});