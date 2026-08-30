import type { IncomingMessageType } from "commons/types";
import { WebSocket } from "ws";

export class User{
    private socket: WebSocket;
    public id: String;
    constructor(id : String, socket: WebSocket) {
        this.socket = socket;
        this.id = id; 
    }

    handleIncomingMessage(msg: IncomingMessageType) {
        
    }
}