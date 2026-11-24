import fs from "node:fs";
import path from "node:path";
import cosineSimilarity from "compute-cosine-similarity";

export class RagProvider {
    static fetchDocumentData(fileName) {
        const filePath = path.join(process.cwd(), 'data', fileName);
        const kbData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return kbData;
    }

    static prepareSimpleRagPrompt(query) {
        const kbData = this.fetchDocumentData("knowledgeBase.json");
        const context = kbData.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n');

        const prompt = `You are a helpful assistant. Use the following context to answer the question:\n\n${context} 
        Based on the above knowledge, answer the following user question : 
        User: ${query}
        Question: ${query}\nAnswer in one short paragraph.
        `;

        return prompt;
    }

    // RAG with embedding
    static prepareRagPrompt(query, queryVector, faqVectors) {
        const ranked = faqVectors.map((item, index) => ({
            ...item,
            score: cosineSimilarity(queryVector, item.vector)
        }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 2); // top 2 matches

        console.log("Query vector:", queryVector);
        console.log("Top RAG matches", ranked);

        const context = ranked.map((item) => item.answer).join('\n');

        const prompt = `
        Use the context below to answer.If the answer isn't there, say "It's not available in the documentation, but i will try to help you as best as i can." and to help based on your general knowledge.
        
        Context: ${context}
        User: ${query}`.trim();

        return prompt;

    }


}