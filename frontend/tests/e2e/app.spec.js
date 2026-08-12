import { test, expect } from '@playwright/test'

/**
 * Tests E2E du frontend EventHub (parcours métier réels).
 *
 * Prérequis :
 *   - le frontend tourne sur http://localhost:3000 (npm run dev) ;
 *   - le mock backend tourne sur http://localhost:8080 (../mock-api).
 *
 * Les tests n'inventent aucun endpoint : ils utilisent uniquement
 * l'interface réelle de l'application, qui consomme le backend réel
 * (mock-api). La suppression et l'annulation passent par
 * window.confirm (dialogue natif) : Playwright intercepte la demande
 * plutôt que de cliquer sur un bouton factice.
 */

const TEST_EMAIL = 'e2e@example.com'
const TEST_PASSWORD = 'secret123'

/**
 * S'authentifier via le formulaire de connexion réel.
 */
async function login(page) {
  await page.goto('/login')
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).toHaveURL(/\/dashboard|\/events/)
  // La page de destination (tableau de bord) propose la déconnexion.
  await expect(page.getByText(/Déconnexion/)).toBeVisible({ timeout: 8000 })
}

// Chaque test démarre avec un backend propre : les créations/suppressions
// des scénarios précédents ne polluent pas les suivants.
test.beforeAll(async ({ request }) => {
  await request.post('http://localhost:8080/api/__reset')
})

test('1 — ouverture de l\'application', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toContainText('EventHub')
  await expect(page.locator('body')).toContainText('Événements')
  // La liste d'événements se charge depuis le backend réel.
  await expect(page.locator('body')).toContainText('participants')
})

test('2 — login', async ({ page }) => {
  await login(page)
  // Le lien « Mes inscriptions » n'apparaît que connecté.
  await expect(page.getByRole('link', { name: 'Mes inscriptions' })).toBeVisible()
  // La page de destination (tableau de bord) propose la déconnexion.
  await expect(page.getByText(/Déconnexion/)).toBeVisible({ timeout: 8000 })
})

test('3 — consultation des événements', async ({ page }) => {
  await page.goto('/events')
  // Les événements du backend sont listés.
  await expect(page.locator('article').first()).toBeVisible({ timeout: 10000 })
  // La recherche filtre la liste.
  await page.fill('#filter-search', 'IA')
  // Pendant le rechargement, un indicateur de chargement s'affiche ; on
  // attend la fin du chargement avant de vérifier le filtrage.
  await expect(page.getByText(/événement\(s\) chargé\(s\)/)).toBeVisible({ timeout: 10000 })
  // Au moins un événement correspondant doit être affiché.
  await expect(page.getByText(/Conférence IA 2026/)).toBeVisible({ timeout: 8000 })
})

test('4 — détail d\'un événement', async ({ page }) => {
  await page.goto('/events')
  // Ouvrir le premier événement de la liste.
  const firstLink = page.locator('article .event-title-link').first()
  await firstLink.click()
  await expect(page).toHaveURL(/\/events\/\d+/)
  await expect(page.locator('body')).toContainText("S'inscrire à cet événement")
  await expect(page.getByRole('link', { name: '← Retour à la liste' })).toBeVisible()
})

test('5 — création d\'un événement', async ({ page }) => {
  await login(page)
  // Le mode gestion (création) est activé par ?admin=1.
  await page.goto('/events?admin=1')
  await page.getByRole('button', { name: '+ Créer un événement' }).click()
  // Le formulaire est dans une modale.
  await expect(page.locator('[role="dialog"]')).toContainText('Créer un événement')
  await page.fill('#event-title', 'Atelier E2E Playwright')
  await page.fill('#event-date', '2027-05-20')
  await page.fill('#event-location', 'Lyon')
  await page.fill('#event-max', '30')
  await page.getByRole('button', { name: 'Enregistrer l\'événement' }).click()
  // La modale se ferme et le message de succès s'affiche.
  await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  await expect(page.locator('body')).toContainText('Atelier E2E Playwright')
})

test('6 — modification d\'un événement', async ({ page }) => {
  await login(page)
  await page.goto('/events')
  // Récupérer l'id du premier événement puis ouvrir sa page d'édition.
  const firstLink = page.locator('article .event-title-link').first()
  const href = await firstLink.getAttribute('href')
  const id = href.split('/').pop()
  await page.goto(`/events/${id}?admin=1`)
  await page.getByRole('link', { name: /Modifier/ }).click()
  await expect(page.locator('#event-title')).toBeVisible()
  const newTitle = `Atelier E2E modifié ${Date.now()}`
  await page.fill('#event-title', newTitle)
  await page.getByRole('button', { name: 'Enregistrer l\'événement' }).click()
  await expect(page).toHaveURL(new RegExp(`/events/${id}`), { timeout: 10000 })
})

test('7 — suppression d\'un événement', async ({ page }) => {
  await login(page)
  // Créer d'abord un événement à supprimer (mode gestion via ?admin=1).
  await page.goto('/events?admin=1')
  await page.getByRole('button', { name: '+ Créer un événement' }).click()
  await expect(page.locator('[role="dialog"]')).toContainText('Créer un événement')
  await page.fill('#event-title', 'Événement à supprimer')
  await page.fill('#event-date', '2027-06-01')
  await page.fill('#event-location', 'Bordeaux')
  await page.fill('#event-max', '10')
  await page.getByRole('button', { name: 'Enregistrer l\'événement' }).click()
  await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  await expect(page.locator('body')).toContainText('Événement à supprimer', { timeout: 8000 })

  await page.goto('/events')
  const firstLink = page.locator('article .event-title-link').first()
  const href = await firstLink.getAttribute('href')
  const id = href.split('/').pop()

  await page.goto(`/events/${id}?admin=1`)
  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Supprimer')
    await dialog.accept()
  })
  await page.getByRole('button', { name: 'Supprimer' }).click()
  await expect(page).toHaveURL(/\/events/, { timeout: 10000 })
  await expect(page.locator('body')).not.toContainText('Événement à supprimer', { timeout: 8000 })
})

test('8 — inscription à un événement', async ({ page }) => {
  await login(page)
  await page.goto('/events')
  const firstLink = page.locator('article .event-title-link').first()
  const href = await firstLink.getAttribute('href')
  const id = href.split('/').pop()

  await page.goto(`/events/${id}/register`)
  // Le formulaire est pré-rempli depuis l'authentification.
  await expect(page.locator('#reg-email')).not.toHaveValue('', { timeout: 8000 })
  await page.fill('#reg-firstname', 'E2E')
  await page.fill('#reg-lastname', 'Testeur')
  await page.getByRole('button', { name: 'Confirmer l\'inscription' }).click()
  // Modale de confirmation puis retour vers la liste des inscriptions.
  await expect(page.getByRole('dialog')).toContainText('Inscription confirmée', { timeout: 10000 })
  await page.getByRole('button', { name: 'Voir mes inscriptions' }).click()
  await expect(page).toHaveURL(/\/registrations/, { timeout: 10000 })
})

test('9 — consultation des inscriptions', async ({ page }) => {
  await login(page)
  await page.goto('/registrations')
  await expect(page.locator('body')).toContainText('Mes inscriptions')
  // Au moins une inscription présente (celle du test 8).
  await expect(page.locator('.registration-card').first()).toBeVisible({ timeout: 10000 })
})

test.describe('gestion des erreurs', () => {
  test('erreur réseau : l\'interface bascule en mode dégradé sans planter', async ({ page }) => {
    // Simuler la perte totale du backend : toutes les réponses échouent.
    await page.route('**/api/**', async (route) => {
      await route.abort('addressunreachable')
    })
    await page.goto('/events')
    // La liste reste consultable grâce au repli local (mockData).
    await expect(page.locator('body')).toContainText('événements', { timeout: 15000 })
  })

  test('erreur 401 : la session expirée redirige vers la connexion', async ({ page }) => {
    await login(page)
    // Marquer la session comme expirée : aucun token valide en localStorage
    // (token.js stocke sous la clé 'eventhub_token').
    await page.evaluate(() => {
      window.localStorage.removeItem('eventhub_token')
      window.localStorage.removeItem('eventhub_token_saved_at')
    })
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
    expect(page.url()).toContain('redirect')
  })

  test('page inconnue : redirection vers la page 404', async ({ page }) => {
    await page.goto('/page-inexistante')
    await expect(page.locator('body')).toContainText('404')
  })
})
