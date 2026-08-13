import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEventStore } from '../eventStore'
import { useRegistrationStore } from '../registrationStore'
import { useAuthStore } from '../authStore'
import { useParticipantStore } from '../participantStore'

/**
 * Tests des stores Pinia, alignes sur les contrats reels des 4
 * microservices. Aucune donnee de repli/mock : une erreur API reste
 * une erreur observable dans store.error.
 */

vi.mock('../../services/eventService', () => ({
  getEvents: vi.fn(),
  getEventById: vi.fn(),
  getEventAvailability: vi.fn(),
  createEvent: vi.fn()
}))

vi.mock('../../services/registrationService', () => ({
  createRegistration: vi.fn(),
  cancelRegistration: vi.fn(),
  getEventRegistrations: vi.fn(),
  getParticipantRegistrations: vi.fn(),
  getGlobalStats: vi.fn()
}))

vi.mock('../../services/authService', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  fetchCurrentUser: vi.fn(),
  getCurrentUser: vi.fn()
}))

vi.mock('../../services/participantService', () => ({
  createParticipant: vi.fn(),
  getParticipants: vi.fn(),
  searchParticipants: vi.fn(),
  getParticipantById: vi.fn(),
  updateParticipant: vi.fn(),
  deleteParticipant: vi.fn()
}))

import { getEvents, getEventById, getEventAvailability, createEvent } from '../../services/eventService'
import { createRegistration, cancelRegistration, getEventRegistrations, getParticipantRegistrations, getGlobalStats } from '../../services/registrationService'
import { login, register, fetchCurrentUser } from '../../services/authService'
import { createParticipant, getParticipants, searchParticipants, getParticipantById, updateParticipant, deleteParticipant } from '../../services/participantService'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  window.localStorage.clear()
})

function makeValidJwt(payload) {
  const b64 = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ ...payload, exp: Math.floor(Date.now() / 1000) + 3600 })}.${b64('s')}`
}

const mockEvent = { id: 1, title: 'Conference IA', date: '2026-09-15T10:00:00.000Z', location: 'Dakar', maxCapacity: 100 }

describe('eventStore', () => {
  it('fetchEvents charge la page et la pagination', async () => {
    getEvents.mockResolvedValueOnce({ data: [mockEvent], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } })
    const store = useEventStore()
    const promise = store.fetchEvents()
    expect(store.loading).toBe(true)
    await promise
    expect(store.loading).toBe(false)
    expect(store.events).toHaveLength(1)
    expect(store.pagination.total).toBe(1)
  })

  it('fetchEvents propage l erreur sans repli local', async () => {
    getEvents.mockRejectedValueOnce(new Error('SERVICE_UNAVAILABLE'))
    const store = useEventStore()
    await store.fetchEvents()
    expect(store.events).toHaveLength(0)
    expect(store.error).toBe('SERVICE_UNAVAILABLE')
  })

  it('fetchEvents applique une recherche texte locale sur la page chargee', async () => {
    getEvents.mockResolvedValueOnce({
      data: [mockEvent, { ...mockEvent, id: 2, title: 'Atelier UX', location: 'Paris' }],
      pagination: {}
    })
    const store = useEventStore()
    await store.fetchEvents({ search: 'Paris' })
    expect(store.events).toHaveLength(1)
    expect(store.events[0].title).toBe('Atelier UX')
  })

  it('addEvent ajoute l evenement cree en tete de liste', async () => {
    createEvent.mockResolvedValueOnce({ ...mockEvent, id: 10, title: 'Nouveau' })
    const store = useEventStore()
    await store.addEvent({ title: 'Nouveau', date: mockEvent.date, location: 'Ziguinchor', maxCapacity: 30 })
    expect(store.events[0].title).toBe('Nouveau')
    expect(store.success).toBe('Evenement cree avec succes.')
  })

  it('addEvent capture l erreur backend et la propage', async () => {
    createEvent.mockRejectedValueOnce(new Error('title doit etre une chaine de 3 a 200 caracteres'))
    const store = useEventStore()
    await expect(store.addEvent({ title: 'IA' })).rejects.toThrow()
    expect(store.error).toContain('title doit etre')
    expect(store.events).toHaveLength(0)
  })

  it('fetchEventById charge l evenement et sa disponibilite en parallele', async () => {
    getEventById.mockResolvedValueOnce(mockEvent)
    getEventAvailability.mockResolvedValueOnce({ eventId: 1, maxCapacity: 100, registeredCount: 10, remainingSeats: 90, isFull: false })
    const store = useEventStore()
    await store.fetchEventById(1)
    expect(store.currentEvent.id).toBe(1)
    expect(store.currentAvailability.remainingSeats).toBe(90)
  })

  it('fetchEventById signale une erreur si l evenement est introuvable', async () => {
    getEventById.mockRejectedValueOnce(new Error('Evenement introuvable'))
    getEventAvailability.mockResolvedValueOnce(null)
    const store = useEventStore()
    await store.fetchEventById(999)
    expect(store.currentEvent).toBeNull()
    expect(store.error).toContain('introuvable')
  })
})

describe('registrationStore', () => {
  it('fetchMyRegistrations charge les inscriptions enrichies', async () => {
    getParticipantRegistrations.mockResolvedValueOnce({
      data: [{ id: 1, eventId: 1, participantId: 7, status: 'confirmee', event: { title: 'Conference IA' } }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
    })
    const store = useRegistrationStore()
    await store.fetchMyRegistrations(7)
    expect(store.registrations).toHaveLength(1)
    expect(store.confirmedRegistrations).toHaveLength(1)
  })

  it('register cree l inscription et l ajoute en tete de liste', async () => {
    createRegistration.mockResolvedValueOnce({ id: 1, eventId: 1, participantId: 7, status: 'confirmee' })
    const store = useRegistrationStore()
    await store.register(1, 7)
    expect(createRegistration).toHaveBeenCalledWith({ eventId: 1, participantId: 7 })
    expect(store.registrations[0].status).toBe('confirmee')
    expect(store.success).toBe('Inscription enregistree avec succes.')
  })

  it('register traduit EVENT_FULL en message lisible et ne masque pas l erreur', async () => {
    const err = new Error('Request failed')
    err.cause = { response: { data: { error: 'EVENT_FULL' } } }
    createRegistration.mockRejectedValueOnce(err)
    const store = useRegistrationStore()
    await expect(store.register(1, 7)).rejects.toThrow()
    expect(store.error).toBe('Cet evenement est complet.')
    expect(store.registrations).toHaveLength(0)
  })

  it('cancelRegistration met a jour la ligne annulee', async () => {
    getParticipantRegistrations.mockResolvedValueOnce({ data: [{ id: 1, eventId: 1, status: 'confirmee' }], pagination: {} })
    cancelRegistration.mockResolvedValueOnce({ id: 1, eventId: 1, status: 'annulee' })
    const store = useRegistrationStore()
    await store.fetchMyRegistrations(7)
    await store.cancelRegistration(1)
    expect(store.registrations[0].status).toBe('annulee')
    expect(store.success).toBe('Inscription annulee.')
  })

  it('fetchGlobalStats charge les statistiques globales', async () => {
    getGlobalStats.mockResolvedValueOnce({ totalRegistrations: 10, totalConfirmed: 8, totalCancelled: 2, byEvent: [{ eventId: 1, confirmedCount: 8 }] })
    const store = useRegistrationStore()
    await store.fetchGlobalStats()
    expect(store.globalStats.totalConfirmed).toBe(8)
  })

  it('fetchEventRegistrations charge la liste des inscrits', async () => {
    getEventRegistrations.mockResolvedValueOnce({ data: [{ id: 1, eventId: 1, status: 'confirmee' }], pagination: {} })
    const store = useRegistrationStore()
    await store.fetchEventRegistrations(1)
    expect(store.registrations).toHaveLength(1)
  })
})

describe('authStore', () => {
  it('login reussit et definit l utilisateur', async () => {
    login.mockResolvedValueOnce({ token: 'jwt', user: { id: 1, email: 'a@b.c', role: 'participant' } })
    searchParticipants.mockResolvedValueOnce([])
    const store = useAuthStore()
    await store.login('a@b.c', 'secret')
    expect(store.user.email).toBe('a@b.c')
    expect(store.success).toBe('Connexion reussie. Bienvenue !')
  })

  it('login capture l erreur et vide l utilisateur, jamais de session fictive', async () => {
    login.mockRejectedValueOnce(new Error('Identifiants incorrects'))
    const store = useAuthStore()
    store.user = { id: 1 }
    await expect(store.login('a@b.c', 'wrong')).rejects.toThrow()
    expect(store.user).toBeNull()
    expect(store.error).toContain('Identifiants incorrects')
  })

  it('register exige un role', async () => {
    const store = useAuthStore()
    await expect(store.register({ email: 'a@b.c', password: 'secret', role: '' })).rejects.toThrow()
    expect(store.error).toContain('role')
    expect(register).not.toHaveBeenCalled()
  })

  it('register reussit et definit l utilisateur', async () => {
    register.mockResolvedValueOnce({ token: 'jwt', user: { id: 2, email: 'awa@b.c', role: 'participant' } })
    searchParticipants.mockResolvedValueOnce([])
    const store = useAuthStore()
    await store.register({ email: 'awa@b.c', password: 'secret', role: 'participant' })
    expect(store.user.email).toBe('awa@b.c')
    expect(store.success).toBe('Compte cree avec succes.')
  })

  it('resolveParticipantProfile trouve le profil par email', async () => {
    searchParticipants.mockResolvedValueOnce([{ id: 7, name: 'Awa Diop', email: 'awa@b.c' }])
    const store = useAuthStore()
    store.user = { id: 1, email: 'awa@b.c', role: 'participant' }
    await store.resolveParticipantProfile()
    expect(store.participantId).toBe(7)
  })

  it('logout vide utilisateur, profil participant et statut', () => {
    const store = useAuthStore()
    store.user = { id: 1 }
    store.participantProfile = { id: 7 }
    store.success = 'ok'
    store.logout()
    expect(store.user).toBeNull()
    expect(store.participantProfile).toBeNull()
    expect(store.success).toBe('')
  })

  it('hydrateFromToken restaure l utilisateur depuis l API', async () => {
    fetchCurrentUser.mockResolvedValueOnce({ id: 1, email: 'a@b.c', role: 'organisateur' })
    const { saveToken } = await import('../../services/token')
    saveToken(makeValidJwt({ id: 1, email: 'a@b.c', role: 'organisateur' }))
    const store = useAuthStore()
    await store.hydrateFromToken()
    expect(store.user.role).toBe('organisateur')
  })

  it('isAuthenticated depend de user ou du jeton', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    store.user = { id: 1 }
    expect(store.isAuthenticated).toBe(true)
  })
})

describe('participantStore', () => {
  it('fetchParticipants charge une page', async () => {
    getParticipants.mockResolvedValueOnce({ data: [{ id: 1, name: 'Awa Diop' }], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } })
    const store = useParticipantStore()
    await store.fetchParticipants()
    expect(store.participants).toHaveLength(1)
  })

  it('searchParticipants remplit participants avec les resultats', async () => {
    searchParticipants.mockResolvedValueOnce([{ id: 2, name: 'Moussa Ba' }])
    const store = useParticipantStore()
    await store.searchParticipants({ name: 'Moussa' })
    expect(store.participants).toHaveLength(1)
  })

  it('fetchParticipantById charge un participant', async () => {
    getParticipantById.mockResolvedValueOnce({ id: 1, name: 'Awa Diop' })
    const store = useParticipantStore()
    await store.fetchParticipantById(1)
    expect(store.currentParticipant.name).toBe('Awa Diop')
  })

  it('fetchParticipantById propage l erreur sans repli local', async () => {
    getParticipantById.mockRejectedValueOnce(new Error('Participant introuvable'))
    const store = useParticipantStore()
    await store.fetchParticipantById(999)
    expect(store.currentParticipant).toBeNull()
    expect(store.error).toContain('introuvable')
  })

  it('createParticipant cree le profil', async () => {
    createParticipant.mockResolvedValueOnce({ id: 3, name: 'Nouveau' })
    const store = useParticipantStore()
    const created = await store.createParticipant({ name: 'Nouveau', email: 'n@b.c', type: 'etudiant' })
    expect(created.id).toBe(3)
    expect(store.success).toContain('cree')
  })

  it('updateParticipant met a jour le profil courant', async () => {
    updateParticipant.mockResolvedValueOnce({ id: 1, name: 'Nom modifie' })
    const store = useParticipantStore()
    store.currentParticipant = { id: 1, name: 'Ancien nom' }
    await store.updateParticipant(1, { name: 'Nom modifie' })
    expect(store.currentParticipant.name).toBe('Nom modifie')
  })

  it('removeParticipant retire le participant de la liste', async () => {
    deleteParticipant.mockResolvedValueOnce()
    const store = useParticipantStore()
    store.participants = [{ id: 1 }, { id: 2 }]
    await store.removeParticipant(1)
    expect(store.participants).toHaveLength(1)
  })
})
