import { orderTotal, type Order, type OrderItem, type OrderStatus } from "../data/orders.data.ts";
import { nextId, orders } from "../data/store.ts";
import { CustomerService } from "./customer.service.ts";
import { HttpError } from "./http-error.ts";

export type OrderInput = {
    customerId: string;
    items: OrderItem[];
    status?: OrderStatus | undefined;
};

export class OrderService {
    static list(): Order[] {
        return orders;
    }

    static getById(id: string): Order {
        const order = orders.find((o) => o.id === id);
        if (!order) {
            throw new HttpError(404, "Order not found");
        }
        return order;
    }

    static create(input: OrderInput): Order {
        CustomerService.getById(input.customerId);

        const order: Order = {
            id: nextId("O", orders.map((o) => o.id)),
            customerId: input.customerId,
            items: input.items,
            total: orderTotal(input.items),
            status: input.status ?? "pending",
            createdAt: new Date().toISOString().slice(0, 10),
        };
        orders.push(order);
        return order;
    }

    static update(id: string, input: OrderInput): Order {
        const index = orders.findIndex((o) => o.id === id);
        if (index === -1) {
            throw new HttpError(404, "Order not found");
        }
        CustomerService.getById(input.customerId);

        const current = orders[index]!;
        const updated: Order = {
            ...current,
            customerId: input.customerId,
            items: input.items,
            total: orderTotal(input.items),
            status: input.status ?? current.status,
        };
        orders[index] = updated;
        return updated;
    }

    static remove(id: string): void {
        const index = orders.findIndex((o) => o.id === id);
        if (index === -1) {
            throw new HttpError(404, "Order not found");
        }

        orders.splice(index, 1);
    }
}
