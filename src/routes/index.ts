import { Router } from "express";
import fhRoutes from "./fecHabRoutes";

export const router = Router();

router.use("/fechas_habiles", fhRoutes);
