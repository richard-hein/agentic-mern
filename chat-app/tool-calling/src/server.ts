
import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.route.ts"
import customerRoutes from "./routes/customer.route.ts"
import orderRoutes from "./routes/order.route.ts";
import weatherRoutes from "./routes/weather.route.ts";
import mcpRoutes from "./routes/mcp-server.route.ts";
import agentRoutes from "./routes/agent.route.ts";


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/chat-with-llm', chatRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/chat', agentRoutes);

// mount mcp server on /mcp route
app.use("/mcp", mcpRoutes);

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.listen(PORT, () => {
    console.log("Server is running on port: " + PORT)
})