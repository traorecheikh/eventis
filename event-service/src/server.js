const express = require("express");
const cors = require("cors");
require("dotenv").config();


const eventsRoutes = require("./routes/events");


const app = express();


app.use(cors());
app.use(express.json());


app.get("/health",(req,res)=>{

    res.json({
        status:"ok",
        service:"event-service"
    });

});


app.use("/api/events", eventsRoutes);



const PORT = process.env.PORT || 3005;


app.listen(PORT,()=>{

    console.log(
        `Event service running on port ${PORT}`
    );

});