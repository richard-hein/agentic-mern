import { randomUUID } from 'node:crypto';
import { ChromaClient } from "chromadb";

const chroma = new ChromaClient({
    host: process.env.CHROMA_HOST || 'localhost',
    port: process.env.CHROMA_PORT ? Number(process.env.CHROMA_PORT) : 8000,
    ssl: process.env.CHROMA_SSL == 'true'
});

const COLLECTION = process.env.CHROMA_COLLECTION || 'rag_documents';

export class VectorStoreChroma {
    private static collection: any;

    // init collection
    static async init() {
        this.collection = await chroma.getOrCreateCollection({
            name: COLLECTION
        })
    }

    // queries
    static async upsert(params: {
        id: string,
        docId: string,
        chunkIndex: number,
        text: string,
        embedding: number[],
        metadata?: any
    }) {
        const { id, docId, chunkIndex, text, embedding, metadata = {} } = params;
        await this.collection.upsert({
            ids: [id],
            documents: [text],
            embeddings: [embedding],
            metadatas: [{
                docId,
                chunkIndex,
                ...metadata
            }]

        })
    }

    static async search(embedding: number[], topK: number = 4) {
        const res = await this.collection.query({
            query_embeddings: [embedding],
            n_result: topK
        })
        return res.documents[0].map((doc: string, i: number) => ({
            id: randomUUID(),
            text: doc,
            metadata: res.metadatas[0][i],
            score: res.distances?.[0]?.[i] ?? null

        }));

    }
}