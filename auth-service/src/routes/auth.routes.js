import express from "express";
const router = express.Router();

import * as authController from "../controllers/auth.controller.js";
import authenticate from "../middleware/auth.middleware.js";

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required: [id, email, role, createdAt]
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [organisateur, participant]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     TokenClaims:
 *       type: object
 *       description: Contenu decode du jeton JWT
 *       required: [id, email, role, iat, exp]
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [organisateur, participant]
 *         iat:
 *           type: integer
 *           description: Horodatage d'emission (Unix, secondes)
 *         exp:
 *           type: integer
 *           description: Horodatage d'expiration (Unix, secondes)
 *     AuthResponse:
 *       type: object
 *       required: [user, token, expiresIn]
 *       properties:
 *         user:
 *           $ref: "#/components/schemas/User"
 *         token:
 *           type: string
 *         expiresIn:
 *           type: integer
 *           description: Duree de validite du jeton en secondes
 *     Error:
 *       type: object
 *       required: [error]
 *       properties:
 *         error:
 *           type: string
 */

/**
 * @openapi
 * /register:
 *   post:
 *     summary: Creer un compte
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, role]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [organisateur, participant]
 *     responses:
 *       201:
 *         description: Compte cree, jeton emis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       400:
 *         description: Email/mot de passe manquant ou role hors enumeration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       409:
 *         description: Cet email a deja un compte
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Erreur interne
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post("/register", authController.register);


/**
 * @openapi
 * /login:
 *   post:
 *     summary: Se connecter
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connecte
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: "#/components/schemas/User"
 *                 token:
 *                   type: string
 *       401:
 *         description: Identifiants incorrects (email inconnu ou mot de passe faux, meme message generique)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post("/login", authController.login);


/**
 * @openapi
 * /me:
 *   get:
 *     summary: Consulter son profil
 *     tags: [auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur authentifie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [message, user]
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: "#/components/schemas/TokenClaims"
 *       401:
 *         description: Jeton absent, invalide ou expire
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/me", authenticate, (req, res) => {

    res.json({
        message: "Authenticated user",
        user: req.user
    });

});


export default router;
