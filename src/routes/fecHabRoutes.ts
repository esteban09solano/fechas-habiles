import express from "express";
import { getDiasHabiles } from "../controllers/diasHabController";

const router = express.Router();

// Estos serian los endpoints que manejaría fecHabRoutes.ts
router.get("/", getDiasHabiles);

export default router;
