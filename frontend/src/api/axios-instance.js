import apiClient from '../services/api.js'

/**
 * Mutateur Orval : reutilise l'instance Axios partagee (baseURL,
 * injection du jeton JWT, deconnexion automatique sur 401), voir
 * services/api.js. Le client genere par Orval dans src/api/generated/
 * (gitignore) n'est pas importe par l'application : les services
 * src/services/*.js restent la couche d'acces API ecrite a la main,
 * voir frontend/README.md. Ce fichier existe pour que
 * `npm run generate:api` reste executable (ADR 0011).
 */
export const customInstance = (config, options) => {
  return apiClient({ ...config, ...options }).then((response) => response.data)
}

export default customInstance
