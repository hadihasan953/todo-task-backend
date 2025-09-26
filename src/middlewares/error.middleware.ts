import { Request, Response, NextFunction } from 'express';

// Centralized error handler - converts thrown errors into JSON responses
export default function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    // Default to internal server error
    let statusCode = 500;
    let message = 'Internal Server Error';

    // Normalize common error shapes/messages coming from services and Sequelize
    const name = err?.name;
    const errMessage = String(err?.message || err || '');

    // Validation-like errors
    if (/required|Invalid|invalid|must be at least|Password must|Name, email and password/i.test(errMessage)) {
        statusCode = 400;
        message = errMessage || 'Bad Request';
    }

    // Conflict / unique constraint
    else if (/exists|already exists|unique|SequelizeUniqueConstraintError/i.test(name + ' ' + errMessage)) {
        statusCode = 409;
        message = errMessage || 'Conflict';
    }

    // Authentication/authorization errors emitted manually with explicit status
    else if (err?.status && Number.isInteger(err.status)) {
        statusCode = err.status;
        message = errMessage || message;
    }

    // Provide stack trace in development for easier debugging
    const payload: any = {
        status: statusCode >= 500 ? 'error' : 'fail',
        statusCode,
        message,
    };

    if (process.env.NODE_ENV !== 'production') {
        payload.error = { name, message: errMessage, stack: err?.stack };
    }

    // Log the error server-side so users don't have to paste entire stacks
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);

    res.status(statusCode).json(payload);
}
