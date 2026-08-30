console.log("this the websocket server");

import { WebSocketServer } from 'ws';
import mongoose from 'mongoose';
import { Workspace, WorkspaceModel } from 'db/client';
import { CreateWorkspaceSchema } from 'commons/types';
import { UserManager } from './UserManager';


mongoose.connect(process.env.DB_URL!)
    .then(() => {
        console.log("mongoose connected");
        const server = new WebSocketServer({
            port: 3000
        });

        server.on("connection", (ws) => {
            console.log("ws connection done");
            UserManager.getInstance().addUser(ws);
        
        })
    })
    .catch(e => {
        console.log(e);
    });

