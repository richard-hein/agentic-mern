import { GoogleGenAI } from "@google/genai";

export class GeminiService {
    private apiKey: string;
    private modelName: string;
    private genAI: GoogleGenAI;

    constructor(apiKey: string, modelName: string) {
        this.apiKey = apiKey;
        this.modelName = modelName;

        if (!this.apiKey) {
            throw new Error("API key is required for GeminiService");
        };

        if (!this.modelName) {
            throw new Error("Model name is required for GeminiService");
        }
        this.genAI = new GoogleGenAI({ apiKey: this.apiKey });
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

