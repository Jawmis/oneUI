import { uuid } from "uuidv4"
import { WebSocket } from "ws";
import { User } from "./User";
import { SessionModel, WorkspaceModel } from "db/client";
import type { Workspace } from "commons/types";



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

    async addUser(ws: WebSocket) {
        const id = uuid()
        const user = new User(id, ws);
        this.users.push(user);

        // make a quick db call at this line
        const workspaces = await WorkspaceModel.find();
        const sessions = await SessionModel.find();

        const response: Workspace[] = [];

        for (const w of workspaces) {
            response.push({
                id: w._id.toString(),
                name: w.name ?? "",
                path: w.path ?? "",
                sessions: []
            })

            for (const s of sessions) {
                if (s.workspaceId?.toString() === w._id.toString()) {
                    
                }
            }
        }
            

        ws.send(JSON.stringify({
            type: "init", 
            workspaces : response
        }))

        ws.on("message", async (msg) => {
            try {
                const parsedMessage = JSON.parse(msg.toString());
                const responsePayload = await user.handleIncomingMessage(parsedMessage);
                user.sendMessage(responsePayload);

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
