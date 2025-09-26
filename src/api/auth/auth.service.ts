import { generateAccessToken } from "../../utils/generateToken";
import bcrypt from 'bcrypt';
import User from "../user/user.model";

export default class AuthService {

    public async login(email: string, password: string) {
        try {
            const user = await User.findOne({
                where: {
                    email
                }
            });

            if (!user) {
                throw new Error('Invalid email or password');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }

            const token = generateAccessToken(user.id, user.role);

            const plainUser = user.get({ plain: true });
            const { password: _, ...userWithoutPassword } = plainUser;

            return { user: userWithoutPassword, token };

        } catch (error) {
            throw new Error('Error during login: ' + (error as Error).message);
        }
    }
}