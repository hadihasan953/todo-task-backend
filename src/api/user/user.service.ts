import bcrypt from 'bcrypt';
import { UniqueConstraintError } from 'sequelize';
import User from './user.model';

export default class UserService {
    // Admin-only registration
    public async registerUser(userData: any) {
        // destructure incoming data (safe when userData is undefined/null)
        const { id: userId, name, email, password } = userData || {};

        // basic validation
        if (!name || !email || !password) {
            throw new Error('Name, email and password are required.');
        }

        try {
            // hash password before saving
            const hashed = await bcrypt.hash(password, 10);

            const payload: any = {
                name,
                email,
                password: hashed
            };
            if (userId) {
                payload.id = userId;
            }

            const user = await User.create(payload);
            const plainUser = user.get({ plain: true });
            const { password: _, ...userWithoutPassword } = plainUser;
            return userWithoutPassword;
        } catch (error) {
            if ((error as any) instanceof UniqueConstraintError) {
                // more helpful message for duplicate email (or other unique constraints)
                throw new Error('A user with that email already exists.');
            }
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