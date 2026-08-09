import express from "express";
const router = express.Router();
import prisma from "../config/prisma.js";
import auth from "../middleware/auth.js";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * @openapi
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required: [id, title, date, location, maxCapacity, creatorId, createdAt, updatedAt]
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         date:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         maxCapacity:
 *           type: integer
 *         creatorId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Pagination:
 *       type: object
 *       required: [page, limit, total, totalPages]
 *       properties:
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         total:
 *           type: integer
 *         totalPages:
 *           type: integer
 *     Error:
 *       type: object
 *       required: [error]
 *       properties:
 *         error:
 *           type: string
 */

/**
 * @openapi
 * /:
 *   get:
 *     summary: Lister les evenements
 *     description: Acces public, pas de jeton requis.
 *     tags: [events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Liste paginee
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [data, pagination]
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Event"
 *                 pagination:
 *                   $ref: "#/components/schemas/Pagination"
 *       500:
 *         description: Erreur interne
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/", async (req, res) => {

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);

    try {

        const [data, total] = await Promise.all([
            prisma.event.findMany({
                orderBy: { id: "desc" },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.event.count()
        ]);

        res.json({
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1
            }
        });

    } catch (error) {

        console.error("Erreur liste evenements:", error.message);

        res.status(500).json({
            error: "Erreur interne du serveur"
        });

    }

});



/**
 * @openapi
 * /:
 *   post:
 *     summary: Creer un evenement
 *     tags: [events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, location, date, maxCapacity]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: ISO 8601, doit etre strictement dans le futur
 *               location:
 *                 type: string
 *               maxCapacity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Evenement cree
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Event"
 *       400:
 *         description: Validation echouee (corps absent, titre, location, date ou maxCapacity invalide)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       401:
 *         description: Jeton absent, invalide ou expire
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
router.post("/", auth, async (req, res) => {

    if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({
            error: "Corps de requete invalide"
        });
    }

    const { title, description, date, location, maxCapacity } = req.body;

    if (!title || title.length < 3 || title.length > 200) {
        return res.status(400).json({
            error: "title doit contenir entre 3 et 200 caracteres"
        });
    }

    if (!location) {
        return res.status(400).json({
            error: "location est requis"
        });
    }

    if (typeof date !== "string") {
        return res.status(400).json({
            error: "date doit etre une chaine au format ISO 8601"
        });
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
        return res.status(400).json({
            error: "date doit etre au format ISO 8601 et strictement dans le futur"
        });
    }

    if (!Number.isInteger(maxCapacity) || maxCapacity <= 0) {
        return res.status(400).json({
            error: "maxCapacity doit etre un entier strictement positif"
        });
    }

    try {

        const event = await prisma.event.create({
            data: {
                title,
                description,
                date: parsedDate,
                location,
                maxCapacity,
                creatorId: req.user.id
            }
        });

        res.status(201).json(event);

    } catch (error) {

        console.error("Erreur creation evenement:", error.message);

        res.status(500).json({
            error: "Erreur interne du serveur"
        });

    }


});


export default router;
