const express = require("express");
const router = express.Router();
const pool = require("../database");
const auth = require("../middleware/auth");


router.get("/", auth, async(req,res)=>{

    try{

        const result = await pool.query(
            "SELECT * FROM events ORDER BY id DESC"
        );

        res.json(result.rows);

    }catch(error){

        res.status(500).json({
            error:error.message
        });

    }

});



router.post("/", auth, async(req,res)=>{

    const {
        title,
        description,
        date,
        location
    } = req.body;


    try{

        const result = await pool.query(
            `
            INSERT INTO events
            (title,description,date,location,creator_id)
            VALUES($1,$2,$3,$4,$5)
            RETURNING *
            `,
            [
                title,
                description,
                date,
                location,
                req.user.id
            ]
        );


        res.json(result.rows[0]);


    }catch(error){

        res.status(500).json({
            error:error.message
        });

    }


});


module.exports = router;