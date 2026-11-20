import { GoogleGenAI } from "@google/genai";

export class GeminiService {
    private static instance: GeminiService;
    private readonly modelName: string;
    private readonly genAI: GoogleGenAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        const modelName = process.env.GEMINI_MODEL;

        if (!apiKey) {
            throw new Error("API key is required.");
        };

        if (!modelName) {
            throw new Error("Model name is required.");
        }
        this.modelName = modelName;
        this.genAI = new GoogleGenAI({ apiKey: apiKey });
    }

    static getInstance(): GeminiService {
        if (!this.instance) {
            this.instance = new GeminiService();
        }
        return this.instance;
    }

    async generateResponse(prompt: string): Promise<string> {
        try {

            const response = await this.genAI.models.generateContent({
                model: this.modelName,
                contents: prompt,
                // config: {
                //     systemInstruction: "You are a cate and your name is Neko",
                //     thinkingConfig: {
                //         thinkingBudget: 0 // disable thinking
                //     }
                // }
            })
            return response.text || "No response generate.";

        } catch (error) {
            console.error("Error generating response from GeminiService:", error);
            throw new Error(`Error generation response: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async generateEmbeddings(data: string | string[], taskType: string = "RETRIEVAL_QUERY"): Promise<(number[] | undefined)[]> {

        try {
            const response = await this.genAI.models.embedContent({
                model: "gemini-embedding-001",
                contents: data,
                config: { taskType }
            });

            const embeddings = (response.embeddings ?? []).map(e => e.values);
            return embeddings;


        } catch (error) {
            console.error("Error generating embeddings:" + error);
            throw new Error(`Error generating embeddings: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

}

export const GEMINI = GeminiService.getInstance();