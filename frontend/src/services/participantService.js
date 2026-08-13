import apiClient from './api.js'

/**
 * Service d'acces a l'API participants-service.
 *
 * Contrat reel (knowledge-base/api/participants-service.md) :
 *   POST   /api/participants         (public)   { name, email, phone?, type } -> 201
 *   GET    /api/participants         (Bearer)   ?type&page&limit -> { data, pagination }
 *   GET    /api/participants/search  (Bearer)   ?email | ?name   -> { data }
 *   GET    /api/participants/:id     (Bearer)   -> Participant
 *   PUT    /api/participants/:id     (Bearer)   champs optionnels -> Participant
 *   DELETE /api/participants/:id     (Bearer)   -> 204
 *
 * type vaut "etudiant", "professeur" ou "externe".
 */

/**
 * Cree un profil participant (formulaire d'inscription public).
 *
 * @param {{name: string, email: string, phone?: string, type: string}} payload
 * @returns {Promise<object>}
 */
export async function createParticipant(payload) {
  const { data } = await apiClient.post('/participants', {
    name: payload.name?.trim(),
    email: payload.email?.trim(),
    phone: payload.phone?.trim() || undefined,
    type: payload.type
  })
  return data
}

/**
 * Liste les participants, pagines, filtre optionnel par type.
 *
 * @param {{page?: number, limit?: number, type?: string}} params
 * @returns {Promise<{data: object[], pagination: object}>}
 */
export async function getParticipants({ page = 1, limit = 20, type } = {}) {
  const { data } = await apiClient.get('/participants', {
    params: { page, limit, ...(type ? { type } : {}) }
  })
  return data
}

/**
 * Recherche un participant par email (correspondance exacte) ou
 * par nom (correspondance partielle).
 *
 * @param {{email?: string, name?: string}} query
 * @returns {Promise<object[]>}
 */
export async function searchParticipants({ email, name } = {}) {
  const { data } = await apiClient.get('/participants/search', {
    params: { ...(email ? { email } : {}), ...(name ? { name } : {}) }
  })
  return data.data || []
}

/**
 * Recupere un participant par son identifiant.
 *
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export async function getParticipantById(id) {
  const { data } = await apiClient.get(`/participants/${id}`)
  return data
}

/**
 * Met a jour un profil participant (champs optionnels).
 *
 * @param {string|number} id
 * @param {Partial<{name: string, email: string, phone: string, type: string}>} payload
 * @returns {Promise<object>}
 */
export async function updateParticipant(id, payload) {
  const { data } = await apiClient.put(`/participants/${id}`, payload)
  return data
}

/**
 * Supprime un profil participant.
 *
 * @param {string|number} id
 */
export async function deleteParticipant(id) {
  await apiClient.delete(`/participants/${id}`)
}
