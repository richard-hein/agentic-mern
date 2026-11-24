import express from "express";
import { GeminiProvider } from "./geminiProvider.js";
import { OpenAIProvider } from "./openaiProvider.js";
import { RagProvider } from "./rag.js";

const router = express.Router();

const providers = {
    gemini: () => new GeminiProvider(process.env.GEMINI_API_KEY, process.env.GEMINI_MODEL),
    openai: () => new OpenAIProvider(process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL),
};

router.post("/chat", async (req, res) => {
    const { message } = req.body ?? {};

    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
        const provider = process.env.AI_PROVIDER || "gemini";
        const createProvider = providers[provider];

        if (!createProvider) {
            return res.status(400).json({ error: `Unknown AI_PROVIDER: ${provider}` });
        }

        // const prompt = RagProvider.prepareSimpleRagPrompt(message);



        // For RAG with embeddings, we would first need to generate the query embedding
        const queryEmbedding = await createProvider().generateEmbeddings(message);
        const queryVector = queryEmbedding[0];

        // Fetch FAQ vectors from faq.json
        const faqData = RagProvider.fetchDocumentData("faq.json");
        const faqEmbeddings = await createProvider().generateEmbeddings(
            faqData.map((item) => item.answer),
            "RETRIEVAL_DOCUMENT"
        );

        const faqVectors = faqData.map((faq, index) => ({
            ...faq,
            vector: faqEmbeddings[index]
        }))

        const prompt = RagProvider.prepareRagPrompt(message, queryVector, faqVectors);
        console.log(`Prepared prompt ${prompt}`);
        // const response = await createProvider().generateResponse(message);
        const response = await createProvider().generateResponse(prompt);
        console.log(`Generated response: ${response}`);
        res.status(200).json({ reply: response });


    } catch (error) {
        console.error("Error handling chat message:", error);
        res.status(500).json({ error: "Internal server error: " + error.message })
    }

})

export default router;