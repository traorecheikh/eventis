/**
 * Gestion centralisée du jeton JWT.
 *
 * Le jeton est stocké dans localStorage sous la clé `eventhub_token`.
 * Ce module centralise toutes les opérations afin qu'aucun composant
 * ne manipule directement le stockage ou le format du jeton.
 *
 * Remarque : les endpoints exacts seront adaptés lorsque les
 * documentations Swagger/OpenAPI officielles seront fournies.
 */
export const TOKEN_KEY = 'eventhub_token'

/**
 * Sauvegarde le jeton JWT (et la date de réception).
 *
 * @param {string} token - Jeton JWT retourné par le backend
 */
export function saveToken(token) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
    window.localStorage.setItem(`${TOKEN_KEY}_saved_at`, String(Date.now()))
  } catch {
    // Le stockage local peut être indisponible (mode privé, quota).
  }
}

/**
 * Retourne le jeton courant, ou `null` s'il est absent ou expiré.
 *
 * @returns {string|null}
 */
export function getToken() {
  const token = window.localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  if (isTokenExpired(token)) {
    removeToken()
    return null
  }
  return token
}

/**
 * Supprime le jeton (déconnexion côté client).
 */
export function removeToken() {
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(`${TOKEN_KEY}_saved_at`)
}

/**
 * Indique si le jeton est présent (sans vérifier l'expiration).
 *
 * @returns {boolean}
 */
export function hasToken() {
  return Boolean(window.localStorage.getItem(TOKEN_KEY))
}

/**
 * Décodage de la charge utile du JWT (partie payload, sans
 * vérification cryptographique : celle-ci appartient au backend).
 *
 * @param {string} token
 * @returns {object|null}
 */
export function decodeToken(token) {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * Vérifie l'expiration du jeton.
 *
 * Le champ standard `exp` (Unix timestamp) est prioritaire ;
 * sinon la durée de stockage dépasse 24 heures.
 *
 * @param {string} token
 * @returns {boolean} true si le jeton est expiré
 */
export function isTokenExpired(token) {
  const payload = decodeToken(token)
  if (payload?.exp) {
    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  }
  const savedAt = Number(window.localStorage.getItem(`${TOKEN_KEY}_saved_at`) || 0)
  if (!savedAt) return true
  return Date.now() - savedAt > 24 * 60 * 60 * 1000
}
