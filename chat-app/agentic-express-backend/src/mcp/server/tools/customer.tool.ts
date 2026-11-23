import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

export function registerCustomerTools(mcpServer: McpServer) {

    mcpServer.registerTool(
        "getCustomers",
        {
            title: "Fetch all customers",
            description: "Retrieve all customers from the json data based on limit",
            inputSchema: {
                limit
            }
        }
    )

}