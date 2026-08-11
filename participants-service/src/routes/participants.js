import { Router } from "express";
import prisma from "../config/prisma.js";
import auth from "../middleware/auth.js";
import { normalizeParticipant, positiveId, validateParticipant } from "../utils/validation.js";

const router = Router();
const uniqueError = (error) => error?.code === "P2002";
const notFoundError = (error) => error?.code === "P2025";

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

router.get("/:id", auth, async (req, res, next) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).json({ error: "id invalide" });
  try {
    const participant = await prisma.participant.findUnique({ where: { id } });
    return participant ? res.json(participant) : res.status(404).json({ error: "Participant introuvable" });
  } catch (error) { next(error); }
});

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
