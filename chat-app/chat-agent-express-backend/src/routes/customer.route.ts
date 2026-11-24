import express from "express";
import { CustomerController } from "../controller/customer.controller.ts";

const router = express.Router();

router.get("/", CustomerController.list);
router.get("/:id", CustomerController.getById);
router.post("/", CustomerController.create);
router.put("/:id", CustomerController.update);
router.delete("/:id", CustomerController.remove);

export default router;
