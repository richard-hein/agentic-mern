import express from "express";
import { OrderController } from "../controller/order.controller.ts";

const router = express.Router();

router.get("/", OrderController.list);
router.get("/:id", OrderController.getById);
router.post("/", OrderController.create);
router.put("/:id", OrderController.update);
router.delete("/:id", OrderController.remove);

export default router;
