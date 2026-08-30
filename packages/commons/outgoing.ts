import z from 'zod';

export const WorkspaceCreatedSchema = z.object({
    id : z.string(),
})

export type WorkspaceCreatedSchemaType = z.infer<typeof WorkspaceCreatedSchema>


export const SessionCreated = z.object({ 
    id : z.string(),
})

export type SessionCreatedType = z.infer<typeof SessionCreated>;

export const MessageAdded = z.object({
    id: z.string(),
})

export type MessageAddedType = z.infer<typeof MessageAdded>

export type OutgoingMessageType =  {
    type : "session-created",
    payload : SessionCreatedType
} | {
    type : "workspace-created",
    payload : WorkspaceCreatedSchemaType
} | {
    type : "message-added",
    payload : MessageAddedType
};

