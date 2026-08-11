import { getJson } from "./http-client.js";
const join = (base, path) => `${base.replace(/\/$/, "")}${path}`;
export const getParticipant = (id, token) => getJson(join(process.env.PARTICIPANTS_SERVICE_URL, `/api/participants/${id}`), token);
export const getAvailability = (id, token) => getJson(join(process.env.EVENTS_SERVICE_URL, `/api/events/${id}/availability`), token);
export const getEvent = (id, token) => getJson(join(process.env.EVENTS_SERVICE_URL, `/api/events/${id}`), token);
