import apiClient from './api.js'
import { mapRegistrationPayload } from './registrationMapper.js'

/**
 * Service d'accès à l'API registrations-service.
 *
 * Endpoints (supposés — à confirmer par la documentation
 * Swagger/OpenAPI officielle du registrations-service) :
 *   GET  /api/registrations        (Bearer) → liste des inscriptions
 *   POST /api/registrations        (Bearer) body { eventId, participant } → 201
 *   DELETE /api/registrations/:id  (Bearer) → 204 (annulation)
 *
 * Le jeton JWT est injecté automatiquement par l'instance Axios
 * partagée (api.js). Le payload du formulaire est converti par
 * registrationMapper.js avant envoi.
 */

/**
 * Récupère les inscriptions de l'utilisateur connecté.
 *
 * @returns {Promise<object[]>}
 */
export async function getRegistrations() {
  const { data } = await apiClient.get('/registrations')
  return Array.isArray(data) ? data : data?.registrations ?? []
}

/**
 * Crée une inscription à un événement.
 *
 * @param {Object} registrationData données du formulaire
 * @returns {Promise<object>} inscription créée
 */
export async function createRegistration(registrationData) {
  const payload = mapRegistrationPayload(registrationData)
  const { data } = await apiClient.post('/registrations', payload)
  return data?.registration ?? data
}

/**
 * Annule une inscription (suppression côté backend).
 *
 * @param {string|number} id identifiant de l'inscription
 * @returns {Promise<void>}
 */
export async function cancelRegistration(id) {
  await apiClient.delete(`/registrations/${id}`)
}
