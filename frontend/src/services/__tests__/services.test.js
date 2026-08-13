import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, register, logout, fetchCurrentUser, getCurrentUser } from '../authService'
import { getEvents, getEventById, getEventAvailability, createEvent } from '../eventService'
import {
  createParticipant,
  getParticipants,
  searchParticipants,
  getParticipantById,
  updateParticipant,
  deleteParticipant
} from '../participantService'
import {
  createRegistration,
  cancelRegistration,
  getEventRegistrations,
  getParticipantRegistrations,
  getEventStats,
  getGlobalStats
} from '../registrationService'
import apiClient from '../api'

/**
 * Tests des services API, alignes sur les contrats reels des 4
 * microservices (knowledge-base/api/*.md). Aucun endpoint invente.
 */

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
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
      data: { token: 'jwt.token.here', user: { id: 1, email: 'a@b.c', role: 'participant' } }
    })
    const result = await login({ email: 'a@b.c', password: 'secret' })
    expect(result.user).toEqual({ id: 1, email: 'a@b.c', role: 'participant' })
    expect(window.localStorage.getItem('eventhub_token')).toBe('jwt.token.here')
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.c', password: 'secret' })
  })

  it('POST /auth/register envoie { email, password, role }, sans champ name', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { token: 'jwt2', user: { id: 2 } } })
    await register({ email: 'awa@b.c', password: 'secret', role: 'organisateur' })
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      email: 'awa@b.c',
      password: 'secret',
      role: 'organisateur'
    })
  })

  it('logout supprime le jeton local', () => {
    window.localStorage.setItem('eventhub_token', 'jwt')
    logout()
    expect(window.localStorage.getItem('eventhub_token')).toBeNull()
  })

  it('fetchCurrentUser retourne data.user aupres de GET /auth/me', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { user: { id: 1, email: 'a@b.c', role: 'participant' } } })
    await expect(fetchCurrentUser()).resolves.toEqual({ id: 1, email: 'a@b.c', role: 'participant' })
    expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
  })

  it('getCurrentUser decode id/email/role depuis un jeton valide', () => {
    const token = makeJwt({
      id: 1,
      email: 'awa@b.c',
      role: 'participant',
      exp: Math.floor(Date.now() / 1000) + 3600
    })
    window.localStorage.setItem('eventhub_token', token)
    expect(getCurrentUser()).toEqual({ id: 1, email: 'awa@b.c', role: 'participant' })
    window.localStorage.removeItem('eventhub_token')
    expect(getCurrentUser()).toBeNull()
  })

  it('getCurrentUser ignore un jeton expire', () => {
    const token = makeJwt({ id: 1, email: 'awa@b.c', role: 'participant', exp: Math.floor(Date.now() / 1000) - 3600 })
    window.localStorage.setItem('eventhub_token', token)
    expect(getCurrentUser()).toBeNull()
    expect(window.localStorage.getItem('eventhub_token')).toBeNull()
  })
})

describe('eventService', () => {
  it('GET /events transmet page/limit et retourne { data, pagination }', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { data: [{ id: 1 }], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } } })
    const result = await getEvents({ page: 2, limit: 10 })
    expect(apiClient.get).toHaveBeenCalledWith('/events', { params: { page: 2, limit: 10 } })
    expect(result.data).toEqual([{ id: 1 }])
  })

  it('GET /events/:id retourne l evenement', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { id: 5, title: 'Conference' } })
    await expect(getEventById(5)).resolves.toEqual({ id: 5, title: 'Conference' })
    expect(apiClient.get).toHaveBeenCalledWith('/events/5')
  })

  it('GET /events/:id/availability retourne la disponibilite', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { eventId: 5, maxCapacity: 10, registeredCount: 3, remainingSeats: 7, isFull: false } })
    await expect(getEventAvailability(5)).resolves.toEqual({ eventId: 5, maxCapacity: 10, registeredCount: 3, remainingSeats: 7, isFull: false })
    expect(apiClient.get).toHaveBeenCalledWith('/events/5/availability')
  })

  it('POST /events envoie exactement title/description/date/location/maxCapacity', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { id: 9 } })
    await createEvent({ title: ' Conference IA ', date: '2099-01-01T00:00:00.000Z', location: 'Dakar', maxCapacity: '50' })
    expect(apiClient.post).toHaveBeenCalledWith('/events', {
      title: 'Conference IA',
      description: undefined,
      date: '2099-01-01T00:00:00.000Z',
      location: 'Dakar',
      maxCapacity: 50
    })
  })
})

describe('participantService', () => {
  it('POST /participants envoie name/email/phone/type', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { id: 1 } })
    await createParticipant({ name: ' Awa Diallo ', email: 'awa@dit.sn', type: 'etudiant' })
    expect(apiClient.post).toHaveBeenCalledWith('/participants', {
      name: 'Awa Diallo',
      email: 'awa@dit.sn',
      phone: undefined,
      type: 'etudiant'
    })
  })

  it('GET /participants transmet page/limit/type', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { data: [], pagination: {} } })
    await getParticipants({ page: 1, limit: 20, type: 'etudiant' })
    expect(apiClient.get).toHaveBeenCalledWith('/participants', { params: { page: 1, limit: 20, type: 'etudiant' } })
  })

  it('GET /participants/search retourne data.data', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { data: [{ id: 2 }] } })
    await expect(searchParticipants({ email: 'awa@dit.sn' })).resolves.toEqual([{ id: 2 }])
    expect(apiClient.get).toHaveBeenCalledWith('/participants/search', { params: { email: 'awa@dit.sn' } })
  })

  it('GET /participants/:id retourne le participant', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { id: 5 } })
    await expect(getParticipantById(5)).resolves.toEqual({ id: 5 })
    expect(apiClient.get).toHaveBeenCalledWith('/participants/5')
  })

  it('PUT /participants/:id transmet les champs fournis', async () => {
    apiClient.put.mockResolvedValueOnce({ data: { id: 5, name: 'Nouveau nom' } })
    await updateParticipant(5, { name: 'Nouveau nom' })
    expect(apiClient.put).toHaveBeenCalledWith('/participants/5', { name: 'Nouveau nom' })
  })

  it('DELETE /participants/:id', async () => {
    apiClient.delete.mockResolvedValueOnce({})
    await deleteParticipant(5)
    expect(apiClient.delete).toHaveBeenCalledWith('/participants/5')
  })
})

describe('registrationService', () => {
  it('POST /registrations envoie eventId + participantId (nombres)', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { id: 12 } })
    const result = await createRegistration({ eventId: '3', participantId: '7' })
    expect(apiClient.post).toHaveBeenCalledWith('/registrations', { eventId: 3, participantId: 7 })
    expect(result).toEqual({ id: 12 })
  })

  it('DELETE /registrations/:id annule et retourne l inscription mise a jour', async () => {
    apiClient.delete.mockResolvedValueOnce({ data: { id: 9, status: 'annulee' } })
    await expect(cancelRegistration(9)).resolves.toEqual({ id: 9, status: 'annulee' })
    expect(apiClient.delete).toHaveBeenCalledWith('/registrations/9')
  })

  it('GET /registrations/event/:eventId transmet les parametres', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { data: [], pagination: {} } })
    await getEventRegistrations(3, { status: 'confirmee', page: 1, limit: 20, enrich: true })
    expect(apiClient.get).toHaveBeenCalledWith('/registrations/event/3', {
      params: { status: 'confirmee', page: 1, limit: 20, enrich: true }
    })
  })

  it('GET /registrations/participant/:participantId transmet les parametres', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { data: [], pagination: {} } })
    await getParticipantRegistrations(7, { page: 1, limit: 20 })
    expect(apiClient.get).toHaveBeenCalledWith('/registrations/participant/7', {
      params: { status: undefined, page: 1, limit: 20, enrich: true }
    })
  })

  it('GET /registrations/stats/event/:eventId', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { eventId: 3, confirmedCount: 4, cancelledCount: 1, totalCount: 5 } })
    await expect(getEventStats(3)).resolves.toEqual({ eventId: 3, confirmedCount: 4, cancelledCount: 1, totalCount: 5 })
  })

  it('GET /registrations/stats', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { totalRegistrations: 10, totalConfirmed: 8, totalCancelled: 2, byEvent: [] } })
    await expect(getGlobalStats()).resolves.toEqual({ totalRegistrations: 10, totalConfirmed: 8, totalCancelled: 2, byEvent: [] })
  })
})

/**
 * Utilitaire : cree un JWT minimal dont le payload est lisible par
 * decodeToken (base64url).
 */
function makeJwt(payload) {
  const b64 = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.${b64('s')}`
}
