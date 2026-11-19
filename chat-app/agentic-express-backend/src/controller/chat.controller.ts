import type { NextFunction, Request, Response } from "express";
import { GeminiService } from "../services/gemini.service.ts";

export class ChatController {
    static async generateResponse(req: Request, res: Response, next: NextFunction) {

        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        try {
            const gemini = new GeminiService(
                process.env.GEMINI_API_KEY!,
                process.env.GEMINI_MODEL!
            );

            const response = await gemini.generateResponse(message);
            res.json({ reply: response })


        } catch (error) {
            console.error("Error handling chat message:", error);
            res.status(500).json({ error: "Failed to get response from the AI" })
        }


    }
}