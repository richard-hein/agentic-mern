export type Tier = "bronze" | "silver" | "gold";

export interface Customer {
    id: string;
    name: string;
    email: string;
    city: string;
    country: string;
    tier: Tier;
    createdAt: string; // ISO date
}

export const MOCK_CUSTOMERS: Customer[] = [
    { id: "C001", name: "Aye Chan", email: "aye.chan@example.com", city: "Yangon", country: "Myanmar", tier: "gold", createdAt: "2025-01-14" },
    { id: "C002", name: "Kyaw Zin", email: "kyaw.zin@example.com", city: "Mandalay", country: "Myanmar", tier: "silver", createdAt: "2025-02-03" },
    { id: "C003", name: "Hana Tanaka", email: "hana.tanaka@example.com", city: "Tokyo", country: "Japan", tier: "gold", createdAt: "2025-02-21" },
    { id: "C004", name: "Liam O'Connor", email: "liam.oconnor@example.com", city: "Dublin", country: "Ireland", tier: "bronze", createdAt: "2025-03-09" },
    { id: "C005", name: "Priya Sharma", email: "priya.sharma@example.com", city: "Mumbai", country: "India", tier: "silver", createdAt: "2025-03-30" },
    { id: "C006", name: "Mei Lin", email: "mei.lin@example.com", city: "Singapore", country: "Singapore", tier: "bronze", createdAt: "2025-04-12" },
    { id: "C007", name: "Carlos Mendoza", email: "carlos.mendoza@example.com", city: "Madrid", country: "Spain", tier: "gold", createdAt: "2025-04-27" },
    { id: "C008", name: "Sophie Dubois", email: "sophie.dubois@example.com", city: "Lyon", country: "France", tier: "silver", createdAt: "2025-05-18" },
    { id: "C009", name: "Thura Win", email: "thura.win@example.com", city: "Yangon", country: "Myanmar", tier: "bronze", createdAt: "2025-06-02" },
    { id: "C010", name: "Emma Johnson", email: "emma.johnson@example.com", city: "Toronto", country: "Canada", tier: "silver", createdAt: "2025-06-25" },
    { id: "C011", name: "Daniel Kim", email: "daniel.kim@example.com", city: "Seoul", country: "South Korea", tier: "bronze", createdAt: "2025-07-08" },
    { id: "C012", name: "Fatima Al-Sayed", email: "fatima.alsayed@example.com", city: "Dubai", country: "UAE", tier: "gold", createdAt: "2025-07-29" },
    { id: "C013", name: "Lucas Silva", email: "lucas.silva@example.com", city: "Sao Paulo", country: "Brazil", tier: "bronze", createdAt: "2025-08-15" },
    { id: "C014", name: "Nguyen Minh", email: "nguyen.minh@example.com", city: "Hanoi", country: "Vietnam", tier: "silver", createdAt: "2025-09-04" },
    { id: "C015", name: "Olivia Brown", email: "olivia.brown@example.com", city: "London", country: "United Kingdom", tier: "gold", createdAt: "2025-09-22" },
    { id: "C016", name: "Arjun Patel", email: "arjun.patel@example.com", city: "Bangalore", country: "India", tier: "bronze", createdAt: "2025-10-11" },
    { id: "C017", name: "Zoe Williams", email: "zoe.williams@example.com", city: "Sydney", country: "Australia", tier: "silver", createdAt: "2025-11-06" },
    { id: "C018", name: "Min Thu", email: "min.thu@example.com", city: "Naypyidaw", country: "Myanmar", tier: "bronze", createdAt: "2025-12-01" },
    { id: "C019", name: "Anna Schmidt", email: "anna.schmidt@example.com", city: "Berlin", country: "Germany", tier: "silver", createdAt: "2026-01-19" },
    { id: "C020", name: "Kenji Sato", email: "kenji.sato@example.com", city: "Osaka", country: "Japan", tier: "bronze", createdAt: "2026-02-10" },
];