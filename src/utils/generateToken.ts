import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET as string;

// Helper function to generate JWT access token
// params: user id and role
export const generateAccessToken = (id: number, role: string): string => {
    const payload = { id, role }; // payload contains user id and role

    const accessToken = jwt.sign(
        payload,
        SECRET_KEY, {
        expiresIn: '1h'
    }); // sign the token with secret key and set expiration time

    return accessToken; // return the generated token
};