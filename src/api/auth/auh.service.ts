export default class AuthService {

    public async login(loginData: string, password: string) {
        // TODO: Implement login logic here
        return {
            status: "success",
            message: "User logged in successfully"
        }
    }
}