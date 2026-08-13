import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Tests de la configuration de navigation.
 *
 * Le router est instancié en mémoire pour vérifier :
 * - la présence des routes métier ;
 * - les routes protégées (meta.requiresAuth, y compris sur les parents) ;
 * - la redirection des visiteurs non connectés vers /login ;
 * - la redirection d'un utilisateur connecté hors de /login ;
 * - la route de secours 404.
 *
 * Les routes sont importées depuis le module source (export par
 * défaut) mais le router est recréé en mémoire pour éviter le garde
 * global de navigation (créé dans le module) : le garde est testé
 * dans les tests « beforeEach » ci-dessous en important le module
 * complet.
 */

import routerModule from '../index.js'

/**
 * Le module exporte le router par défaut (le garde global y est
 * déjà enregistré). Les routes sont lues via getRoutes() pour ne pas
 * dépendre d'un export interne non nommé.
 */
const routerInstance = routerModule.default || routerModule
const routes = routerInstance.options?.routes ?? []

describe('routes', () => {
  it('déclare les routes métier principales', () => {
    const paths = routerInstance
      .getRoutes()
      .map((record) => record.path)
    expect(paths).toContain('/')
    expect(paths).toContain('/login')
    expect(paths).toContain('/register')
    expect(paths).toContain('/events')
    expect(paths).toContain('/events/:id')
    expect(paths).toContain('/events/:id/edit')
    expect(paths).toContain('/registrations')
    expect(paths).toContain('/participants/:id')
    expect(paths).toContain('/dashboard')
  })

  it('marque les pages privées avec meta.requiresAuth', () => {
    // Mes inscriptions (route enfant marquée explicitement).
    const registrations = routerInstance
      .getRoutes()
      .find((record) => record.name === 'my-registrations')
    expect(registrations?.meta?.requiresAuth).toBe(true)
    // L'espace tableau de bord : la protection est portée par le
    // parent (le record enfant n'hérite pas de meta via getRoutes,
    // mais le garde utilise to.matched.some qui résout les parents).
    const dashboardParent = routes.find((route) => route.path === '/dashboard')
    expect(dashboardParent?.meta?.requiresAuth).toBe(true)
    // Les pages publiques ne demandent pas d'authentification.
    const events = routerInstance
      .getRoutes()
      .find((record) => record.name === 'events')
    expect(events?.meta?.requiresAuth).toBeFalsy()
    const login = routerInstance
      .getRoutes()
      .find((record) => record.name === 'login')
    expect(login?.meta?.requiresAuth).toBeFalsy()
  })

  it('déclare une route fourre-tout 404', () => {
    const notFound = routerInstance
      .getRoutes()
      .find((record) => record.name === 'not-found')
    expect(notFound).toBeTruthy()
  })
})

import { getToken } from '../../services/token.js'

describe('garde de navigation (beforeEach)', () => {
  // Le garde global lit le jeton via token.js → localStorage avec
  // la clé TOKEN_KEY. On simule la valeur retournée par getToken().
  function setToken(token) {
    vi.mocked(getToken).mockReturnValue(token)
  }

  vi.mock('../../services/token.js', () => ({
    getToken: vi.fn(() => null),
    isTokenExpired: vi.fn(() => false),
    saveToken: vi.fn(),
    removeToken: vi.fn(),
    getCurrentUser: vi.fn(() => null)
  }))

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('redirige vers /login quand un visiteur non connecté accède au tableau de bord', async () => {
    setToken(null)
    await routerInstance.push('/dashboard')
    expect(routerInstance.currentRoute.value.path).toBe('/login')
    expect(routerInstance.currentRoute.value.query.redirect).toBe('/dashboard')
  })

  it('redirige vers /login quand un visiteur accède à ses inscriptions sans jeton', async () => {
    setToken(null)
    await routerInstance.push('/registrations')
    expect(routerInstance.currentRoute.value.path).toBe('/login')
    expect(routerInstance.currentRoute.value.query.redirect).toBe('/registrations')
  })

  it('autorise l\'accès quand un jeton valide est présent', async () => {
    setToken('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.signature')
    await routerInstance.push('/dashboard')
    expect(routerInstance.currentRoute.value.path).toBe('/dashboard')
  })

  it('renvoie un utilisateur connecté hors de la page de connexion', async () => {
    setToken('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.signature')
    await routerInstance.push('/login')
    expect(routerInstance.currentRoute.value.path).toBe('/dashboard')
  })

  it('renvoie vers la destination demandée si elle est précisée', async () => {
    setToken('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.signature')
    await routerInstance.push('/login?redirect=/registrations')
    expect(routerInstance.currentRoute.value.path).toBe('/registrations')
  })

  it('redirige les routes inconnues vers la page 404', async () => {
    setToken(null)
    await routerInstance.push('/chemin-inexistant')
    expect(routerInstance.currentRoute.value.name).toBe('not-found')
  })
})
