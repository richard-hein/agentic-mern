import OpenAI from "openai";

export class OpenAIProvider {
    constructor(apiKey, modelName) {
        this.apiKey = apiKey;
        this.modelName = modelName;

        if (!this.apiKey) {
            throw new Error("API key is required for OpenAIProvider");
        };

        if (!this.modelName) {
            throw new Error("Model name is required for OpenAIProvider");
        }
    }

    async generateResponse(prompt) {
        try {
            const openAI = new OpenAI({ apiKey: this.apiKey });
            const response = await openAI.responses.create({
                model: this.modelName,
                input: prompt,
            });
            return response.output_text || "No response generate.";

        } catch (error) {
            console.error("Error generating response from OpenAIProvider:", error);
            throw new Error(`Error generation response: ${error.message}`)
        }
    }

}
