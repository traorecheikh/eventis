import apiClient from './api.js'
import { saveToken, removeToken, getToken, decodeToken } from './token.js'

/**
 * Service d'accès à l'API auth-service.
 *
 * Endpoints (supposés — à confirmer par la documentation
 * Swagger/OpenAPI officielle de l'auth-service) :
 *   POST /api/auth/login    { email, password }  → { token, user }
 *   POST /api/auth/register { name, email, password } → { token, user }
 *   POST /api/auth/logout   (informatif côté client)
 *   GET  /api/auth/me       (Bearer)             → { user }
 *
 * Le jeton JWT est sauvegardé dans localStorage (token.js) et
 * injecté automatiquement dans l'en-tête Authorization par
 * l'instance Axios partagée (api.js).
 */

/**
 * Connecte un utilisateur et stocke le jeton JWT.
 *
 * @param {Object} credentials { email, password }
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function login(credentials) {
  const { email, password } = credentials
  const { data } = await apiClient.post('/auth/login', { email, password })

  if (data?.token) saveToken(data.token)
  return data
}

/**
 * Crée un compte et connecte directement l'utilisateur.
 *
 * @param {Object} payload { name, email, password }
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function register(payload) {
  const { data } = await apiClient.post('/auth/register', payload)

  if (data?.token) saveToken(data.token)
  return data
}

/**
 * Déconnecte l'utilisateur (suppression du jeton côté client).
 * Si le backend expose un endpoint de déconnexion, il pourra
 * être appelé ici avant de retirer le jeton.
 */
export async function logout() {
  removeToken()
}

/**
 * Récupère l'utilisateur authentifié courant.
 *
 * @returns {Promise<object|null>}
 */
export async function fetchCurrentUser() {
  try {
    const { data } = await apiClient.get('/auth/me')
    return data?.user ?? data ?? null
  } catch {
    return null
  }
}

/**
 * Retourne l'utilisateur courant depuis le jeton décodé,
 * sans appel réseau.
 *
 * @returns {object|null}
 */
export function getCurrentUser() {
  const token = getToken()
  if (!token) return null
  const payload = decodeToken(token)
  return payload?.user ?? payload ?? null
}
