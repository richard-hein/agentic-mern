
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";

import { createMcpServer } from "../mcp/server/mcpServer.ts";
import type { Request, Response } from "express";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types";

const USE_SESSION = true;

type Session = {
    server: ReturnType<typeof createMcpServer>;
    transport: StreamableHTTPServerTransport;
};

// in-memory session registry
const sessions: Record<string, Session> = {};

export class McpServerController {

    // helper functions
    private static getSession(sessionId: string) {
        if (!USE_SESSION) return null;

        return sessionId
            ? sessions[sessionId] ?? null
            : null;
    }

    // One server + transport per session: McpServer holds a single transport,
    // so sharing it across sessions would drop the earlier client.
    private static async createSession(): Promise<Session> {

        // Create an HTTP transport instance (to communicate between mcp client and server)
        const transport = new StreamableHTTPServerTransport({
            ...(USE_SESSION && {
                sessionIdGenerator: () => randomUUID()
            }),

            enableJsonResponse: true,

            onsessioninitialized: (sessionId) => {
                if (USE_SESSION) {
                    sessions[sessionId] = { server, transport };
                }
            }
        });

        const server = createMcpServer();

        if (USE_SESSION) {
            transport.onclose = () => {
                if (transport.sessionId) {
                    delete sessions[transport.sessionId];
                }
            };
        }

        // Connect to MCP server
        await server.connect(transport);

        return { server, transport };
    }

    // Post: client -> server
    static async handlePost(req: Request, res: Response) {
        // Check for existing session ID
        const sessionId = req.headers['mcp-session-id'] as string | undefined;

        let session = McpServerController.getSession(sessionId!);

        if (USE_SESSION) {
            // New initialization request
            if (!session && isInitializeRequest(req.body)) {
                console.log("Initializing new MCP session...");
                session = await McpServerController.createSession();
            }

            // Missing or invalid session
            if (!session) {
                return res.status(400).json({
                    jsonrpc: "2.0",
                    error: {
                        code: -32000,
                        message: "Bad Request: No valid session ID provided"
                    },
                    id: null
                })
            }
        }

        if (!USE_SESSION) {
            // Stateless mode: new transport per request
            session = await McpServerController.createSession();
        }

        if (!session) {
            return res.status(400).json({ error: "Transport not available" })
        }

        // Handle the request
        await session.transport.handleRequest(req, res, req.body);

    }

    // Get: Server -> Client (notifications)
    static async handleGet(req: Request, res: Response) {
        if (!USE_SESSION) {
            return res.status(400).send("GET is not supported in stateless mode");
        }

        const sessionId = req.headers["mcp-session-id"] as string | undefined;
        const session = McpServerController.getSession(sessionId!);

        if (!session) {
            return res.status(400).send("Invalid or missing session ID");
        }

        await session.transport.handleRequest(req, res);


    }

    // Delete: End session
    static async handleDelete(req: Request, res: Response) {
        if (!USE_SESSION) {
            return res.status(400).send("DELETE not supported in stateless mode");
        }

        const sessionId = req.headers["mcp-session-id"] as string | undefined;
        const session = McpServerController.getSession(sessionId!);

        if (!session) {
            return res.status(400).send("Invalid or missing session ID");
        }

        await session.transport.handleRequest(req, res);

    }


}
