import express from "express";
import cors from "cors";
import { router } from "./routes/index";

export const app = express();

// Middleware para habilitar CORS, que es importante para permitir solicitudes desde diferentes orígenes
app.use(cors());
// Middleware para parsear JSON
app.use(express.json());
app.use("/api", router);
// 404 handler
app.use((req: express.Request, res: express.Response) =>
  res.status(404).json({ error: "NotFound", message: "Route not found" })
);
