import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import { CustomerService } from "../../../services/customer.service.ts";
import { OrderService } from "../../../services/order.service.ts";

export function registerOrderTools(mcpServer: McpServer) {
    console.log("Registering order tools...");

    // tool 1 - Get orders
    mcpServer.registerTool(
        "getOrders",
        {
            title: "Fetch all orders",
            description: "Retrieve all orders from the json data based on limit",
            inputSchema: {
                limit: z.number().optional()
            },
            outputSchema: {
                orders: z.array(
                    z.object({
                        id: z.string(),
                        customerId: z.string(),
                        items: z.array(
                            z.object({
                                sku: z.string(),
                                name: z.string(),
                                quantity: z.number(),
                                unitPrice: z.number(),
                            })
                        ),
                        total: z.number(),
                        status: z.string(),
                        createdAt: z.string()
                    })
                )
            }
        },
        async ({ limit }) => {
            console.log("Fetching orders...", limit);

            const orders = await OrderService.list();

            return {
                content: [{ type: "text", text: JSON.stringify(orders, null, 2) }],
                structuredContent: { orders }
            }
        }
    )

    // tool 2 - Get orders with customer details
    mcpServer.registerTool(
        "getOrdersWithCustomerDetails",
        {
            title: "Fetch all orders with customer details",
            description: "Retrieve the latest orders along with the customer details",
            inputSchema: {
                limit: z.number().optional()
            },
            outputSchema: {
                orders: z.array(
                    z.object({
                        id: z.string(),
                        customerId: z.string(),
                        items: z.array(
                            z.object({
                                sku: z.string(),
                                name: z.string(),
                                quantity: z.number(),
                                unitPrice: z.number(),
                            })
                        ),
                        total: z.number(),
                        status: z.string(),
                        createdAt: z.string(),
                        customer: z.object({
                            id: z.string(),
                            name: z.string(),
                            email: z.email(),
                            city: z.string(),
                            country: z.string(),
                            tier: z.string(),
                            createdAt: z.string(),
                        })
                    })
                )
            }
        },
        async ({ limit }) => {
            console.log("Fetching orders with customer details...", limit);

            const customers = CustomerService.list();
            const orders = [...OrderService.list()]
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .slice(0, limit)
                .map((order) => ({
                    ...order,
                    customer: customers.find((c) => c.id === order.customerId)!,
                }));

            return {
                content: [{ type: "text", text: JSON.stringify(orders, null, 2) }],
                structuredContent: { orders }
            }
        }
    )

    // tool 3 - Get order by ID
    mcpServer.registerTool(
        "getOrderById",
        {
            title: "Fetch order by id",
            description: "Retrieve order from the json data based on id",
            inputSchema: {
                id: z.string()
            },
            outputSchema: {
                order: z.object({
                    id: z.string(),
                    customerId: z.string(),
                    items: z.array(
                        z.object({
                            sku: z.string(),
                            name: z.string(),
                            quantity: z.number(),
                            unitPrice: z.number(),
                        })
                    ),
                    total: z.number(),
                    status: z.string(),
                    createdAt: z.string()
                })
            }
        },
        async ({ id }) => {
            console.log("Fetching order by id", id);

            const order = await OrderService.getById(id);

            return {
                content: [{ type: "text", text: JSON.stringify(order, null, 2) }],
                structuredContent: { order }
            }
        }
    )
}

