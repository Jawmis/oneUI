import { AddMessageSchema, CreateSessionSchema, CreateWorkspaceSchema, type IncomingMessageType, type OutgoingMessageType } from "commons/types";
import { SessionModel, WorkspaceModel } from "db/client";
import { WebSocket } from "ws";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { GoogleGenAI } from "@google/genai";

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
            const { success, data } = CreateWorkspaceSchema.safeParse(msg.payload);
            if (!success) {
                throw new Error("Incorrect Schema");
            }
        
            const workspace = await WorkspaceModel.create({
                path: data.path, // /Users/Hamid/Projects/Quicky
                name : data.path.split("/").pop()
            })

            return { type: "workspace-created", payload: { id: workspace._id.toString(), name: workspace.name, path: workspace.path, sessions: [] } };
            
        
        }
        if (msg.type === 'create-session') {
            const { success, data } = CreateSessionSchema.safeParse(msg.payload);
            if (!success) {
                throw new Error("Incorrect Schema");
            }
        
            const session = await SessionModel.create({
                workspaceId: data.workspaceId,
                conversation: [],
                title: "New session",
            })

            return { type: "session-created", payload: { id: session._id.toString(), title: session.title, messages: [] } };
            
        
        }
        if (msg.type === 'add-message') {
            const { success, data } = AddMessageSchema.safeParse(msg.payload);
            if (!success) {
                throw new Error("Incorrect Schema");
            }
        
            const session = await SessionModel.findByIdAndUpdate(data.sessionId, {
                $push: { conversation: { id: crypto.randomUUID(), type: "user", payload: { message: data.message } } }
            }, { new: true }).populate("workspaceId");
            if (!session) throw new Error("Session not found");
            void this.runAgent(data.sessionId, data.message, session, data);
            return { type: "message-added", payload: { id: data.sessionId } };
        }
        throw new Error("Incorrect input schema");

    }

    private async runAgent(sessionId: string, prompt: string, session: any, config: { provider?: "anthropic" | "gemini"; model?: string; apiKey?: string }) {
        try {
            await this.sendMessage({ type: "thinking", payload: { sessionId, message: "Agent is thinking…" } });
            const workspace = session.workspaceId;
            if (config.provider === "gemini") {
                await this.runGemini(sessionId, prompt, config.model ?? "gemini-2.5-flash", config.apiKey ?? process.env.GEMINI_API_KEY);
                return;
            }
            const options = {
                cwd: workspace.path,
                ...(session.agentSessionId ? { resume: session.agentSessionId } : {}),
                permissionMode: "acceptEdits" as const,
            };
            let resultText = "";
            for await (const event of query({ prompt, options })) {
                const item = event as any;
                if (item.type === "tool_use" || item.type === "tool_result") {
                    const tool = { id: crypto.randomUUID(), type: "tool", payload: { sessionId, name: item.name ?? item.tool_name ?? "tool", args: item.input ?? item.content, output: item.output ?? item.content } };
                    await SessionModel.findByIdAndUpdate(sessionId, { $push: { conversation: tool } });
                    await this.sendMessage(tool as any);
                } else if (item.type === "assistant" && item.message?.content) {
                    for (const block of item.message.content) if (block.type === "text") resultText += block.text;
                } else if (item.type === "result") {
                    resultText = item.result ?? resultText;
                    if (item.session_id) await SessionModel.findByIdAndUpdate(sessionId, { agentSessionId: item.session_id });
                }
            }
            const result = { id: crypto.randomUUID(), type: "result", payload: { sessionId, message: resultText } };
            await SessionModel.findByIdAndUpdate(sessionId, { $push: { conversation: result } });
            await this.sendMessage(result as any);
        } catch (error) {
            console.error(`[agent:${config.provider ?? "anthropic"}] session ${sessionId} failed`, error);
            const rawMessage = error instanceof Error ? error.message : "Agent failed";
            const message = rawMessage.includes("API_KEY_INVALID") || rawMessage.includes("API key not valid")
                ? "Gemini rejected this API key. Check the key in Model settings and try again."
                : rawMessage.slice(0, 500);
            await this.sendMessage({ type: "error", payload: { sessionId, message } });
        }
    }

    private async runGemini(sessionId: string, prompt: string, model: string, apiKey?: string) {
        if (!apiKey) throw new Error("Add a Gemini API key in Model settings or set GEMINI_API_KEY in apps/backend/.env");
        const ai = new GoogleGenAI({ apiKey });
        const stream = await ai.models.generateContentStream({ model, contents: prompt });
        let resultText = "";
        for await (const chunk of stream) {
            const text = chunk.text ?? "";
            resultText += text;
            await this.sendMessage({ type: "thinking", payload: { sessionId, message: "Gemini is generating…" } });
        }
        const result = { id: crypto.randomUUID(), type: "result", payload: { sessionId, message: resultText, provider: "gemini", model } };
        await SessionModel.findByIdAndUpdate(sessionId, { $push: { conversation: result } });
        await this.sendMessage(result as any);
    }
}
