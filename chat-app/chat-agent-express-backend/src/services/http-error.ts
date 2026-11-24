import type { Response } from "express";

export class HttpError extends Error {
    readonly status: number;
    readonly details?: unknown;

    constructor(status: number, message: string, details?: unknown) {
        super(message);
        this.status = status;
        this.details = details;
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
