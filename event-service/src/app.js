import express from "express";
import cors from "cors";

import eventsRoutes from "./routes/events.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {

    res.json({
        status: "ok",
        service: "event-service"
    });

});

app.use("/api/events", eventsRoutes);

export default app;
