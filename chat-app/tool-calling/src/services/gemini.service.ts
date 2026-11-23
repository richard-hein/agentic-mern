import { FunctionCallingConfigMode, GoogleGenAI, Type, type ContentListUnion, type ToolListUnion } from "@google/genai";
import { WeatherService } from "./weather.service.ts";
import { CustomerService } from "./customer.service.ts";

export class GeminiService {
    private static instance: GeminiService;
    private readonly modelName: string;
    private readonly genAI: GoogleGenAI;

    constructor(modelName: string = process.env.GEMINI_MODEL!) {
        const apiKey = process.env.GEMINI_API_KEY;


        if (!apiKey) {
            throw new Error("API key is required.");
        };

        if (!modelName) {
            throw new Error("Model name is required.");
        }
        this.modelName = modelName;
        this.genAI = new GoogleGenAI({ apiKey: apiKey });
    }

    static getInstance(modelName?: string): GeminiService {
        if (!this.instance) {
            this.instance = new GeminiService(modelName);
        }
        return this.instance;
    }
    async callLLM(contents: ContentListUnion, tools: ToolListUnion) {
        try {
            const response = await this.genAI.models.generateContent({
                model: this.modelName,
                contents,
                config: {
                    tools,
                    // default auto behavior
                    toolConfig: {
                        functionCallingConfig: {
                            mode: FunctionCallingConfigMode.AUTO
                        }
                    }
                    // systemInstruction: "You are a cate and your name is Neko",
                    // thinkingConfig: {
                    //     thinkingBudget: 0 // disable thinking
                    // }

                }
            })
            return response;
        } catch (error: any) {
            console.error("Error generating response from GeminiProvider:", error);
            throw new Error(`Error generating response: ${error.message}`)
        }
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

    // tool calling
    async generateResponseWithTools(prompt: string): Promise<string> {
        try {

            const getWeatherFn = {
                name: "get_current_weather",
                description: "Fetches live weather data for a given location.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        location: {
                            type: Type.STRING,
                            description: "City or region to fetch weather for, e.g., 'Yangon' or 'Thailand' "
                        }
                    },
                    required: ["location"]
                }

            }

            const getCustomersFn = {
                name: "get_all_customers",
                description: "Retrieves a list of all registered customers.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {}
                }
            }
            const tools = [{
                functionDeclarations: [getWeatherFn, getCustomersFn]
            }]

            // AI model calling
            const response = await this.callLLM(prompt, tools);
            let result: any;

            // if gemini decides to call a tool
            if (response.functionCalls && response.functionCalls?.length > 0) {
                const fnCall = response.functionCalls[0];
                if (!fnCall) throw new Error("No function call returned.");
                const { name, args } = fnCall;



                switch (name) {
                    case "get_current_weather": {
                        const location = (args as { location: string })?.location;
                        if (typeof location !== "string") throw new Error("Invalid location");

                        result = await WeatherService.fetchWeatherData(location);
                        break;
                    }

                    case "get_all_customers": {
                        result = await CustomerService.list();
                        break;
                    }
                    default:
                        throw new Error(`Unknown function: ${name}`);
                }

                // 
                if (!result) throw new Error("No result found.")

                // send result back to AI model for structured response
                const modelTurn = response.candidates?.[0]?.content;
                if (!modelTurn) throw new Error("No model turn to resume.");

                const responseFollowUp = await this.callLLM([
                    {

                        role: "user",
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    },
                    modelTurn, // the model's functionCall turn
                    {
                        role: "user",
                        parts: [
                            {
                                functionResponse: {
                                    name,
                                    response: { result }
                                }
                            }
                        ]
                    }
                ], tools);

                return responseFollowUp.text || "No response generate."

            }


            //    if gemini answer directly
            return response.text || "No response generate.";

        } catch (error) {
            console.error("Error generating response from GeminiService:", error);
            throw new Error(`Error generation response: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

}

export const GEMINI = GeminiService.getInstance();