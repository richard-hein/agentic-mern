import type { Request, Response } from "express";
import { z } from "zod";
import { CustomerService } from "../services/customer.service.ts";
import { sendError } from "../services/http-error.ts";

const customerSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    city: z.string().min(1),
    country: z.string().min(1),
    tier: z.enum(["bronze", "silver", "gold"]),
});

export class CustomerController {
    static list(_req: Request, res: Response) {
        res.json(CustomerService.list());
    }

    static getById(req: Request, res: Response) {
        try {
            res.json(CustomerService.getById(String(req.params.id)));
        } catch (error) {
            sendError(res, error);
        }
    }

    static create(req: Request, res: Response) {
        const parsed = customerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid customer", details: parsed.error.issues });
        }

        try {
            res.status(201).json(CustomerService.create(parsed.data));
        } catch (error) {
            sendError(res, error);
        }
    }

    static update(req: Request, res: Response) {
        const parsed = customerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid customer", details: parsed.error.issues });
        }

        try {
            res.json(CustomerService.update(String(req.params.id), parsed.data));
        } catch (error) {
            sendError(res, error);
        }
    }

    static remove(req: Request, res: Response) {
        try {
            CustomerService.remove(String(req.params.id));
            res.status(204).end();
        } catch (error) {
            sendError(res, error);
        }
    }
}
