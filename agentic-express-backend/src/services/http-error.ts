import type { Response } from "express";

export class HttpError extends Error {
    constructor(
        readonly status: number,
        message: string,
        readonly details?: unknown,
    ) {
        super(message);
    }
}

export const sendError = (res: Response, error: unknown): void => {
    if (error instanceof HttpError) {
        res.status(error.status).json({ error: error.message, details: error.details });
        return;
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
};
