import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mapEventPayload,
  mapApiResponse,
  createEvent,
  updateEvent,
  getEvents,
  deleteEvent,
  getEventById
} from '../eventService'
import apiClient from '../api'

/**
 * Tests du service événement (eventService.js).
 *
 * Vérifie :
 * - la normalisation exacte des champs attendus par le backend
 *   (name, eventDate, venue, maxCapacity — aucun champ inventé) ;
 * - les appels Axios vers les seuls endpoints réels ;
 * - la propagation des erreurs HTTP.
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

describe('mapEventPayload — conversion vers le format backend', () => {
  it('convertit les champs internes vers name, eventDate, venue, maxCapacity', () => {
    const payload = mapEventPayload({
      title: 'Conférence IA',
      date: '2026-09-15',
      location: 'Dakar',
      capacity: 100
    })
    expect(payload).toEqual({
      name: 'Conférence IA',
      eventDate: '2026-09-15',
      venue: 'Dakar',
      maxCapacity: 100
    })
    // Aucun champ fantaisiste ne doit être présent.
    expect(payload).not.toHaveProperty('title')
    expect(payload).not.toHaveProperty('date')
    expect(payload).not.toHaveProperty('location')
    expect(payload).not.toHaveProperty('capacity')
  })

  it('préfère les champs backend si présents', () => {
    const payload = mapEventPayload({
      name: 'Hackathon',
      eventDate: '2026-10-01',
      venue: 'Saint-Louis',
      maxCapacity: 50
    })
    expect(payload.name).toBe('Hackathon')
    expect(payload.eventDate).toBe('2026-10-01')
  })

  it('trimme les chaînes et vide les champs manquants', () => {
    const payload = mapEventPayload({ title: '  Atelier UX  ', location: ' ' })
    expect(payload.name).toBe('Atelier UX')
    expect(payload.venue).toBe('')
    expect(payload.eventDate).toBe('')
  })

  it('laisse maxCapacity undefined pour une capacité non numérique', () => {
    const payload = mapEventPayload({ capacity: 'illimité' })
    expect(payload.maxCapacity).toBeUndefined()
    expect(payload.name).toBe('')
  })

  it('accepte des données nulles sans planter', () => {
    expect(() => mapEventPayload(null)).not.toThrow()
    expect(() => mapEventPayload(undefined)).not.toThrow()
  })
})

describe('mapApiResponse — normalisation de la réponse API', () => {
  it('convertit la réponse backend vers le format interne', () => {
    const event = mapApiResponse({
      id: 3,
      name: 'Conférence IA',
      eventDate: '2026-09-15',
      venue: 'Dakar',
      maxCapacity: 100,
      currentParticipants: 20
    })
    expect(event).toMatchObject({
      id: 3,
      title: 'Conférence IA',
      date: '2026-09-15',
      location: 'Dakar',
      maxParticipants: 100,
      currentParticipants: 20,
      remainingSeats: 80
    })
  })

  it('gère des données partielles sans planter', () => {
    expect(() => mapApiResponse(null)).not.toThrow()
    expect(mapApiResponse(null).title).toBe('')
  })
})

describe('eventService — appels API (endpoints réels uniquement)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET /events retourne les données brutes', async () => {
    apiClient.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'A' }] })
    await expect(getEvents()).resolves.toEqual([{ id: 1, name: 'A' }])
    expect(apiClient.get).toHaveBeenCalledWith('/events')
  })

  it('GET /events/:id utilise l\'identifiant dans l\'URL', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { id: 7 } })
    await expect(getEventById(7)).resolves.toEqual({ id: 7 })
    expect(apiClient.get).toHaveBeenCalledWith('/events/7')
  })

  it('POST /events envoie exactement le payload backend', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { id: 2, name: 'B' } })
    await createEvent({
      title: 'Conférence IA',
      date: '2026-09-15',
      location: 'Dakar',
      capacity: 100
    })
    expect(apiClient.post).toHaveBeenCalledWith('/events', {
      name: 'Conférence IA',
      eventDate: '2026-09-15',
      venue: 'Dakar',
      maxCapacity: 100
    })
  })

  it('PUT /events/:id envoie l\'identifiant et le payload converti', async () => {
    apiClient.put.mockResolvedValueOnce({ data: { id: 2, name: 'C' } })
    await updateEvent(2, { name: 'C', eventDate: '2026-09-16', venue: 'Thiès', maxCapacity: 80 })
    expect(apiClient.put).toHaveBeenCalledWith('/events/2', {
      name: 'C',
      eventDate: '2026-09-16',
      venue: 'Thiès',
      maxCapacity: 80
    })
  })

  it('DELETE /events/:id utilise l\'identifiant dans l\'URL', async () => {
    apiClient.delete.mockResolvedValueOnce({ data: {} })
    await deleteEvent(5)
    expect(apiClient.delete).toHaveBeenCalledWith('/events/5')
  })

  it('propage les erreurs HTTP (404, 500) sans les masquer', async () => {
    const err404 = Object.assign(new Error('Not Found'), { status: 404 })
    apiClient.get.mockRejectedValueOnce(err404)
    await expect(getEvents()).rejects.toMatchObject({ status: 404 })
  })
})
