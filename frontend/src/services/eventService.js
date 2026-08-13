import apiClient from './api'

/**
 * Service d'acces a l'API event-service.
 *
 * Contrat reel (knowledge-base/api/events-service.md) :
 *   GET  /api/events                     (public, pagine)      -> { data, pagination }
 *   GET  /api/events/:id                 (public)              -> Event
 *   GET  /api/events/:id/availability    (public)              -> { eventId, maxCapacity, registeredCount, remainingSeats, isFull }
 *   POST /api/events                     (Bearer)              -> Event, 201
 *
 * Champs exacts d'un evenement : title, description?, date (ISO 8601,
 * futur), location, maxCapacity. PUT/DELETE /events/:id n'existent pas
 * encore cote backend (voir tableau de bord, US-07/US-08) : aucune
 * fonction de modification/suppression n'est exposee ici.
 */

/**
 * Liste les evenements, pagines.
 *
 * @param {{page?: number, limit?: number}} params
 * @returns {Promise<{data: object[], pagination: object}>}
 */
export async function getEvents({ page = 1, limit = 20 } = {}) {
  const { data } = await apiClient.get('/events', { params: { page, limit } })
  return data
}

/**
 * Recupere un evenement par son identifiant.
 *
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export async function getEventById(id) {
  const { data } = await apiClient.get(`/events/${id}`)
  return data
}

/**
 * Calcule la disponibilite en temps reel d'un evenement
 * (appelle registrations-service cote backend).
 *
 * @param {string|number} id
 * @returns {Promise<{eventId: number, maxCapacity: number, registeredCount: number, remainingSeats: number, isFull: boolean}>}
 */
export async function getEventAvailability(id) {
  const { data } = await apiClient.get(`/events/${id}/availability`)
  return data
}

/**
 * Cree un evenement (reserve aux utilisateurs authentifies).
 *
 * @param {{title: string, description?: string, date: string, location: string, maxCapacity: number}} payload
 * @returns {Promise<object>}
 */
export async function createEvent(payload) {
  const { data } = await apiClient.post('/events', {
    title: payload.title?.trim(),
    description: payload.description?.trim() || undefined,
    date: payload.date,
    location: payload.location?.trim(),
    maxCapacity: Number(payload.maxCapacity)
  })
  return data
}
