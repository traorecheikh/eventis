import { Router } from "express";
import prisma from "../config/prisma.js";
import auth from "../middleware/auth.js";
import { normalizeParticipant, positiveId, validateParticipant } from "../utils/validation.js";

const router = Router();
const uniqueError = (error) => error?.code === "P2002";
const notFoundError = (error) => error?.code === "P2025";

/**
 * @openapi
 * components:
 *   schemas:
 *     Participant:
 *       type: object
 *       required: [id, name, email, type, createdAt, updatedAt]
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *           nullable: true
 *         type:
 *           type: string
 *           enum: [etudiant, professeur, externe]
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
 *   post:
 *     summary: Creer un participant
 *     description: Acces public, c'est le formulaire d'inscription a la plateforme.
 *     tags: [participants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, type]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 150
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [etudiant, professeur, externe]
 *     responses:
 *       201:
 *         description: Participant cree
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Participant"
 *       400:
 *         description: Validation echouee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       409:
 *         description: Cet email existe deja
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post("/", async (req, res, next) => {
  const validation = validateParticipant(req.body);
  if (validation) return res.status(400).json({ error: validation });
  try {
    return res.status(201).json(await prisma.participant.create({ data: normalizeParticipant(req.body) }));
  } catch (error) {
    if (uniqueError(error)) return res.status(409).json({ error: "Cet email existe deja" });
    next(error);
  }
});

/**
 * @openapi
 * /:
 *   get:
 *     summary: Lister les participants
 *     description: Authentification requise, contient des donnees personnelles.
 *     tags: [participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [etudiant, professeur, externe]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
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
 *                     $ref: "#/components/schemas/Participant"
 *                 pagination:
 *                   $ref: "#/components/schemas/Pagination"
 *       400:
 *         description: Filtre type invalide
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
 */
router.get("/", auth, async (req, res, next) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
  const where = req.query.type ? { type: req.query.type } : {};
  if (req.query.type && !["etudiant", "professeur", "externe"].includes(req.query.type)) return res.status(400).json({ error: "Filtre type invalide" });
  try {
    const [data, total] = await Promise.all([prisma.participant.findMany({ where, orderBy: { id: "desc" }, skip: (page - 1) * limit, take: limit }), prisma.participant.count({ where })]);
    return res.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } });
  } catch (error) { next(error); }
});

/**
 * @openapi
 * /search:
 *   get:
 *     summary: Rechercher un participant par email ou par nom
 *     tags: [participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Correspondance exacte, insensible a la casse
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Correspondance partielle, insensible a la casse
 *     responses:
 *       200:
 *         description: Resultats de recherche, un tableau vide est une reponse valide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [data]
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Participant"
 *       400:
 *         description: Ni email ni name fournis
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
 */
router.get("/search", auth, async (req, res, next) => {
  const email = typeof req.query.email === "string" ? req.query.email.trim().toLowerCase() : "";
  const name = typeof req.query.name === "string" ? req.query.name.trim() : "";
  if (!email && !name) return res.status(400).json({ error: "email ou name est requis" });
  try {
    const filters = [];
    if (email) filters.push({ email: { equals: email, mode: "insensitive" } });
    if (name) filters.push({ name: { contains: name, mode: "insensitive" } });
    return res.json({ data: await prisma.participant.findMany({ where: { OR: filters }, orderBy: { name: "asc" } }) });
  } catch (error) { next(error); }
});

/**
 * @openapi
 * /{id}:
 *   get:
 *     summary: Recuperer un participant par son identifiant
 *     description: Appele par registrations-service pour verifier qu'un participant existe avant de l'inscrire.
 *     tags: [participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Participant trouve
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Participant"
 *       400:
 *         description: id invalide
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
 *       404:
 *         description: Participant introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/:id", auth, async (req, res, next) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).json({ error: "id invalide" });
  try {
    const participant = await prisma.participant.findUnique({ where: { id } });
    return participant ? res.json(participant) : res.status(404).json({ error: "Participant introuvable" });
  } catch (error) { next(error); }
});

/**
 * @openapi
 * /{id}:
 *   put:
 *     summary: Mettre a jour un participant
 *     description: Tous les champs sont optionnels.
 *     tags: [participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [etudiant, professeur, externe]
 *     responses:
 *       200:
 *         description: Participant mis a jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Participant"
 *       400:
 *         description: id ou validation invalide
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
 *       404:
 *         description: Participant introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       409:
 *         description: Le nouvel email est deja pris par un autre participant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.put("/:id", auth, async (req, res, next) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).json({ error: "id invalide" });
  const validation = validateParticipant(req.body, true);
  if (validation) return res.status(400).json({ error: validation });
  try {
    return res.json(await prisma.participant.update({ where: { id }, data: normalizeParticipant(req.body) }));
  } catch (error) {
    if (uniqueError(error)) return res.status(409).json({ error: "Cet email existe deja" });
    if (notFoundError(error)) return res.status(404).json({ error: "Participant introuvable" });
    next(error);
  }
});

/**
 * @openapi
 * /{id}:
 *   delete:
 *     summary: Supprimer un participant
 *     tags: [participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Supprime
 *       400:
 *         description: id invalide
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
 *       404:
 *         description: Participant introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.delete("/:id", auth, async (req, res, next) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).json({ error: "id invalide" });
  try {
    await prisma.participant.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (notFoundError(error)) return res.status(404).json({ error: "Participant introuvable" });
    next(error);
  }
});

export default router;
