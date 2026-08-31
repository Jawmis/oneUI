import mongoose, { Mongoose } from 'mongoose';

export const Workspace = new mongoose.Schema({
    path: String,
    name: String,
    // there is an id by default
})
export const Session = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant']  
    },
    conversation: [Object],
    workspace : {type : mongoose.Schema.Types.ObjectId, ref : 'Workspace'}
})

export const SessionModel = mongoose.model("Session", Session);
export const WorkspaceModel = mongoose.model("Workspace", Workspace);
