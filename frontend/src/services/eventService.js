import apiClient from './api'

/**
 * Service d'accès à l'API backend Events.
 *
 * Endpoints utilisés (aucun autre endpoint n'est appelé) :
 * - GET    /api/events
 * - GET    /api/events/:id
 * - POST   /api/events
 * - PUT    /api/events/:id
 * - DELETE /api/events/:id
 *
 * Le format du corps de requête pour créer/modifier un événement
 * respecte strictement le schéma attendu par le backend :
 *
 *   {
 *     "name": "Conférence IA",
 *     "eventDate": "2026-09-15",
 *     "venue": "Dakar",
 *     "maxCapacity": 100
 *   }
 *
 * Champs exacts : name, eventDate, venue, maxCapacity.
 * Aucun autre champ (title, description, date, location,
 * capacity) n'est envoyé.
 */

/**
 * Liste tous les événements.
 *
 * @returns {Promise<Array>} Liste des événements retournée par
 *   l'API (structure de réponse selon Swagger/OpenAPI).
 */
export async function getEvents() {
  const response = await apiClient.get('/events')
  // La réponse respecte la structure définie par Swagger/OpenAPI.
  // On accepte les formats courants : tableau direct,
  // response.data.events ou response.data.data.
  return response.data
}

/**
 * Récupère un événement par son identifiant.
 *
 * @param {string|number} id Identifiant de l'événement
 * @returns {Promise<Object>} Événement retourné par l'API
 *   (structure de réponse selon Swagger/OpenAPI).
 */
export async function getEventById(id) {
  const response = await apiClient.get(`/events/${id}`)
  // On accepte les formats courants : objet direct,
  // response.data.event ou response.data.data.
  return response.data
}

/**
 * Crée un nouvel événement.
 *
 * Le corps de la requête utilise exactement les champs attendus
 * par le backend : name, eventDate, venue, maxCapacity.
 *
 * @param {Object} data { name, eventDate, venue, maxCapacity }
 * @returns {Promise<Object>} Événement créé
 */
export async function createEvent(data) {
  const payload = mapEventPayload(data)
  const response = await apiClient.post('/events', payload)
  return response.data
}

/**
 * Modifie un événement existant.
 *
 * Le corps de la requête utilise exactement le schéma défini
 * par Swagger/OpenAPI : name, eventDate, venue, maxCapacity.
 *
 * @param {string|number} id Identifiant de l'événement
 * @param {Object} data { name, eventDate, venue, maxCapacity }
 * @returns {Promise<Object>} Événement mis à jour
 */
export async function updateEvent(id, data) {
  const payload = mapEventPayload(data)
  const response = await apiClient.put(`/events/${id}`, payload)
  return response.data
}

/**
 * Supprime un événement.
 *
 * @param {string|number} id Identifiant de l'événement
 * @returns {Promise<Object>} Réponse de suppression
 */
export async function deleteEvent(id) {
  const response = await apiClient.delete(`/events/${id}`)
  return response.data
}

/**
 * Normalise les données du formulaire vers le format exact
 * attendu par le backend.
 *
 * Les composants manipulent les champs internes (title, date,
 * location, capacity) ; cette fonction les convertit
 * strictement en : name, eventDate, venue, maxCapacity.
 *
 * @param {Object} data Données du formulaire ou de l'API
 * @returns {Object} Payload conforme au backend
 */
export function mapEventPayload(data) {
  return {
    name: (data?.name ?? data?.title ?? '').toString().trim(),
    eventDate: (data?.eventDate ?? data?.date ?? '').toString().trim(),
    venue: (data?.venue ?? data?.location ?? '').toString().trim(),
    maxCapacity: Number.isFinite(Number(data?.maxCapacity ?? data?.capacity))
      ? Number(data?.maxCapacity ?? data?.capacity)
      : undefined
  }
}

/**
 * Normalise la réponse du backend vers le format interne
 * utilisé par le frontend (pour la compatibilité avec les
 * composants existants).
 *
 * @param {Object} event Événement brut retourné par l'API
 * @returns {Object} Événement au format interne
 */
export function mapApiResponse(event) {
  return {
    id: event?.id,
    title: event?.name ?? event?.title ?? '',
    date: event?.eventDate ?? event?.date ?? '',
    location: event?.venue ?? event?.location ?? '',
    category: event?.category ?? 'Général',
    description: event?.description ?? '',
    maxParticipants: event?.maxCapacity ?? event?.capacity ?? 0,
    currentParticipants: event?.currentParticipants ?? 0,
    organizer: event?.organizer ?? '',
    status: event?.status ?? 'published',
    time: event?.time ?? '',
    remainingSeats:
      (event?.maxCapacity ?? event?.capacity ?? 0) -
      (event?.currentParticipants ?? 0)
  }
}
