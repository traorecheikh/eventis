const express = require("express");
const router = express.Router();

const authService = require("../services/auth.service");
const authenticate = require("../middleware/auth.middleware");


// REGISTER
router.post("/register", async (req, res) => {

    try {

        const user = await authService.register(req.body);

        res.status(201).json({
            message: "User created",
            user
        });

    } catch (error) {

        res.status(400).json({
            error: error.message
        });

    }

});



// LOGIN
router.post("/login", async (req, res) => {

    try {

        const result = await authService.login(req.body);

        res.json(result);

    } catch (error) {

        res.status(401).json({
            error: error.message
        });

    }

});



// GET CURRENT USER (PROTECTED)
router.get("/me", authenticate, (req, res) => {

    res.json({
        message: "Authenticated user",
        user: req.user
    });

});


module.exports = router;