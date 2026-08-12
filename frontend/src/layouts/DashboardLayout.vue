<script setup>
/**
 * Layout du tableau de bord (pages d'administration / gestion).
 *
 * Comporte une barre latérale de navigation dédiée à la gestion :
 * Tableau de bord, Événements, Participants, Inscriptions, Profil.
 *
 * Responsive : sur mobile, la sidebar est repliable via un bouton.
 */
import { ref } from 'vue'
import { useAuthStore } from '../stores'

const sidebarOpen = ref(false)
const authStore = useAuthStore()

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

/**
 * Affichage de l'utilisateur connecté depuis le jeton JWT
 * (authStore.user, hydraté au démarrage de l'application).
 */
const userDisplayName = ref('Utilisateur')
const userRole = ref('')

if (authStore.user) {
  const user = authStore.user
  userDisplayName.value = user.fullName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur'
  userRole.value = user.role || ''
}
</script>

<template>
  <div class="layout-dashboard">
    <button
      class="dashboard-menu-toggle"
      type="button"
      :aria-expanded="String(sidebarOpen)"
      aria-label="Ouvrir le menu du tableau de bord"
      @click="toggleSidebar"
    >
      ☰
    </button>

    <aside
      class="sidebar"
      :class="{ open: sidebarOpen }"
      :aria-hidden="String(!sidebarOpen && 'mobile')"
      @click="sidebarOpen = false"
    >
      <div class="sidebar-header">
        <RouterLink
          to="/"
          class="brand"
        >
          EventHub
        </RouterLink>
        <span class="badge badge-info">Admin</span>
      </div>
      <nav
        class="sidebar-nav"
        aria-label="Navigation du tableau de bord"
      >
        <RouterLink
          to="/dashboard"
          class="nav-link"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >📊</span> Tableau de bord
        </RouterLink>
        <RouterLink
          to="/events"
          class="nav-link"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >📅</span> Événements
        </RouterLink>
        <RouterLink
          :to="{ name: 'participant-profile', params: { id: 1 } }"
          class="nav-link"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >👤</span> Participant
        </RouterLink>
        <RouterLink
          to="/registrations"
          class="nav-link"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >📋</span> Mes inscriptions
        </RouterLink>
      </nav>
      <div class="sidebar-footer">
        <RouterLink
          to="/"
          class="nav-link"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >🏠</span> Retour au site
        </RouterLink>
        <RouterLink
          to="/login"
          class="nav-link"
        >
          <span
            class="nav-icon"
            aria-hidden="true"
          >🚪</span> Déconnexion
        </RouterLink>
      </div>
    </aside>

    <div
      v-if="sidebarOpen"
      class="sidebar-backdrop"
      aria-hidden="true"
      @click="sidebarOpen = false"
    />

    <div class="dashboard-body">
      <header class="dashboard-header">
        <h1 class="page-title">
          <slot name="title">
            Tableau de bord
          </slot>
        </h1>
        <div class="user-info">
          <span class="user-name">{{ userDisplayName }}</span>
          <span
            v-if="userRole"
            class="badge badge-neutral"
          >{{ userRole }}</span>
        </div>
      </header>

      <main class="dashboard-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-dashboard {
  display: flex;
  min-height: 100vh;
  background: var(--color-background-soft);
}

.dashboard-menu-toggle {
  display: none;
  position: fixed;
  top: var(--space-3);
  left: var(--space-3);
  z-index: 45;
  width: 44px;
  height: 44px;
  background: var(--color-background-deep);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  font-size: 1.25rem;
  cursor: pointer;
}

.sidebar {
  width: 260px;
  background: var(--color-background-deep);
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  z-index: 50;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: #fff;
  text-decoration: none;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: var(--space-3);
  flex: 1;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  padding: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: #cbd5e1;
  text-decoration: none;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-icon {
  font-size: var(--font-size-base);
}

.sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 40;
}

.dashboard-body {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  background: var(--color-surface);
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.page-title {
  font-size: var(--font-size-lg);
  color: var(--color-ink);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.user-name {
  font-weight: 600;
  color: var(--color-ink);
}

.dashboard-main {
  flex: 1;
  padding: var(--space-6);
}

/* ---------- Mobile : sidebar repliable ---------- */
@media (max-width: 860px) {
  .dashboard-menu-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar {
    transform: translateX(-100%);
    transition: transform 200ms ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-backdrop {
    display: block;
  }

  .dashboard-body {
    margin-left: 0;
  }

  .dashboard-main {
    padding: var(--space-4);
    padding-top: calc(var(--space-14, 3.5rem));
  }

  .dashboard-header {
    padding: var(--space-3) var(--space-4);
  }
}
</style>
