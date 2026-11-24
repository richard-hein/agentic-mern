import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { CustomerService } from "../../../services/customer.service.ts";

export function registerCustomerTools(mcpServer: McpServer) {

    // tool 1 - get customers
    mcpServer.registerTool(
        "getCustomers",
        {
            title: "Fetch all customers",
            description: "Retrieve all customers from the json data based on limit",
            inputSchema: {
                limit: z.number().optional()
            },
            outputSchema: {
                customers: z.array(
                    z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.email(),
                        city: z.string(),
                        country: z.string(),
                        tier: z.string(),
                        createdAt: z.string()
                    })
                )
            }
        },
        async ({ limit }) => {
            console.log("Fetching customers...", limit);
            const customers = await CustomerService.list();

            return {
                content: [{ type: "text", text: JSON.stringify(customers, null, 2) }],
                structuredContent: { customers }
            }
        }
    )

    // tool 2 - get single customer
    mcpServer.registerTool(
        "getCustomerById",
        {
            title: "Fetch customer by id",
            description: "Retrieve customer from the json data based on id",
            inputSchema: {
                id: z.string()
            },
            outputSchema:
                z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.email(),
                    city: z.string(),
                    country: z.string(),
                    tier: z.string(),
                    createdAt: z.string()
                })

        },
        async ({ id }) => {
            console.log("Fetching customer by id", id);

            const customer = await CustomerService.getById(id);
            return {
                content: [{ type: "text", text: JSON.stringify(customer, null, 2) }],
                structuredContent: { customer }
            }
        }
    )


}