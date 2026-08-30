import { AddMessageSchema, CreateSessionSchema, CreateWorkspaceSchema, type IncomingMessageType, type OutgoingMessageType } from "commons/types";
import { Session, SessionModel, WorkspaceModel } from "db/client";
import { WebSocket } from "ws";

export class User{
    private socket: WebSocket;
    public id: string;

    constructor(id: string, socket: WebSocket) {
        this.socket = socket;
        this.id = id; 
    }

    async sendMessage(payload: OutgoingMessageType) {
        this.socket.send(JSON.stringify(payload));        
    }

    async handleIncomingMessage(msg: IncomingMessageType) : Promise<OutgoingMessageType>{
        if (msg.type === 'create-workspace') {
            const { success, data } = CreateWorkspaceSchema.safeParse(msg);
            if (!success) {
                throw new Error("Incorrect Schema");
            }
        
            const workspace = await WorkspaceModel.create({
                path: data.path, // /Users/Hamid/Projects/Quicky
                name : data.path.split("/").pop()
            })

            return {
                type : "workspace-created",
                payload : {id : workspace._id.toString()}
            }
            
        
        }
        if (msg.type === 'create-session') {
            const { success, data } = CreateSessionSchema.safeParse(msg);
            if (!success) {
                throw new Error("Incorrect Schema");
            }
        
            const session = await SessionModel.create({
                workspaceId:  data.workspaceId
                ,
                conversation : []
            })

            return {
                type : "session-created",
               payload : { id : session._id.toString()}
            }
            
        
        }
        if (msg.type === 'add-message') {
            const { success, data } = AddMessageSchema.safeParse(msg);
            if (!success) {
                throw new Error("Incorrect Schema");
            }
        
            const workspace = await SessionModel.updateOne({
                    id: data.sessionId
                },{ 
                conversation: {
                    $push: {
                        type: "user",
                        payload: {
                        message : data.message 
                        }
                    }
                }
            })

            return {
                type: "message-added",
                payload: { id: "1" }
            }
        }
        throw new Error("Incorrect input schema");

    }
}