import apiClient from './api.js'

/**
 * Service d'accès à l'API participants-service.
 *
 * Endpoints (supposés — à confirmer par la documentation
 * Swagger/OpenAPI officielle du participants-service) :
 *   GET /api/participants      → liste des participants
 *   GET /api/participants/:id  → participant { id, name, email, ... }
 *
 * Les requêtes sont signées automatiquement (Bearer JWT) par
 * l'instance Axios partagée lorsque l'utilisateur est connecté.
 */

/**
 * Récupère la liste des participants.
 *
 * @returns {Promise<object[]>}
 */
export async function getParticipants() {
  const { data } = await apiClient.get('/participants')
  return Array.isArray(data) ? data : data?.participants ?? []
}

/**
 * Récupère un participant par son identifiant.
 *
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export async function getParticipantById(id) {
  const { data } = await apiClient.get(`/participants/${id}`)
  return data?.participant ?? data
}
