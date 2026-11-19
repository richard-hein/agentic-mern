import type { Request, Response } from "express";
import { z } from "zod";
import { orderTotal, type Order } from "../data/orders.data.ts";
import { customers, nextId, orders } from "../data/store.ts";

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
        res.json(orders);
    }

    static getById(req: Request, res: Response) {
        const order = orders.find((o) => o.id === req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.json(order);
    }

    static create(req: Request, res: Response) {
        const parsed = orderSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid order", details: parsed.error.issues });
        }
        if (!customers.some((c) => c.id === parsed.data.customerId)) {
            return res.status(404).json({ error: "Customer not found" });
        }

        const order: Order = {
            id: nextId("O", orders.map((o) => o.id)),
            customerId: parsed.data.customerId,
            items: parsed.data.items,
            total: orderTotal(parsed.data.items),
            status: parsed.data.status ?? "pending",
            createdAt: new Date().toISOString().slice(0, 10),
        };
        orders.push(order);
        res.status(201).json(order);
    }

    static update(req: Request, res: Response) {
        const parsed = orderSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid order", details: parsed.error.issues });
        }
        if (!customers.some((c) => c.id === parsed.data.customerId)) {
            return res.status(404).json({ error: "Customer not found" });
        }

        const index = orders.findIndex((o) => o.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: "Order not found" });
        }

        const updated: Order = {
            ...orders[index]!,
            customerId: parsed.data.customerId,
            items: parsed.data.items,
            total: orderTotal(parsed.data.items),
            status: parsed.data.status ?? orders[index]!.status,
        };
        orders[index] = updated;
        res.json(updated);
    }

    static remove(req: Request, res: Response) {
        const index = orders.findIndex((o) => o.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: "Order not found" });
        }

        orders.splice(index, 1);
        res.status(204).end();
    }
}
