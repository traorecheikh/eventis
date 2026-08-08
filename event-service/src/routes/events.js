import express from "express";
const router = express.Router();
import prisma from "../config/prisma.js";
import auth from "../middleware/auth.js";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;


// Accès public, pas de jeton requis.
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
