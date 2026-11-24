import OpenAI from "openai/index.js";
import type { ChatCompletionFunctionTool, ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions.js";
import type { Client } from "@modelcontextprotocol/sdk/client";

const MAX_TOOL_ROUNDS = 5;

export class OpenaiService {
    private static instance: OpenaiService;
    private readonly modelName: string;
    private readonly openai: OpenAI;

    constructor(modelName: string = process.env.OPENAI_MODEL!) {
        const apiKey = process.env.OPENAI_API_KEY;


        if (!apiKey) {
            throw new Error("API key is required.");
        };

        if (!modelName) {
            throw new Error("Model name is required.");
        }
        this.modelName = modelName;
        this.openai = new OpenAI({ apiKey: apiKey });
    }

    static getInstance(modelName?: string): OpenaiService {
        if (!this.instance) {
            this.instance = new OpenaiService(modelName);
        }
        return this.instance;
    }

    async callLLM(messages: ChatCompletionMessageParam[], tools?: ChatCompletionTool[]) {
        const response = await this.openai.chat.completions.create({
            model: this.modelName,
            messages,
            ...(tools ? { tools } : {}),
        });
        const message = response.choices[0]?.message;
        if (!message) {
            throw new Error("No message returned from model.");
        }
        return message;
    }

    async generateResponse(prompt: string): Promise<string> {
        try {
            const message = await this.callLLM([{ role: "user", content: prompt }]);
            return message.content || "No response generate.";

        } catch (error) {
            console.error("Error generating response from OpenaiService:", error);
            throw new Error(`Error generation response: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async generateEmbeddings(data: string | string[]): Promise<number[][]> {
        try {
            const response = await this.openai.embeddings.create({
                model: "text-embedding-3-small",
                input: data,
            });

            return response.data.map((e) => e.embedding);

        } catch (error) {
            console.error("Error generating embeddings:", error);
            throw new Error(`Error generating embeddings: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    // tool calling
    async generateResponseWithTools(prompt: string, mcpClient: Client): Promise<string> {
        try {
            const { tools: mcpTools } = await mcpClient.listTools();
            const tools: ChatCompletionTool[] = mcpTools.map((tool) => ({
                type: "function",
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.inputSchema as ChatCompletionFunctionTool["function"]["parameters"],
                },
            }));

            const messages: ChatCompletionMessageParam[] = [
                {
                    role: "system",
                    content: "You are an AI assistant specialized in E-commerce data(orders and customers) and weather data too.When the user asks a question about orders or customers or weather information, use a provided tools,**If the question is unrelated to your tools, answer using your intrinsic knowledge.** Be concise and do not mention the tools were used unless asked."
                },
                { role: "user", content: prompt }
            ];

            for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
                const message = await this.callLLM(messages, tools.length ? tools : undefined);

                // if the model answers directly
                if (!message.tool_calls?.length) {
                    return message.content || "No response generate.";
                }

                messages.push({
                    role: "assistant",
                    content: message.content,
                    tool_calls: message.tool_calls,
                });

                // run every tool the model asked for, then let it answer
                for (const toolCall of message.tool_calls) {
                    if (toolCall.type !== "function") {
                        throw new Error(`Unsupported tool call type: ${toolCall.type}`);
                    }
                    const args = JSON.parse(toolCall.function.arguments || "{}") as Record<string, unknown>;
                    const result = await mcpClient.callTool({
                        name: toolCall.function.name,
                        arguments: args,
                    });

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(result.content),
                    });
                }
            }

            throw new Error("Too many tool call rounds.");

        } catch (error) {
            console.error("Error generating response from OpenaiService:", error);
            throw new Error(`Error generation response: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

}

// instantiated on use so a missing OPENAI key doesn't break server boot
