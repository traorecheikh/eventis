import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";

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



export default app;
