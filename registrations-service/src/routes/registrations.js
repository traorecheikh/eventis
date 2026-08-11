import { Router } from "express";
import prisma from "../config/prisma.js";
import auth from "../middleware/auth.js";
import { getAvailability, getEvent, getParticipant } from "../services/upstream.js";

const router = Router();
const id = (value) => { const parsed = Number(value); return Number.isInteger(parsed) && parsed > 0 ? parsed : null; };
const paging = (query) => ({ page: Math.max(Number.parseInt(query.page, 10) || 1, 1), limit: Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100) });
const upstreamError = (error, res, next) => error?.code === "SERVICE_UNAVAILABLE" ? res.status(503).json({ error: "SERVICE_UNAVAILABLE" }) : next(error);

router.post("/", auth, async (req, res, next) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body) || Object.keys(req.body).some((key) => !["eventId", "participantId"].includes(key))) {
    return res.status(400).json({ error: "Corps de requete invalide" });
  }
  const eventId = id(req.body?.eventId); const participantId = id(req.body?.participantId);
  if (!eventId || !participantId) return res.status(400).json({ error: "eventId et participantId doivent etre des entiers positifs" });
  const token = req.headers.authorization;
  try {
    const participant = await getParticipant(participantId, token);
    if (participant.status === 404) return res.status(404).json({ error: "PARTICIPANT_NOT_FOUND" });
    if (participant.status < 200 || participant.status >= 300) return res.status(503).json({ error: "SERVICE_UNAVAILABLE" });
    const availability = await getAvailability(eventId, token);
    if (availability.status === 404) return res.status(404).json({ error: "EVENT_NOT_FOUND" });
    if (availability.status < 200 || availability.status >= 300) return res.status(503).json({ error: "SERVICE_UNAVAILABLE" });
    if (availability.data?.isFull) return res.status(409).json({ error: "EVENT_FULL" });
    const existing = await prisma.registration.findFirst({ where: { eventId, participantId, status: "confirmee" } });
    if (existing) return res.status(409).json({ error: "ALREADY_REGISTERED" });
    return res.status(201).json(await prisma.registration.create({ data: { eventId, participantId } }));
  } catch (error) {
    if (error?.code === "P2002" || error?.code === "23505") return res.status(409).json({ error: "ALREADY_REGISTERED" });
    return upstreamError(error, res, next);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  const registrationId = id(req.params.id);
  if (!registrationId) return res.status(400).json({ error: "id invalide" });
  try {
    const current = await prisma.registration.findUnique({ where: { id: registrationId } });
    if (!current) return res.status(404).json({ error: "Inscription introuvable" });
    if (current.status === "annulee") return res.status(409).json({ error: "ALREADY_CANCELLED" });
    return res.json(await prisma.registration.update({ where: { id: registrationId }, data: { status: "annulee", cancelledAt: new Date() } }));
  } catch (error) { next(error); }
});

async function list(req, res, next, field, value, enrich) {
  const status = req.query.status || "confirmee";
  if (!["confirmee", "annulee"].includes(status)) return res.status(400).json({ error: "status invalide" });
  const { page, limit } = paging(req.query); const where = { [field]: value, status };
  try {
    let [data, total] = await Promise.all([prisma.registration.findMany({ where, orderBy: { id: "desc" }, skip: (page - 1) * limit, take: limit }), prisma.registration.count({ where })]);
    if (req.query.enrich === "true") data = await Promise.all(data.map(async (row) => {
      try {
        const result = await enrich(row, req.headers.authorization);
        return { ...row, [field === "eventId" ? "participant" : "event"]: result.status === 200 ? result.data : null };
      } catch { return { ...row, [field === "eventId" ? "participant" : "event"]: null }; }
    }));
    return res.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } });
  } catch (error) { next(error); }
}

router.get("/event/:eventId", auth, (req, res, next) => {
  const value = id(req.params.eventId); if (!value) return res.status(400).json({ error: "eventId invalide" });
  return list(req, res, next, "eventId", value, (row, token) => getParticipant(row.participantId, token));
});
router.get("/participant/:participantId", auth, (req, res, next) => {
  const value = id(req.params.participantId); if (!value) return res.status(400).json({ error: "participantId invalide" });
  return list(req, res, next, "participantId", value, (row, token) => getEvent(row.eventId, token));
});

router.get("/stats/event/:eventId", async (req, res, next) => {
  const eventId = id(req.params.eventId); if (!eventId) return res.status(400).json({ error: "eventId invalide" });
  try {
    const groups = await prisma.registration.groupBy({ by: ["status"], where: { eventId }, _count: { _all: true } });
    const count = (status) => groups.find((group) => group.status === status)?._count._all || 0;
    const confirmedCount = count("confirmee"); const cancelledCount = count("annulee");
    return res.json({ eventId, confirmedCount, cancelledCount, totalCount: confirmedCount + cancelledCount });
  } catch (error) { next(error); }
});

router.get("/stats", auth, async (req, res, next) => {
  try {
    const [totalRegistrations, totalConfirmed, totalCancelled, byEventRows] = await Promise.all([
      prisma.registration.count(), prisma.registration.count({ where: { status: "confirmee" } }), prisma.registration.count({ where: { status: "annulee" } }),
      prisma.registration.groupBy({ by: ["eventId"], where: { status: "confirmee" }, _count: { _all: true }, orderBy: { eventId: "asc" } })
    ]);
    return res.json({ totalRegistrations, totalConfirmed, totalCancelled, byEvent: byEventRows.map((row) => ({ eventId: row.eventId, confirmedCount: row._count._all })) });
  } catch (error) { next(error); }
});
export default router;
