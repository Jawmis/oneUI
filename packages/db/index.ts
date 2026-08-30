import mongoose, { Mongoose } from 'mongoose';

export const Workspace = new mongoose.Schema({
    path: String,
    name: String,
    // there is an id by default
})
export const Session = new mongoose.Schema({
    conversation: [Object],
    workspaceId : [{type : mongoose.Schema.Types.ObjectId, ref : 'Workspace'}]
})

export const SessionModel = mongoose.model("Session", Workspace);
export const WorkspaceModel = mongoose.model("Workspace", Workspace);