import type { Request, Response } from "express";
import { z } from "zod";
import type { Customer } from "../data/customers.data.ts";
import { customers, nextId, orders } from "../data/store.ts";

const customerSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    city: z.string().min(1),
    country: z.string().min(1),
    tier: z.enum(["bronze", "silver", "gold"]),
});

export class CustomerController {
    static list(_req: Request, res: Response) {
        res.json(customers);
    }

    static getById(req: Request, res: Response) {
        const customer = customers.find((c) => c.id === req.params.id);
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }
        res.json(customer);
    }

    static create(req: Request, res: Response) {
        const parsed = customerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid customer", details: parsed.error.issues });
        }

        const customer: Customer = {
            id: nextId("C", customers.map((c) => c.id)),
            ...parsed.data,
            createdAt: new Date().toISOString().slice(0, 10),
        };
        customers.push(customer);
        res.status(201).json(customer);
    }

    static update(req: Request, res: Response) {
        const parsed = customerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid customer", details: parsed.error.issues });
        }

        const index = customers.findIndex((c) => c.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: "Customer not found" });
        }

        const updated: Customer = { ...customers[index]!, ...parsed.data };
        customers[index] = updated;
        res.json(updated);
    }

    static remove(req: Request, res: Response) {
        const index = customers.findIndex((c) => c.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: "Customer not found" });
        }
        if (orders.some((o) => o.customerId === req.params.id)) {
            return res.status(409).json({ error: "Customer still has orders; delete them first" });
        }

        customers.splice(index, 1);
        res.status(204).end();
    }
}
