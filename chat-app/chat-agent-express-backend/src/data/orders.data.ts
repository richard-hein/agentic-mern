export type OrderStatus =
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";


export interface OrderItem {
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
}

export interface Order {
    id: string;
    customerId: string; // references Customer.id
    items: OrderItem[];
    total: number; // sum of quantity * unitPrice
    status: OrderStatus;
    createdAt: string; // ISO date
}

export const orderTotal = (items: OrderItem[]): number =>
    Math.round(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * 100) / 100;

export const MOCK_ORDERS: Order[] = [
    {
        id: "O1001",
        customerId: "C003",
        items: [
            { sku: "MSE-001", name: "Wireless Mouse", quantity: 1, unitPrice: 29.99 },
            { sku: "CBL-002", name: "USB-C Cable", quantity: 2, unitPrice: 9.99 },
        ],
        total: 49.97,
        status: "delivered",
        createdAt: "2026-09-12",
    },
    {
        id: "O1002",
        customerId: "C007",
        items: [
            { sku: "KBD-010", name: "Mechanical Keyboard", quantity: 1, unitPrice: 89.0 },
        ],
        total: 89.0,
        status: "shipped",
        createdAt: "2026-10-03",
    },
    {
        id: "O1003",
        customerId: "C001",
        items: [
            { sku: "STD-004", name: "Laptop Stand", quantity: 1, unitPrice: 45.5 },
            { sku: "MSE-001", name: "Wireless Mouse", quantity: 1, unitPrice: 29.99 },
        ],
        total: 75.49,
        status: "delivered",
        createdAt: "2026-09-28",
    },
    {
        id: "O1004",
        customerId: "C012",
        items: [
            { sku: "MON-027", name: '27" Monitor', quantity: 1, unitPrice: 249.0 },
        ],
        total: 249.0,
        status: "pending",
        createdAt: "2026-11-15",
    },
    {
        id: "O1005",
        customerId: "C003",
        items: [
            { sku: "CAM-006", name: "Webcam 1080p", quantity: 1, unitPrice: 59.9 },
            { sku: "CBL-002", name: "USB-C Cable", quantity: 1, unitPrice: 9.99 },
        ],
        total: 69.89,
        status: "processing",
        createdAt: "2026-11-10",
    },
    {
        id: "O1006",
        customerId: "C015",
        items: [
            { sku: "HPH-020", name: "Noise-Cancelling Headphones", quantity: 1, unitPrice: 199.0 },
            { sku: "CSE-008", name: "Phone Case", quantity: 2, unitPrice: 14.5 },
        ],
        total: 228.0,
        status: "delivered",
        createdAt: "2026-10-05",
    },
    {
        id: "O1007",
        customerId: "C009",
        items: [
            { sku: "LMP-005", name: "Desk Lamp", quantity: 2, unitPrice: 24.0 },
        ],
        total: 48.0,
        status: "cancelled",
        createdAt: "2026-10-18",
    },
    {
        id: "O1008",
        customerId: "C018",
        items: [
            { sku: "HUB-003", name: "USB-C Hub", quantity: 1, unitPrice: 39.99 },
            { sku: "STD-004", name: "Laptop Stand", quantity: 1, unitPrice: 45.5 },
        ],
        total: 85.49,
        status: "shipped",
        createdAt: "2026-11-08",
    },
    {
        id: "O1009",
        customerId: "C020",
        items: [
            { sku: "KBD-010", name: "Mechanical Keyboard", quantity: 1, unitPrice: 89.0 },
            { sku: "MSE-001", name: "Wireless Mouse", quantity: 1, unitPrice: 29.99 },
            { sku: "LMP-005", name: "Desk Lamp", quantity: 1, unitPrice: 24.0 },
        ],
        total: 142.99,
        status: "pending",
        createdAt: "2026-11-17",
    },
    {
        id: "O1010",
        customerId: "C007",
        items: [
            { sku: "CBL-002", name: "USB-C Cable", quantity: 3, unitPrice: 9.99 },
        ],
        total: 29.97,
        status: "delivered",
        createdAt: "2026-11-01",
    },
];