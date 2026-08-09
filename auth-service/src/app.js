import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";
import swaggerSpec from "./config/swagger.js";

const app = express();


app.use(cors());
app.use(express.json());



app.get("/health", (req,res)=>{
    res.json({
        status:"ok",
        service:"auth-service"
    });
});


app.use("/api/auth", authRoutes);

app.get("/api/auth/docs.json", (req, res) => {
    res.json(swaggerSpec);
});
app.use("/api/auth/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));



export default app;
