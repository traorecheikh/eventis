const TYPES = ["etudiant", "professeur", "externe"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+[1-9]\d{7,14}$/;

export function validateParticipant(input, partial = false) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return "Corps de requete invalide";
  const allowed = ["name", "email", "phone", "type"];
  if (Object.keys(input).some((key) => !allowed.includes(key))) return "Champ inconnu dans le corps";
  if (partial && Object.keys(input).length === 0) return "Au moins un champ est requis";
  if ((!partial || "name" in input) && (typeof input.name !== "string" || input.name.trim().length < 2 || input.name.trim().length > 150)) return "name doit contenir entre 2 et 150 caracteres";
  if ((!partial || "email" in input) && (typeof input.email !== "string" || input.email.length > 150 || !EMAIL.test(input.email))) return "email est invalide";
  if ("phone" in input && input.phone !== null && input.phone !== "" && (typeof input.phone !== "string" || !PHONE.test(input.phone))) return "phone doit etre au format international";
  if ((!partial || "type" in input) && !TYPES.includes(input.type)) return "type doit etre etudiant, professeur ou externe";
  return null;
}

export function normalizeParticipant(input) {
  const data = {};
  if ("name" in input) data.name = input.name.trim();
  if ("email" in input) data.email = input.email.trim().toLowerCase();
  if ("phone" in input) data.phone = input.phone ? input.phone.trim() : null;
  if ("type" in input) data.type = input.type;
  return data;
}

export function positiveId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
