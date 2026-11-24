import { Pool } from "pg";
import pgvector from "pgvector/pg";
const pool = new Pool({
    connectionString: process.env.POSTGRESQL_URL
});

pool.on("connect", () => {
    console.log("Connected to PostgreSql");
})

export class VectorStorePg {
    private static initialized = false;
    private static table = process.env.PGVECTOR_TABLE || "rag_vectors";
    private static dims = Number(process.env.EMBEDDING_DIMS) || 3072;

    static async init() {
        if (this.initialized) return;
        this.initialized = true;

        console.log("RAG (pgvector): Initializating vector store... ");

        // pgvector must be installed by a PostgreSQL superuser. Try once;
        // if we lack permission, warn instead of crashing on every start.
        try {
            await pool.query("CREATE EXTENSION IF NOT EXISTS vector");
        } catch (err: any) {
            if (err.code === "42501") {
                console.warn("pgvector: CREATE EXTENSION vector denied (need superuser). " +
                    "Run as postgres: CREATE EXTENSION IF NOT EXISTS vector;");
            } else {
                throw err;
            }
        }

        // Fail with a clear message instead of registerTypes' cryptic
        // "vector type not found" when the extension could not be created.
        const { rowCount } = await pool.query(
            "SELECT 1 FROM pg_extension WHERE extname = 'vector'"
        );
        if (!rowCount) {
            throw new Error(
                "pgvector extension is not installed in this database. " +
                "Run as a PostgreSQL superuser: CREATE EXTENSION IF NOT EXISTS vector;"
            );
        }

        // Register pgvector's type parser now that the extension exists.
        // This runs here (not on every connect) so a new connection never tries
        // to register types before CREATE EXTENSION has completed.
        const client = await pool.connect();
        try {
            await pgvector.registerTypes(client);
        } finally {
            client.release();
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS ${this.table} (
            id TEXT PRIMARY KEY,
            doc_id TEXT,
            chunk_index INT,
            content TEXT,
            metadata JSONB,
            embedding vector(${this.dims})
            )`);

        console.log("pgvector: Skipping all indexes (3072 dims exceed index limits)")

    }

    static async upsert(params: {
        id: string,
        docId: string,
        chunkIndex: number,
        text: string,
        embedding: number[],
        metadata?: any
    }) {
        const { id, docId, chunkIndex, text, embedding, metadata = {} } = params;

        // Validate Embedding Dimension
        if (embedding.length != this.dims) {
            throw new Error(`
                Embedding dimension mismatch. Expected ${this.dims}, got ${embedding.length}. ` +
                `Check EMBEDDING_DIMS env and your Gemini embedding model.`

            )
        }

        await pool.query(`
            INSERT INTO ${this.table} (id,doc_id,chunk_index,content,metadata,embedding)
            VALUES ($1,$2,$3,$4,$5,$6)
            ON CONFLICT (id)
            DO UPDATE SET
              content = EXCLUDED.content,
              metadata = EXCLUDED.metadata,
              embedding = EXCLUDED.embedding`
            ,
            [id, docId, chunkIndex, text, JSON.stringify(metadata), pgvector.toSql(embedding)]
        )

    }

    static async search(embedding: number[], topK: number = 4) {
        const result = await pool.query(`
            SELECT id, doc_id,chunk_index,content,metadata, embedding <=> $1 AS distance
            FROM ${this.table}
            ORDER BY embedding <-> $1
            LIMIT $2
            `);
        // embedding <=> $1 is the pgvector distance operator (L2 distance by default)

        return result.rows.map((row) => ({
            id: row.id,
            text: row.content,
            metadata: {
                docId: row.doc_id,
                chunkIndex: row.chunk_index,
                ...row.metadata
            },
            score: row.distance
        }))
    }
}

// "cosine / distance logic" lives on the pgvector side 