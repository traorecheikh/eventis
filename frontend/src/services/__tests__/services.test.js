import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, register, logout, fetchCurrentUser, getCurrentUser } from '../authService'
import {
  getRegistrations,
  createRegistration,
  cancelRegistration
} from '../registrationService'
import { getParticipants, getParticipantById } from '../participantService'
import { mapRegistrationPayload } from '../registrationMapper'
import apiClient from '../api'

/**
 * Tests des services API (auth, registrations, participants).
 *
 * Aucun endpoint inventé : seuls les chemins réels du code source
 * sont testés :
 * - POST /auth/login, /auth/register, /auth/logout
 * - GET  /auth/me
 * - GET/POST /registrations, DELETE /registrations/:id
 * - GET  /participants, /participants/:id
 */

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } }
  }
}))

beforeEach(() => {
  vi.clearAllMocks()
  window.localStorage.clear()
})

describe('authService', () => {
  it('POST /auth/login stocke le jeton et retourne data', async () => {
    apiClient.post.mockResolvedValueOnce({
      data: { token: 'jwt.token.here', user: { id: 1, email: 'a@b.c' } }
    })
    const result = await login({ email: 'a@b.c', password: 'secret' })
    expect(result).toEqual({ token: 'jwt.token.here', user: { id: 1, email: 'a@b.c' } })
    expect(window.localStorage.getItem('eventhub_token')).toBe('jwt.token.here')
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'a@b.c',
      password: 'secret'
    })
  })

  it('POST /auth/register envoie { name, email, password }', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { token: 'jwt2' } })
    await register({ name: 'Awa Diop', email: 'awa@b.c', password: 'secret' })
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Awa Diop',
      email: 'awa@b.c',
      password: 'secret'
    })
  })

  it('logout supprime le jeton local', async () => {
    window.localStorage.setItem('eventhub_token', 'jwt')
    await logout()
    expect(window.localStorage.getItem('eventhub_token')).toBeNull()
  })

  it('fetchCurrentUser retourne data.user ou data, null en cas d\'erreur', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { user: { id: 1 } } })
    await expect(fetchCurrentUser()).resolves.toEqual({ id: 1 })
    vi.clearAllMocks()
    apiClient.get.mockResolvedValueOnce({ data: { id: 2 } })
    await expect(fetchCurrentUser()).resolves.toEqual({ id: 2 })
    vi.clearAllMocks()
    apiClient.get.mockRejectedValueOnce(new Error('500'))
    await expect(fetchCurrentUser()).resolves.toBeNull()
    expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
  })

  it('getCurrentUser décode l\'utilisateur depuis un jeton valide', () => {
    const token = makeJwt({
      sub: 1,
      name: 'Awa',
      // Champ exp dans le futur pour que getToken() ne rejette pas le jeton.
      exp: Math.floor(Date.now() / 1000) + 3600
    })
    window.localStorage.setItem('eventhub_token', token)
    expect(getCurrentUser()).toEqual({
      sub: 1,
      name: 'Awa',
      exp: expect.any(Number)
    })
    window.localStorage.removeItem('eventhub_token')
    expect(getCurrentUser()).toBeNull()
  })

  it('getCurrentUser ignore un jeton expiré', () => {
    const token = makeJwt({
      sub: 1,
      name: 'Awa',
      exp: Math.floor(Date.now() / 1000) - 3600
    })
    window.localStorage.setItem('eventhub_token', token)
    expect(getCurrentUser()).toBeNull()
    expect(window.localStorage.getItem('eventhub_token')).toBeNull()
  })
})

describe('registrationService', () => {
  it('GET /registrations normalise tableau direct ou data.registrations', async () => {
    apiClient.get.mockResolvedValueOnce({ data: [{ id: 10 }] })
    await expect(getRegistrations()).resolves.toEqual([{ id: 10 }])
    vi.clearAllMocks()
    apiClient.get.mockResolvedValueOnce({ data: { registrations: [{ id: 11 }] } })
    await expect(getRegistrations()).resolves.toEqual([{ id: 11 }])
    expect(apiClient.get).toHaveBeenCalledWith('/registrations')
  })

  it('POST /registrations envoie le payload mappé (eventId + participant)', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { id: 12 } })
    const result = await createRegistration({
      eventId: 3,
      participant: {
        fullName: 'Awa Diop',
        email: 'awa@b.c',
        phone: '+221770000000',
        dietaryRequirements: 'Végétarien'
      }
    })
    expect(apiClient.post).toHaveBeenCalledWith('/registrations', {
      eventId: 3,
      participant: {
        fullName: 'Awa Diop',
        email: 'awa@b.c',
        phone: '+221770000000',
        dietaryRequirements: 'Végétarien'
      }
    })
    expect(result).toEqual({ id: 12 })
  })

  it('DELETE /registrations/:id utilise l\'identifiant', async () => {
    apiClient.delete.mockResolvedValueOnce({ data: {} })
    await cancelRegistration(9)
    expect(apiClient.delete).toHaveBeenCalledWith('/registrations/9')
  })
})

describe('participantService', () => {
  it('GET /participants normalise data.participants ou tableau direct', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { participants: [{ id: 1 }] } })
    await expect(getParticipants()).resolves.toEqual([{ id: 1 }])
    vi.clearAllMocks()
    apiClient.get.mockResolvedValueOnce({ data: [{ id: 2 }] })
    await expect(getParticipants()).resolves.toEqual([{ id: 2 }])
  })

  it('GET /participants/:id retourne data.participant ou data', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { participant: { id: 5 } } })
    await expect(getParticipantById(5)).resolves.toEqual({ id: 5 })
    expect(apiClient.get).toHaveBeenCalledWith('/participants/5')
  })
})

describe('mapRegistrationPayload — mappage exact du formulaire', () => {
  it('convertit les champs plats vers eventId + participant', () => {
    const payload = mapRegistrationPayload({
      eventId: 3,
      fullName: ' Awa Diop ',
      email: 'awa@b.c',
      phone: ' ',
      dietary: 'Végétarien'
    })
    expect(payload).toEqual({
      eventId: 3,
      participant: {
        fullName: 'Awa Diop',
        email: 'awa@b.c',
        phone: '',
        dietaryRequirements: 'Végétarien'
      }
    })
  })

  it('accepte un payload déjà imbriqué', () => {
    const payload = mapRegistrationPayload({
      eventId: 3,
      participant: { fullName: 'X', email: 'x@y.z' }
    })
    expect(payload.participant.fullName).toBe('X')
    expect(payload.eventId).toBe(3)
  })

  it('convertit eventId en nombre', () => {
    expect(mapRegistrationPayload({ eventId: '7' }).eventId).toBe(7)
  })
})

/**
 * Utilitaire : crée un JWT minimal dont le payload est lisible
 * par decodeToken (base64url).
 */
function makeJwt(payload) {
  const b64 = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.${b64('s')}`
}
