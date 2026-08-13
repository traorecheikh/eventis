import { describe, it, expect, beforeEach } from 'vitest'
import {
  TOKEN_KEY,
  saveToken,
  getToken,
  removeToken,
  hasToken,
  decodeToken,
  isTokenExpired
} from '../token'

/**
 * Tests du module de gestion du jeton JWT (token.js).
 *
 * Ces tests couvrent la base de l'authentification : stockage,
 * décodage du payload JWT, vérification d'expiration, déconnexion.
 */

function makeJwt(payload, secret = 'secret') {
  const b64 = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.${b64(secret)}`
}

describe('token.js : gestion du jeton JWT', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('sauvegarde le jeton sous la clé eventhub_token', () => {
    saveToken('jwt.abc')
    expect(window.localStorage.getItem(TOKEN_KEY)).toBe('jwt.abc')
    expect(window.localStorage.getItem(`${TOKEN_KEY}_saved_at`)).toBeTruthy()
  })

  it('récupère un jeton valide', () => {
    saveToken('jwt.valid')
    expect(getToken()).toBe('jwt.valid')
  })

  it('a un token après sauvegarde et plus après suppression', () => {
    saveToken('jwt.valid')
    expect(hasToken()).toBe(true)
    removeToken()
    expect(hasToken()).toBe(false)
    expect(getToken()).toBeNull()
  })

  it('retourne null quand aucun jeton n\'est présent', () => {
    expect(getToken()).toBeNull()
    expect(hasToken()).toBe(false)
  })

  it('considère un jeton expiré (champ exp) comme absent et le supprime', () => {
    const expired = makeJwt({ sub: 1, exp: Math.floor(Date.now() / 1000) - 3600 })
    saveToken(expired)
    expect(isTokenExpired(expired)).toBe(true)
    expect(getToken()).toBeNull()
    expect(hasToken()).toBe(false)
  })

  it('accepte un jeton non expiré (champ exp dans le futur)', () => {
    const valid = makeJwt({ sub: 1, exp: Math.floor(Date.now() / 1000) + 3600 })
    saveToken(valid)
    expect(getToken()).toBe(valid)
  })

  it('expire un jeton sans exp conservé plus de 24 h', () => {
    const noExp = makeJwt({ sub: 1 })
    window.localStorage.setItem(TOKEN_KEY, noExp)
    window.localStorage.setItem(
      `${TOKEN_KEY}_saved_at`,
      String(Date.now() - 25 * 60 * 60 * 1000)
    )
    expect(isTokenExpired(noExp)).toBe(true)
    expect(getToken()).toBeNull()
  })

  it('accepte un jeton sans exp conservé moins de 24 h', () => {
    const noExp = makeJwt({ sub: 1 })
    saveToken(noExp)
    expect(getToken()).toBe(noExp)
  })

  it('décode la charge utile d\'un JWT standard', () => {
    const payload = { sub: 1, name: 'Awa Diop', role: 'Participant' }
    const token = makeJwt(payload)
    expect(decodeToken(token)).toEqual(payload)
  })

  it('retourne null pour un jeton invalide ou malformé', () => {
    expect(decodeToken('not.a.valid.token.abc')).toBeNull()
    expect(decodeToken('')).toBeNull()
  })
})
