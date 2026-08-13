<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { CalendarCheck, Menu, X } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/authStore.js'

/**
 * Barre de navigation principale.
 *
 * Responsive : menu hamburger sur mobile. Connectee au authStore :
 * les liens proteges et le bouton de deconnexion n'apparaissent que
 * pour l'utilisateur connecte.
 */
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

const navLinks = [
  { to: '/', label: 'Accueil', auth: false },
  { to: '/events', label: 'Evenements', auth: false },
  { to: '/registrations', label: 'Mes inscriptions', auth: true },
  { to: '/dashboard', label: 'Tableau de bord', auth: true }
]

const links = computed(() => navLinks.filter((link) => !link.auth || authStore.isAuthenticated))

function handleLogout() {
  authStore.logout()
  mobileMenuOpen.value = false
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-brand-950 text-white shadow-md" role="banner">
    <div class="mx-auto flex min-h-16 max-w-6xl items-center gap-4 px-4">
      <RouterLink to="/" class="flex items-center gap-2 font-bold text-lg" aria-label="EventHub - Accueil">
        <CalendarCheck class="h-7 w-7 text-brand-300" aria-hidden="true" />
        <span>EventHub</span>
      </RouterLink>

      <button
        type="button"
        class="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/25 md:hidden"
        :aria-expanded="mobileMenuOpen"
        aria-controls="main-menu"
        aria-label="Ouvrir le menu"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <X v-if="mobileMenuOpen" class="h-5 w-5" aria-hidden="true" />
        <Menu v-else class="h-5 w-5" aria-hidden="true" />
      </button>

      <nav
        id="main-menu"
        class="ml-auto hidden items-center gap-1 md:flex"
      >
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-md px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          :class="{ 'bg-white/10 text-white': route.path === link.to }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="hidden items-center gap-2 md:flex">
        <template v-if="authStore.isAuthenticated">
          <span class="text-sm font-medium text-slate-300">{{ authStore.user?.email }}</span>
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
            @click="handleLogout"
          >
            Deconnexion
          </button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10">
            Se connecter
          </RouterLink>
          <RouterLink
            to="/register"
            class="rounded-md bg-brand-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-500"
          >
            S'inscrire
          </RouterLink>
        </template>
      </div>
    </div>

    <nav v-if="mobileMenuOpen" class="flex flex-col gap-1 border-t border-white/10 px-4 py-3 md:hidden">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="rounded-md px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10"
        @click="mobileMenuOpen = false"
      >
        {{ link.label }}
      </RouterLink>
      <template v-if="authStore.isAuthenticated">
        <button type="button" class="rounded-md px-3 py-2.5 text-left text-sm font-medium text-slate-200 hover:bg-white/10" @click="handleLogout">
          Deconnexion
        </button>
      </template>
      <template v-else>
        <RouterLink to="/login" class="rounded-md px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10" @click="mobileMenuOpen = false">
          Se connecter
        </RouterLink>
        <RouterLink to="/register" class="rounded-md px-3 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-500" @click="mobileMenuOpen = false">
          S'inscrire
        </RouterLink>
      </template>
    </nav>
  </header>
</template>
