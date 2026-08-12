import { getJson } from "./http-client.js";

const join = (base, path) => `${base.replace(/\/$/, "")}${path}`;

export const getRegistrationStats = (eventId, token) =>
  getJson(join(process.env.REGISTRATIONS_SERVICE_URL, `/api/registrations/stats/event/${eventId}`), token);
