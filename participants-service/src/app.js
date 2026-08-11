import express from "express";
import cors from "cors";
import participants from "./routes/participants.js";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/health", (req, res) => res.json({ status: "ok", service: "participants-service", database: "connected" }));
app.use("/api/participants", participants);
app.use((req, res) => res.status(404).json({ error: "Route introuvable" }));
app.use((error, req, res, next) => {
  console.error("Erreur participants-service:", error.message);
  res.status(500).json({ error: "Erreur interne du serveur" });
});
export default app;
