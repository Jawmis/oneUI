import mongoose from 'mongoose';

export const Workspace = new mongoose.Schema({
    path: { type: String, required: true, trim: true },
    name: { type: String, required: true },
}, { timestamps: true });
export const Session = new mongoose.Schema({
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    title: { type: String, default: 'New session' },
    conversation: { type: [mongoose.Schema.Types.Mixed], default: [] },
    agentSessionId: { type: String, default: undefined },
}, { timestamps: true });

export const SessionModel = mongoose.model("Session", Session);
export const WorkspaceModel = mongoose.model("Workspace", Workspace);
