import { test, expect } from '@playwright/test'

/**
 * Tests E2E du frontend EventHub, contre l'application reelle et les
 * quatre microservices backend reels (aucun mock, voir
 * playwright.config.js). Chaque execution genere ses propres
 * comptes/donnees (suffixe unique) : le backend n'a pas de route de
 * reinitialisation.
 */

const RUN_ID = `${Date.now()}`
const ORGANISATEUR = { email: `orga.${RUN_ID}@dit.sn`, password: 'MotDePasse123!' }
const PARTICIPANT_USER = { email: `part.${RUN_ID}@dit.sn`, password: 'MotDePasse123!' }
const EVENT_TITLE = `Conference E2E ${RUN_ID}`

async function register(page, { email, password }, role) {
  await page.goto('/register')
  await page.locator(`input[type="radio"][value="${role}"]`).check({ force: true })
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.fill('#passwordConfirm', password)
  await page.getByRole('button', { name: "Creer mon compte" }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

async function login(page, { email, password }) {
  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

test.describe.serial('parcours complet', () => {
  test('1. accueil public affiche EventHub et les evenements', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toContainText('EventHub')
    await expect(page.getByRole('link', { name: /Decouvrir les evenements/ })).toBeVisible()
  })

  test('2. inscription organisateur puis creation d un evenement', async ({ page }) => {
    await register(page, ORGANISATEUR, 'organisateur')

    await page.goto('/dashboard/events')
    await page.getByRole('button', { name: /Creer un evenement/ }).click()
    await expect(page.getByRole('dialog')).toContainText('Creer un evenement')

    await page.fill('#event-title', EVENT_TITLE)
    await page.fill('#event-location', 'Amphi B, DIT, Dakar')
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const local = future.toISOString().slice(0, 16)
    await page.fill('#event-date', local)
    await page.fill('#event-capacity', '2')
    await page.getByRole('button', { name: "Creer l'evenement" }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })
    await expect(page.locator('body')).toContainText(EVENT_TITLE)
  })

  test('3. l evenement cree apparait dans la liste publique avec sa disponibilite', async ({ page }) => {
    await page.goto('/events')
    await expect(page.getByText(EVENT_TITLE)).toBeVisible({ timeout: 10000 })
    await page.getByText(EVENT_TITLE).click()
    await expect(page).toHaveURL(/\/events\/\d+/)
    await expect(page.locator('body')).toContainText('place')
  })

  test('4. inscription participant, creation du profil, inscription a l evenement', async ({ page }) => {
    await register(page, PARTICIPANT_USER, 'participant')

    // Pas encore de profil participant : creation proposee.
    await page.goto('/registrations')
    await page.getByRole('link', { name: /profil participant/ }).click()
    await expect(page).toHaveURL(/\/participants\/nouveau/)

    await page.fill('#participant-name', `Testeur E2E ${RUN_ID}`)
    await page.locator('#participant-email').fill(PARTICIPANT_USER.email)
    await page.selectOption('#participant-type', 'etudiant')
    await page.getByRole('button', { name: /Creer mon profil/ }).click()
    await expect(page).toHaveURL(/\/participants\/\d+/, { timeout: 10000 })

    await page.goto('/events')
    await page.getByText(EVENT_TITLE).click()
    await page.getByRole('link', { name: "S'inscrire" }).click()
    await expect(page).toHaveURL(/\/register$/)

    await page.getByRole('button', { name: "Confirmer l'inscription" }).click()
    await expect(page.getByRole('dialog')).toContainText('Inscription confirmee', { timeout: 10000 })
    await page.getByRole('button', { name: 'Voir mes inscriptions' }).click()
    await expect(page).toHaveURL(/\/registrations/, { timeout: 10000 })
    await expect(page.locator('body')).toContainText(EVENT_TITLE)
  })

  test('5. annulation de l inscription', async ({ page }) => {
    await login(page, PARTICIPANT_USER)
    await page.goto('/registrations')
    await expect(page.getByText(EVENT_TITLE)).toBeVisible({ timeout: 10000 })

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Annuler' }).click()
    await expect(page.getByText('Annulee').first()).toBeVisible({ timeout: 10000 })
  })

  test('6. session expiree redirige vers la connexion', async ({ page }) => {
    await login(page, PARTICIPANT_USER)
    await page.evaluate(() => window.localStorage.removeItem('eventhub_token'))
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
    expect(page.url()).toContain('redirect')
  })

  test('7. page inconnue affiche la 404', async ({ page }) => {
    await page.goto('/route-qui-n-existe-pas')
    await expect(page.locator('body')).toContainText('404')
  })
})
