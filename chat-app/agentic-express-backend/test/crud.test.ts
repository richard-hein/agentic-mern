import assert from "node:assert/strict";
import { orderTotal } from "../src/data/orders.data.ts";
import { customers, nextId, orders } from "../src/data/store.ts";

assert.equal(
    orderTotal([
        { sku: "MSE-001", name: "Wireless Mouse", quantity: 1, unitPrice: 29.99 },
        { sku: "CBL-002", name: "USB-C Cable", quantity: 2, unitPrice: 9.99 },
    ]),
    49.97,
);
assert.equal(nextId("C", customers.map((c) => c.id)), "C021");
assert.equal(nextId("O", orders.map((o) => o.id)), "O1011");
assert.ok(orders.every((o) => customers.some((c) => c.id === o.customerId)));

console.log("CRUD self-check passed");
