import apiClient from './api.js'

/**
 * Service d'acces a l'API registrations-service.
 *
 * Contrat reel (knowledge-base/api/registrations-service.md) :
 *   POST   /api/registrations                       (Bearer) { eventId, participantId } -> 201
 *   DELETE /api/registrations/:id                    (Bearer) -> annulation logique, 200
 *   GET    /api/registrations/event/:eventId          (Bearer) ?status&page&limit&enrich
 *   GET    /api/registrations/participant/:participantId (Bearer) ?status&page&limit&enrich
 *   GET    /api/registrations/stats/event/:eventId    (public) -> { confirmedCount, cancelledCount, totalCount }
 *   GET    /api/registrations/stats                   (Bearer) -> statistiques globales
 *
 * Le backend lie une inscription a un participant existant
 * (participantId), il n'accepte pas de details de participant en
 * ligne : le profil doit deja exister (participants-service).
 */

/**
 * Inscrit un participant a un evenement.
 *
 * @param {{eventId: number, participantId: number}} payload
 * @returns {Promise<object>}
 */
export async function createRegistration({ eventId, participantId }) {
  const { data } = await apiClient.post('/registrations', {
    eventId: Number(eventId),
    participantId: Number(participantId)
  })
  return data
}

/**
 * Annule une inscription (annulation logique cote backend).
 *
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export async function cancelRegistration(id) {
  const { data } = await apiClient.delete(`/registrations/${id}`)
  return data
}

/**
 * Liste les inscriptions d'un evenement.
 *
 * @param {string|number} eventId
 * @param {{status?: string, page?: number, limit?: number, enrich?: boolean}} params
 * @returns {Promise<{data: object[], pagination: object}>}
 */
export async function getEventRegistrations(eventId, { status, page = 1, limit = 20, enrich = false } = {}) {
  const { data } = await apiClient.get(`/registrations/event/${eventId}`, {
    params: { status, page, limit, enrich: enrich || undefined }
  })
  return data
}

/**
 * Liste les inscriptions d'un participant (« mes inscriptions »).
 *
 * @param {string|number} participantId
 * @param {{status?: string, page?: number, limit?: number, enrich?: boolean}} params
 * @returns {Promise<{data: object[], pagination: object}>}
 */
export async function getParticipantRegistrations(participantId, { status, page = 1, limit = 20, enrich = true } = {}) {
  const { data } = await apiClient.get(`/registrations/participant/${participantId}`, {
    params: { status, page, limit, enrich: enrich || undefined }
  })
  return data
}

/**
 * Statistiques d'inscription d'un evenement (public, compteurs a
 * zero si l'evenement n'a aucune inscription).
 *
 * @param {string|number} eventId
 * @returns {Promise<{eventId: number, confirmedCount: number, cancelledCount: number, totalCount: number}>}
 */
export async function getEventStats(eventId) {
  const { data } = await apiClient.get(`/registrations/stats/event/${eventId}`)
  return data
}

/**
 * Statistiques globales pour le tableau de bord (authentifie).
 *
 * @returns {Promise<{totalRegistrations: number, totalConfirmed: number, totalCancelled: number, byEvent: object[]}>}
 */
export async function getGlobalStats() {
  const { data } = await apiClient.get('/registrations/stats')
  return data
}
