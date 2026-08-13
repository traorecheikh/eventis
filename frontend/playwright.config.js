import { defineConfig } from '@playwright/test'

/**
 * Configuration Playwright pour les tests E2E du frontend EventHub.
 *
 * Les tests s'executent contre l'application reelle, servie par la
 * passerelle Nginx avec les quatre microservices backend reels
 * (aucun mock) :
 *
 *   docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
 *   npm run test:e2e
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 800 },
    locale: 'fr-FR'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ]
})
