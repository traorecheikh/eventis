<script setup>
import { RouterLink } from 'vue-router'

/**
 * Pied de page de l'application.
 *
 * Responsive : colonnes empilées sur mobile, grille sur desktop.
 */
const year = new Date().getFullYear()

const footerLinks = [
  { to: '/events', label: 'Événements' },
  { to: '/registrations', label: 'Mes inscriptions' },
  { to: '/dashboard', label: 'Tableau de bord' },
  { to: '/login', label: 'Connexion' }
]
</script>

<template>
  <footer
    class="footer"
    role="contentinfo"
  >
    <div class="footer-inner container">
      <div class="footer-brand">
        <span
          class="brand-mark"
          aria-hidden="true"
        >E</span>
        <div>
          <strong>EventHub</strong>
          <p class="brand-tagline">
            Gestion d'événements simplifiée
          </p>
        </div>
      </div>

      <nav
        class="footer-nav"
        aria-label="Liens du pied de page"
      >
        <RouterLink
          v-for="link in footerLinks"
          :key="link.to"
          :to="link.to"
          class="footer-link"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <p class="footer-legal">
        © {{ year }} EventHub — Interface de démonstration (données locales)
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--color-background-deep);
  color: #cbd5e1;
  margin-top: auto;
}

.footer-inner {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: var(--space-6);
  align-items: center;
  padding: var(--space-6) 0;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: #fff;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  font-weight: 800;
  flex-shrink: 0;
}

.brand-tagline {
  font-size: var(--font-size-sm);
  color: #94a3b8;
  margin-top: 0.125rem;
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  justify-content: flex-end;
}

.footer-link {
  color: #cbd5e1;
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: #fff;
}

.footer-legal {
  grid-column: 1 / -1;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: var(--space-4);
  font-size: var(--font-size-xs);
  color: #64748b;
}

@media (max-width: 720px) {
  .footer-inner {
    grid-template-columns: 1fr;
  }

  .footer-nav {
    justify-content: flex-start;
  }
}
</style>
