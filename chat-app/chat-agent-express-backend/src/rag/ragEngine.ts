import { GEMINI } from "../services/gemini.service.ts";
import { VectorStore } from "./vectorStore/vector.store.ts";

export interface RagChunk {
    id: string;
    text: string;
    metadata: any;
    score: number | null
}

export class RagEngine {
    static async buildPrompt(query: string, topK: number = 4) {
        try {
            const Store = VectorStore.get();
            await Store.init();
            console.log("RAG: Vector store initialized.");

            console.log("RAG: Generating embeddings...");

            // Gemini implementation
            const [queryEmbedding] = await GEMINI.generateEmbeddings([query]);
            if (!queryEmbedding) throw new Error("Failed to create embedding");

            console.log("RAG: Embedding generated");

            if (queryEmbedding.length !== Number(process.env.EMBEDDING_DIMS)) {
                throw new Error(
                    `Embedding dimension mismatch. Gemini returned ${queryEmbedding.length} dims, ` +
                    `but EMBEDDING_DIMS env is set to ${process.env.EMBEDDING_DIMS}`
                )
            }
            console.log("RAG: Searching vector DB...");
            const result = await Store.search(queryEmbedding, topK);

            if (!result.length) {
                return {
                    prompt: `No matching documents found for query: ${query}`,
                    sources: []
                }
            }

            /* Build Context
            SOURCE 1:
            <chunk text>
            META: {...metadata JSON..}
            */
            const context = result.
                map(
                    (r: RagChunk, i: number) =>
                        `SOURCE ${i + 1}:\n${r.text}\nMETA: ${JSON.stringify(r.metadata)}`
                ).join("\n\n");

            const prompt = `
            You are an assistant that answer questions only using the information in the context.
            If the answer is not present, reply: "I don't have enough information." 
            
            CONTEXT: ${context}
            
            QUESTION: ${query}
            
            ANSWER: `

            return { prompt, sources: result }


        } catch (error) {
            console.error("RAG PIPELINE ERROR: ", error);
        }
    }
}