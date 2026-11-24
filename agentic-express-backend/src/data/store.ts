import { MOCK_CUSTOMERS, type Customer } from "./customers.data.ts";
import { MOCK_ORDERS, type Order } from "./orders.data.ts";

// Mutable copies so CRUD does not overwrite the seed fixtures.
export const customers: Customer[] = [...MOCK_CUSTOMERS];
export const orders: Order[] = [...MOCK_ORDERS];

export const nextId = (prefix: string, ids: string[]): string => {
    const width = (ids[0]?.length ?? prefix.length) - prefix.length;
    const next = Math.max(0, ...ids.map((id) => Number(id.slice(1)) || 0)) + 1;
    return `${prefix}${String(next).padStart(width, "0")}`;
};
