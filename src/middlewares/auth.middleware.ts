import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Extend Express Request interface to include 'user' property
declare module 'express' {
    interface Request {
        user?: JwtPayload;
    }
}

const SECRET_KEY = process.env.JWT_SECRET as string;

// Middleware to verify JWT and authorize user
export const authorize = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']; // get auth header

    if (!authHeader) {
        return res.status(401).json({
            status: 'fail',
            statusCode: 401,
            message: 'Authorization header missing',
        });
    } // check if auth header is present

    const token = authHeader.split(' ')[1]; // Bearer <token> - we need the token part[1]

    try {
        const decoded = jwt.verify(
            token,
            SECRET_KEY
        ) as JwtPayload; // verify token and decode payload

        req.user = decoded; // attach decoded payload to request object

        next(); // proceed to next middleware or route handler
    } catch (error) {
        return res.status(403).json({
            status: 'fail',
            statusCode: 403,
            message: 'Invalid or expired token',
        });
    }
}

// Middleware to check if the user has admin role
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            status: 'fail',
            statusCode: 403,
            message: 'Access denied, admin only',
        });
    } // check if user is admin
    next(); // if yes, proceed to next middleware or route handler
}