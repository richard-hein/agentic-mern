
import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.route.ts"
import customerRoutes from "./routes/customer.route.ts"
import orderRoutes from "./routes/order.route.ts";
import weatherRoutes from "./routes/weather.route.ts";
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', chatRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/weather', weatherRoutes)

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.listen(PORT, () => {
    console.log("Server is running on port: " + PORT)
})