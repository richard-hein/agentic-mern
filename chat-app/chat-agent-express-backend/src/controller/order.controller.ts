import type { Request, Response } from "express";
import { z } from "zod";
import { sendError } from "../services/http-error.ts";
import { OrderService } from "../services/order.service.ts";

const orderSchema = z.object({
    customerId: z.string().min(1),
    items: z.array(z.object({
        sku: z.string().min(1),
        name: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPrice: z.number().nonnegative(),
    })).min(1),
    status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
});

export class OrderController {
    static list(_req: Request, res: Response) {
        res.json(OrderService.list());
    }

    static getById(req: Request, res: Response) {
        try {
            res.json(OrderService.getById(String(req.params.id)));
        } catch (error) {
            sendError(res, error);
        }
    }

    static create(req: Request, res: Response) {
        const parsed = orderSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid order", details: parsed.error.issues });
        }

        try {
            res.status(201).json(OrderService.create(parsed.data));
        } catch (error) {
            sendError(res, error);
        }
    }

    static update(req: Request, res: Response) {
        const parsed = orderSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid order", details: parsed.error.issues });
        }

        try {
            res.json(OrderService.update(String(req.params.id), parsed.data));
        } catch (error) {
            sendError(res, error);
        }
    }

    static remove(req: Request, res: Response) {
        try {
            OrderService.remove(String(req.params.id));
            res.status(204).end();
        } catch (error) {
            sendError(res, error);
        }
    }
}
