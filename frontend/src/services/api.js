import axios from 'axios'
import { getToken, removeToken, hasToken } from './token.js'

/**
 * Instance Axios partagée par tous les services de l'application.
 *
 * L'URL de base du backend est définie par la variable
 * d'environnement VITE_API_BASE_URL (valeur par défaut : /api).
 * Elle est copiée dans .env à partir de .env.example.
 *
 * Configuration :
 * - baseURL : adresse de l'API (ex. /api, http://localhost:8080/api)
 * - timeout : 10 secondes par défaut
 * - headers : application/json
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

/**
 * Intercepteur de requête : injecte le jeton JWT dans l'en-tête
 * Authorization pour toutes les requêtes authentifiées.
 */
apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Intercepteur de réponse : 401 → déconnexion automatique
 * (session expirée ou jeton invalide) et redirection.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401 && hasToken()) {
      // Session expirée ou jeton invalide : déconnexion.
      removeToken()
      if (typeof window !== 'undefined') {
        window.location.href = '/login?session=expired'
      }
    }

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Une erreur réseau est survenue.'

    const enhancedError = new Error(message)
    enhancedError.status = status
    enhancedError.cause = error

    return Promise.reject(enhancedError)
  }
)

export default apiClient
