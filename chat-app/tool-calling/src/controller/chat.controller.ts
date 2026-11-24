import type { NextFunction, Request, Response } from "express";
import { GEMINI } from "../services/gemini.service.ts";
import { MCPClient } from "../mcp/client/mcp-client.service.ts";

export class ChatController {
    static async generateResponse(req: Request, res: Response, next: NextFunction) {

        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        try {

            const mcp = await MCPClient.init();
            const response = await GEMINI.generateResponseWithTools(message, mcp.client);
            res.json({ reply: response })


        } catch (error) {
            console.error("Error handling chat message:", error);
            res.status(500).json({ error: "Failed to get response from the AI" })
        }


    }
}