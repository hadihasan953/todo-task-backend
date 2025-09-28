import bcrypt from 'bcrypt';
import User from './user.model';

export default class UserService {
    // Admin-only registration
    public async registerUser(userData: any) {
        const { id: userId, name, email, password } = userData || {};

        if (!name || !email || !password) {
            throw new Error('Name, email and password are required.');
        }

        try {
            const normalizedEmail = String(email).trim().toLowerCase();
            const existing = await User.findOne({ where: { email: normalizedEmail } });
            if (existing) {
                throw new Error('A user with that email already exists.');
            }

            const hashed = await bcrypt.hash(password, 10);
            const payload: any = {
                name,
                email: normalizedEmail,
                password: hashed
            };
            if (userId) payload.id = userId;

            const user = await User.create(payload);
            const plainUser = user.get({ plain: true });
            const { password: _, ...userWithoutPassword } = plainUser;
            return userWithoutPassword;
        } catch (error) {
            throw new Error('Error registering user: ' + (error as Error).message);
        }
    }

    // Admin-only user listing
    public async getAllUsers() {
        try {
            const users = await User.findAll();
            return users.map(u => {
                const plain = u.get({ plain: true });
                const { password: _, ...userWithoutPassword } = plain;
                return userWithoutPassword;
            });
        } catch (error) {
            throw new Error('Error fetching users: ' + (error as Error).message);
        }
    }
}