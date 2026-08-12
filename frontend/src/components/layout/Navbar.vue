<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore.js'

/**
 * Barre de navigation principale (en-tête).
 *
 * Responsive : menu hamburger sur mobile, liens horizontaux
 * sur tablette et desktop. Connectée au authStore : les liens
 * protégés et le bouton de déconnexion n'apparaissent que pour
 * l'utilisateur connecté.
 */
const router = useRouter()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

const navLinks = [
  { to: '/', label: 'Accueil', auth: false },
  { to: '/events', label: 'Événements', auth: false },
  { to: '/registrations', label: 'Mes inscriptions', auth: true },
  { to: '/dashboard', label: 'Tableau de bord', auth: true }
]

const links = computed(() => navLinks.filter((link) => !link.auth || authStore.isAuthenticated))

async function handleLogout() {
  await authStore.logout()
  mobileMenuOpen.value = false
  router.push('/login')
}
</script>

<template>
  <header
    class="navbar"
    role="banner"
  >
    <div class="navbar-inner container">
      <RouterLink
        to="/"
        class="navbar-brand"
        aria-label="EventHub - Accueil"
      >
        <span
          class="brand-mark"
          aria-hidden="true"
        >E</span>
        <span class="brand-name">EventHub</span>
      </RouterLink>

      <button
        class="navbar-toggle"
        type="button"
        :aria-expanded="String(mobileMenuOpen)"
        aria-controls="main-menu"
        aria-label="Ouvrir le menu"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <span aria-hidden="true">{{ mobileMenuOpen ? '✕' : '☰' }}</span>
      </button>

      <nav
        :id="mobileMenuOpen ? 'main-menu' : undefined"
        class="navbar-nav"
        :class="{ open: mobileMenuOpen }"
      >
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :class="{ active: $route.path === link.to }"
          @click="mobileMenuOpen = false"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div
        class="navbar-actions"
        :class="{ open: mobileMenuOpen }"
      >
        <template v-if="authStore.isAuthenticated">
          <span
            class="navbar-user"
            aria-hidden="true"
          >
            {{ authStore.user?.name || authStore.user?.email || 'Connecté' }}
          </span>
          <button
            class="btn btn-ghost btn-sm"
            type="button"
            @click="handleLogout"
          >
            Déconnexion
          </button>
        </template>
        <template v-else>
          <RouterLink
            to="/login"
            class="btn btn-ghost btn-sm"
            @click="mobileMenuOpen = false"
          >
            Se connecter
          </RouterLink>
          <RouterLink
            to="/register"
            class="btn btn-primary btn-sm"
            @click="mobileMenuOpen = false"
          >
            S'inscrire
          </RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  background: var(--color-background-deep);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: var(--shadow-md);
}

.navbar-inner {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-height: var(--header-height);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  color: #fff;
  font-weight: 700;
  font-size: var(--font-size-xl);
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  font-weight: 800;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-left: auto;
}

.nav-link {
  color: #cbd5e1;
  text-decoration: none;
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: color var(--transition-fast), background var(--transition-fast);
}

.nav-link:hover,
.nav-link.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: var(--space-3);
}

.navbar-user {
  font-size: var(--font-size-sm);
  color: #cbd5e1;
  font-weight: 600;
}

.navbar-toggle {
  display: none;
  margin-left: auto;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-sm);
  color: #fff;
  width: 40px;
  height: 40px;
  font-size: 1.25rem;
  cursor: pointer;
}

/* ---------- Tablette : masquer une partie de la navigation ---------- */
@media (max-width: 960px) {
  .navbar-nav .nav-link:nth-child(3),
  .navbar-nav .nav-link:nth-child(4) {
    display: none;
  }
}

/* ---------- Mobile : menu hamburger ---------- */
@media (max-width: 720px) {
  .navbar-nav,
  .navbar-actions {
    display: none;
  }

  .navbar-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .navbar-nav.open,
  .navbar-actions.open {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .navbar-nav.open {
    width: 100%;
    margin-left: 0;
    padding-top: var(--space-2);
    order: 3;
  }

  .navbar-actions.open {
    margin-left: 0;
    width: 100%;
    padding-top: var(--space-3);
    order: 4;
    flex-direction: row;
    justify-content: flex-end;
  }

  .navbar-inner {
    flex-wrap: wrap;
    padding-top: var(--space-3);
    padding-bottom: var(--space-3);
  }

  .nav-link {
    padding: 0.75rem var(--space-3);
  }
}
</style>
