import apiClient from './api.js'
import { saveToken, removeToken, getToken, decodeToken } from './token.js'

/**
 * Service d'accès à l'API auth-service.
 *
 * Contrat reel (knowledge-base/api/auth-service.md) :
 *   POST /api/auth/register { email, password, role } -> { user, token, expiresIn }
 *   POST /api/auth/login    { email, password }        -> { user, token }
 *   GET  /api/auth/me       (Bearer)                    -> { user }
 *
 * role vaut "organisateur" ou "participant". Il n'y a pas de champ
 * name cote auth-service : l'identite affichable est l'email.
 */

/**
 * Connecte un utilisateur et stocke le jeton JWT.
 *
 * @param {{email: string, password: string}} credentials
 * @returns {Promise<{token: string, user: object}>}
 */
export async function login({ email, password }) {
  const { data } = await apiClient.post('/auth/login', { email, password })
  if (data?.token) saveToken(data.token)
  return data
}

/**
 * Cree un compte et connecte directement l'utilisateur.
 *
 * @param {{email: string, password: string, role: "organisateur"|"participant"}} payload
 * @returns {Promise<{token: string, user: object}>}
 */
export async function register({ email, password, role }) {
  const { data } = await apiClient.post('/auth/register', { email, password, role })
  if (data?.token) saveToken(data.token)
  return data
}

/**
 * Deconnecte l'utilisateur (suppression du jeton cote client,
 * auth-service n'expose pas de route de deconnexion).
 */
export function logout() {
  removeToken()
}

/**
 * Recupere l'utilisateur authentifie courant aupres du backend.
 *
 * @returns {Promise<object|null>}
 */
export async function fetchCurrentUser() {
  const { data } = await apiClient.get('/auth/me')
  return data?.user ?? null
}

/**
 * Retourne l'utilisateur courant depuis le jeton decode,
 * sans appel reseau (id, email, role, iat, exp).
 *
 * @returns {object|null}
 */
export function getCurrentUser() {
  const token = getToken()
  if (!token) return null
  const payload = decodeToken(token)
  if (!payload) return null
  return { id: payload.id, email: payload.email, role: payload.role }
}
