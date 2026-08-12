import { defineConfig } from '@playwright/test'

/**
 * Configuration Playwright pour les tests E2E du frontend EventHub.
 *
 * Les tests s'exécutent contre l'application réelle démarrée avec
 * `npm run dev` (port 3000) et le mock backend (port 8080).
 *
 *   npm run dev        (autre terminal)
 *   cd ../mock-api && npm start
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
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 800 },
    locale: 'fr-FR'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ],
  webServer: {
    command: 'cd ../mock-api && npm start',
    port: 8080,
    reuseExistingServer: true,
    timeout: 30000
  }
})
