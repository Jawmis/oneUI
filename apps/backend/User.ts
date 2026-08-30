import { CreateWorkspaceSchema, type IncomingMessageType, type OutgoingMessageType } from "commons/types";
import { WorkspaceModel } from "db/client";
import { WebSocket } from "ws";

export class User{
    private socket: WebSocket;
    public id: string;
    constructor(id : string, socket: WebSocket) {
        this.socket = socket;
        this.id = id; 
    }

    async handleIncomingMessage(msg: IncomingMessageType) : Promise<OutgoingMessageType | undefined>{
        if (msg.type === 'create-workspace') {
            const { success, data } = CreateWorkspaceSchema.safeParse(msg.payload);
            if (!success) { return; }
        
            const workspace = await WorkspaceModel.create({
                path: data.path, // /Users/Hamid/Projects/Quicky
                name : data.path.split("/").pop()
            })

            return {
                type: "workspace-created",
                payload: {
                    id: workspace._id.toString()
                }
            }
            
        
        }

        return;
    }
}
