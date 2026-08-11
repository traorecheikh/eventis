import { Router } from "express";
import prisma from "../config/prisma.js";
import auth from "../middleware/auth.js";
import { getAvailability, getEvent, getParticipant } from "../services/upstream.js";

const router = Router();
const id = (value) => { const parsed = Number(value); return Number.isInteger(parsed) && parsed > 0 ? parsed : null; };
const paging = (query) => ({ page: Math.max(Number.parseInt(query.page, 10) || 1, 1), limit: Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100) });
const upstreamError = (error, res, next) => error?.code === "SERVICE_UNAVAILABLE" ? res.status(503).json({ error: "SERVICE_UNAVAILABLE" }) : next(error);

/**
 * @openapi
 * components:
 *   schemas:
 *     Registration:
 *       type: object
 *       required: [id, eventId, participantId, status, registeredAt, cancelledAt]
 *       properties:
 *         id:
 *           type: integer
 *         eventId:
 *           type: integer
 *         participantId:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [confirmee, annulee]
 *         registeredAt:
 *           type: string
 *           format: date-time
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           nullable: true
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
 *     summary: Inscrire un participant a un evenement
 *     description: >
 *       Point d'entree central du systeme. Verifie le participant aupres de
 *       participants-service puis la disponibilite aupres d'events-service
 *       avant d'ecrire en base. Jamais d'inscription optimiste.
 *     tags: [registrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId, participantId]
 *             properties:
 *               eventId:
 *                 type: integer
 *               participantId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Inscription creee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Registration"
 *       400:
 *         description: Corps de requete invalide
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
 *         description: Evenement ou participant introuvable (PARTICIPANT_NOT_FOUND, EVENT_NOT_FOUND)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       409:
 *         description: Evenement complet ou deja inscrit (EVENT_FULL, ALREADY_REGISTERED)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       503:
 *         description: Un service amont est injoignable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
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

/**
 * @openapi
 * /{id}:
 *   delete:
 *     summary: Annuler une inscription
 *     description: Annulation logique, pas de suppression physique. L'historique est conserve pour les statistiques.
 *     tags: [registrations]
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
 *         description: Annulee, renvoie l'inscription mise a jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Registration"
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
 *         description: Inscription introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       409:
 *         description: Deja annulee (ALREADY_CANCELLED)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
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

/**
 * @openapi
 * /event/{eventId}:
 *   get:
 *     summary: Lister les inscriptions d'un evenement
 *     tags: [registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [confirmee, annulee]
 *           default: confirmee
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
 *       - in: query
 *         name: enrich
 *         schema:
 *           type: boolean
 *         description: Si true, ajoute le nom et l'email du participant (null si l'enrichissement echoue)
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
 *                     $ref: "#/components/schemas/Registration"
 *                 pagination:
 *                   $ref: "#/components/schemas/Pagination"
 *       400:
 *         description: eventId ou status invalide
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
router.get("/event/:eventId", auth, (req, res, next) => {
  const value = id(req.params.eventId); if (!value) return res.status(400).json({ error: "eventId invalide" });
  return list(req, res, next, "eventId", value, (row, token) => getParticipant(row.participantId, token));
});

/**
 * @openapi
 * /participant/{participantId}:
 *   get:
 *     summary: Lister les evenements auxquels un participant est inscrit
 *     tags: [registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [confirmee, annulee]
 *           default: confirmee
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
 *       - in: query
 *         name: enrich
 *         schema:
 *           type: boolean
 *         description: Si true, ajoute le titre, la date et le lieu de l'evenement (null si l'enrichissement echoue)
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
 *                     $ref: "#/components/schemas/Registration"
 *                 pagination:
 *                   $ref: "#/components/schemas/Pagination"
 *       400:
 *         description: participantId ou status invalide
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
router.get("/participant/:participantId", auth, (req, res, next) => {
  const value = id(req.params.participantId); if (!value) return res.status(400).json({ error: "participantId invalide" });
  return list(req, res, next, "participantId", value, (row, token) => getEvent(row.eventId, token));
});

/**
 * @openapi
 * /stats/event/{eventId}:
 *   get:
 *     summary: Compter les inscriptions d'un evenement
 *     description: >
 *       Appele par events-service pour calculer la disponibilite. Acces
 *       interne, pas de jeton requis : l'appel vient du reseau Docker prive.
 *     tags: [registrations]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compteurs, a zero si l'evenement n'a aucune inscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [eventId, confirmedCount, cancelledCount, totalCount]
 *               properties:
 *                 eventId:
 *                   type: integer
 *                 confirmedCount:
 *                   type: integer
 *                 cancelledCount:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
 *       400:
 *         description: eventId invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/stats/event/:eventId", async (req, res, next) => {
  const eventId = id(req.params.eventId); if (!eventId) return res.status(400).json({ error: "eventId invalide" });
  try {
    const groups = await prisma.registration.groupBy({ by: ["status"], where: { eventId }, _count: { _all: true } });
    const count = (status) => groups.find((group) => group.status === status)?._count._all || 0;
    const confirmedCount = count("confirmee"); const cancelledCount = count("annulee");
    return res.json({ eventId, confirmedCount, cancelledCount, totalCount: confirmedCount + cancelledCount });
  } catch (error) { next(error); }
});

/**
 * @openapi
 * /stats:
 *   get:
 *     summary: Statistiques globales des inscriptions
 *     tags: [registrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques globales et par evenement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [totalRegistrations, totalConfirmed, totalCancelled, byEvent]
 *               properties:
 *                 totalRegistrations:
 *                   type: integer
 *                 totalConfirmed:
 *                   type: integer
 *                 totalCancelled:
 *                   type: integer
 *                 byEvent:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required: [eventId, confirmedCount]
 *                     properties:
 *                       eventId:
 *                         type: integer
 *                       confirmedCount:
 *                         type: integer
 *       401:
 *         description: Jeton absent, invalide ou expire
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
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
