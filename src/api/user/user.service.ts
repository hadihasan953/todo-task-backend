import bcrypt from 'bcrypt';
import User from './user.model';
import { UniqueConstraintError } from 'sequelize';

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

            if (userId) {
                // If caller provided an id, use it
                payload.id = userId;
            } else {
                // Compute smallest missing positive integer id
                const rows = await User.findAll({ attributes: ['id'], order: [['id', 'ASC']] });
                const idList = rows.map(r => (r.get('id') as number)).filter(Boolean).sort((a, b) => a - b);
                let nextId = 1;
                for (const id of idList) {
                    if (id === nextId) {
                        nextId++;
                    } else if (id > nextId) {
                        break;
                    }
                }
                payload.id = nextId;
            }

            // Try creating the user; if id conflict occurs (concurrent insert), recompute and retry a few times
            const maxAttempts = 3;
            let attempt = 0;
            let user;
            while (attempt < maxAttempts) {
                try {
                    user = await User.create(payload);
                    break;
                } catch (err) {
                    if (err instanceof UniqueConstraintError && !userId) {
                        // Recompute gap and retry
                        attempt++;
                        const rows2 = await User.findAll({ attributes: ['id'], order: [['id', 'ASC']] });
                        const idList2 = rows2.map(r => (r.get('id') as number)).filter(Boolean).sort((a, b) => a - b);
                        let nextId2 = 1;
                        for (const id of idList2) {
                            if (id === nextId2) nextId2++;
                            else if (id > nextId2) break;
                        }
                        payload.id = nextId2;
                        continue;
                    }
                    throw err;
                }
            }

            if (!user) {
                throw new Error('Could not create user after retries.');
            }

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