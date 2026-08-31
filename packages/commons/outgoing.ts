import z from 'zod';

export const WorkspaceCreatedSchema = z.object({ id: z.string(), name: z.string(), path: z.string(), sessions: z.array(z.any()) })

export type WorkspaceCreatedSchemaType = z.infer<typeof WorkspaceCreatedSchema>


export const SessionCreated = z.object({ id: z.string(), title: z.string(), messages: z.array(z.any()) })

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
} | {
    type : "init"
    payload: { workspaces: Workspace[] }
} | {
    type: "thinking" | "tool" | "result" | "error"
    payload: { sessionId: string; [key: string]: unknown }
} | {
    type: "session-deleted" | "workspace-deleted"
    payload: { id: string }
};

export type Workspace = {
    id: string,
    name: string,
    path: string,
    sessions : Session []
}

export type Session  = {
    id: string,
    title: string,
    messages : Message[]
}
export type Message = {
    id: string,
    type: "user" | "thinking" | "tool" | "result",
    payload: Record<string, unknown> & { message?: string }
} | {
    id: string,
    type: "assistant",
    payload: Record<string, unknown> & { message?: string }
}
