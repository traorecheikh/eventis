import express from "express";
const router = express.Router();

import * as authController from "../controllers/auth.controller.js";
import authenticate from "../middleware/auth.middleware.js";


// REGISTER
router.post("/register", authController.register);


// LOGIN
router.post("/login", authController.login);


// GET CURRENT USER (PROTECTED)
router.get("/me", authenticate, (req, res) => {

    res.json({
        message: "Authenticated user",
        user: req.user
    });

});


export default router;
