import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import { WeatherService } from "./weather.service.ts";
import { CustomerService } from "./customer.service.ts";

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

    private async runTool(name: string, args: Record<string, unknown>): Promise<unknown> {
        switch (name) {
            case "get_current_weather": {
                const location = args.location;
                if (typeof location !== "string") throw new Error("Invalid location");

                return WeatherService.fetchWeatherData(location);
            }

            case "get_all_customers":
                return CustomerService.list();

            default:
                throw new Error(`Unknown function: ${name}`);
        }
    }

    // tool calling
    async generateResponseWithTools(prompt: string): Promise<string> {
        try {
            const tools: ChatCompletionTool[] = [
                {
                    type: "function",
                    function: {
                        name: "get_current_weather",
                        description: "Fetches live weather data for a given location.",
                        parameters: {
                            type: "object",
                            properties: {
                                location: {
                                    type: "string",
                                    description: "City or region to fetch weather for, e.g., 'Yangon' or 'Thailand' "
                                }
                            },
                            required: ["location"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "get_all_customers",
                        description: "Retrieves a list of all registered customers.",
                        parameters: {
                            type: "object",
                            properties: {}
                        }
                    }
                }
            ];

            const messages: ChatCompletionMessageParam[] = [{ role: "user", content: prompt }];

            for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
                const message = await this.callLLM(messages, tools);

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
                    const result = await this.runTool(toolCall.function.name, args);

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(result),
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

export const OPENAI = OpenaiService.getInstance();
