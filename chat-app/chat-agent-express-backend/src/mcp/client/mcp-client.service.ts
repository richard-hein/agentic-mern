import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";

class MCPClientService {
    private static instance: MCPClientService;
    client: Client;
    private tools: any[] = [];
    private initialized = false;

    constructor() {
        this.client = new Client({
            name: "node-mcp-client",
            version: "1.0.0"
        });
    }

    static getInstance(): MCPClientService {
        if (!this.instance) {
            this.instance = new MCPClientService();
        }
        return this.instance;
    }

    // Connect to the MCP Server
    async init(): Promise<MCPClientService> {
        if (this.initialized) return this;

        // connect to MCP server over HTTP
        const url = `${process.env.SERVER}:${process.env.PORT}/mcp`;
        const transport = new StreamableHTTPClientTransport(new URL(url));

        await this.client.connect(transport);
        this.initialized = true;
        return this;
    }

    // Tool discovery
    async getTools() {
        await this.init();

        if (this.tools.length === 0) {
            const list = await this.client.listTools();
            this.tools = list.tools;
        }
        return this.tools;
    }

    // Call a specific tool by name with input arguments
    async callTool(name: string, args: Record<string, any>) {
        if (!this.initialized) await this.init();

        return await this.client.callTool({
            name,
            arguments: args
        })
    }
}

export const MCPClient = MCPClientService.getInstance();