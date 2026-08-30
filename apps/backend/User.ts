import {
    AddMessageSchema,
    CreateSessionSchema,
    CreateWorkspaceSchema,
    type IncomingMessageType,
    type OutgoingMessageType,
} from "commons/types";
import { SessionModel, WorkspaceModel } from "db/client";
import { WebSocket } from "ws";

export class User{
    private socket: WebSocket;
    public id: string;
    constructor(id : string, socket: WebSocket) {
        this.socket = socket;
        this.id = id; 
    }

    sendMessage(message: OutgoingMessageType | undefined) {
        if (message) {
            this.socket.send(JSON.stringify(message));
        }
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

        if (msg.type === 'create-session') {
            const { success, data } = CreateSessionSchema.safeParse(msg.payload);
            if (!success) { return; }

            const session = await SessionModel.create({
                workspaceId: data.workspaceId,
                conversation: [],
            });

            return {
                type: "session-created",
                payload: {
                    id: session._id.toString(),
                },
            };
        }

        if (msg.type === 'add-message') {
            const { success, data } = AddMessageSchema.safeParse(msg.payload);
            if (!success) { return; }

            const session = await SessionModel.findOneAndUpdate(
                { _id: data.sessionId },
                { $push: { conversation: data.message } },
                { new: true },
            );

            if (!session) { return; }

            return {
                type: "message-added",
                payload: {
                    id: session._id.toString(),
                },
            };
        }

        return;
    }
}
