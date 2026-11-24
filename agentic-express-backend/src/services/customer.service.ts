import type { Customer } from "../data/customers.data.ts";
import { customers, nextId, orders } from "../data/store.ts";
import { HttpError } from "./http-error.ts";

export type CustomerInput = Omit<Customer, "id" | "createdAt">;

export class CustomerService {
    static list(): Customer[] {
        return customers;
    }

    static getById(id: string): Customer {
        const customer = customers.find((c) => c.id === id);
        if (!customer) {
            throw new HttpError(404, "Customer not found");
        }
        return customer;
    }

    static create(input: CustomerInput): Customer {
        const customer: Customer = {
            id: nextId("C", customers.map((c) => c.id)),
            ...input,
            createdAt: new Date().toISOString().slice(0, 10),
        };
        customers.push(customer);
        return customer;
    }

    static update(id: string, input: CustomerInput): Customer {
        const index = customers.findIndex((c) => c.id === id);
        if (index === -1) {
            throw new HttpError(404, "Customer not found");
        }

        const updated: Customer = { ...customers[index]!, ...input };
        customers[index] = updated;
        return updated;
    }

    static remove(id: string): void {
        const index = customers.findIndex((c) => c.id === id);
        if (index === -1) {
            throw new HttpError(404, "Customer not found");
        }
        if (orders.some((o) => o.customerId === id)) {
            throw new HttpError(409, "Customer still has orders; delete them first");
        }

        customers.splice(index, 1);
    }
}
