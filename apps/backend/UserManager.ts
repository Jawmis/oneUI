import { uuid } from "uuidv4"
import { WebSocket } from "ws";
import { User } from "./User";



export class UserManager {
    private users: User[];
    private static instance: UserManager;
    private constructor() {
        this.users = [];
    }

    static getInstance(): UserManager {
        if (UserManager.instance) {
            return UserManager.instance;
        }
        UserManager.instance = new UserManager();
        return UserManager.instance;
    }

    addUser(ws: WebSocket) {
        const id = uuid()
        const user = new User(id, ws);
        this.users.push(user);
        ws.on("message", (msg) => {
            try {
                const parsedMessage = JSON.parse(msg.toString());
                user.handleIncomingMessage(parsedMessage);

            } catch (e) {
                console.error(`User sent non JSON format input`);
                console.log(msg.toString());
            }
        })

        ws.on("close", () => {
            this.users = this.users.filter(x => x.id != id);
        })
    }

}