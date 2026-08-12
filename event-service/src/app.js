import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import eventsRoutes from "./routes/events.js";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {

    res.json({
        status: "ok",
        service: "event-service"
    });

});

app.get("/api/events/docs.json", (req, res) => {
    res.json(swaggerSpec);
});
app.use("/api/events/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/events", eventsRoutes);

export default app;
