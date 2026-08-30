console.log("this the websocket server");

import { WebSocketServer } from 'ws';
import mongoose from 'mongoose';
import { Workspace, WorkspaceModel } from 'db/client';
import { CreateWorkspaceSchema } from 'commons/types';
import { UserManager } from './UserManager';


mongoose.connect(process.env.DB_URL!)
    .then(() => {

        server.on("connection", (ws) => {
            UserManager.getInstance().addUser(ws);
        
        })
    })
    .catch(e => {
        console.log(e);
    });

const server = new WebSocketServer({
    port: 3000
});
