import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

export function createMcpServer() {
    console.log("Creating MCP Server Instance...");

    // Create MCP Server
    const server = new McpServer({
        name: "agentic-app",
        version: "1.0.0"
    });

    //    Register tools

}