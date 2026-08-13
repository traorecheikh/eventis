<script setup>
/**
 * Layout du tableau de bord (pages de gestion).
 *
 * Barre laterale de navigation dediee : Tableau de bord, Evenements,
 * Profil participant, Mes inscriptions. Repliable sur mobile.
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  CalendarCheck,
  LayoutDashboard,
  CalendarDays,
  User,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  X
} from 'lucide-vue-next'
import { useAuthStore } from '../stores'

const sidebarOpen = ref(false)
const authStore = useAuthStore()
const router = useRouter()

const participantLink = computed(() =>
  authStore.participantId
    ? { name: 'participant-profile', params: { id: authStore.participantId } }
    : { name: 'participant-profile', params: { id: 'nouveau' } }
)

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50">
    <button
      type="button"
      class="fixed left-3 top-3 z-40 inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/20 bg-brand-950 text-white md:hidden"
      :aria-expanded="sidebarOpen"
      aria-label="Ouvrir le menu du tableau de bord"
      @click="sidebarOpen = !sidebarOpen"
    >
      <X v-if="sidebarOpen" class="h-5 w-5" aria-hidden="true" />
      <Menu v-else class="h-5 w-5" aria-hidden="true" />
    </button>

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-slate-900/50 md:hidden"
      aria-hidden="true"
      @click="sidebarOpen = false"
    />

    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-brand-950 text-slate-300 transition-transform md:static md:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-4">
        <RouterLink to="/" class="flex items-center gap-2 text-lg font-bold text-white">
          <CalendarCheck class="h-6 w-6 text-brand-300" aria-hidden="true" />
          EventHub
        </RouterLink>
      </div>

      <nav class="flex flex-1 flex-col gap-1 p-3" aria-label="Navigation du tableau de bord" @click="sidebarOpen = false">
        <RouterLink to="/dashboard" class="flex items-center gap-3 rounded-md px-4 py-2.5 transition-colors hover:bg-white/10 hover:text-white" active-class="bg-white/10 text-white">
          <LayoutDashboard class="h-4 w-4" aria-hidden="true" /> Tableau de bord
        </RouterLink>
        <RouterLink to="/dashboard/events" class="flex items-center gap-3 rounded-md px-4 py-2.5 transition-colors hover:bg-white/10 hover:text-white" active-class="bg-white/10 text-white">
          <CalendarDays class="h-4 w-4" aria-hidden="true" /> Evenements
        </RouterLink>
        <RouterLink :to="participantLink" class="flex items-center gap-3 rounded-md px-4 py-2.5 transition-colors hover:bg-white/10 hover:text-white" active-class="bg-white/10 text-white">
          <User class="h-4 w-4" aria-hidden="true" /> Mon profil
        </RouterLink>
        <RouterLink to="/registrations" class="flex items-center gap-3 rounded-md px-4 py-2.5 transition-colors hover:bg-white/10 hover:text-white" active-class="bg-white/10 text-white">
          <ClipboardList class="h-4 w-4" aria-hidden="true" /> Mes inscriptions
        </RouterLink>
      </nav>

      <div class="flex flex-col gap-1 border-t border-white/10 p-3">
        <RouterLink to="/" class="flex items-center gap-3 rounded-md px-4 py-2.5 transition-colors hover:bg-white/10 hover:text-white">
          <Home class="h-4 w-4" aria-hidden="true" /> Retour au site
        </RouterLink>
        <button type="button" class="flex items-center gap-3 rounded-md px-4 py-2.5 text-left transition-colors hover:bg-white/10 hover:text-white" @click="handleLogout">
          <LogOut class="h-4 w-4" aria-hidden="true" /> Deconnexion
        </button>
      </div>
    </aside>

    <div class="flex flex-1 flex-col">
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">
        <h1 class="text-lg font-semibold text-slate-900">
          <slot name="title">Tableau de bord</slot>
        </h1>
        <div v-if="authStore.user" class="flex items-center gap-2">
          <span class="font-medium text-slate-700">{{ authStore.user.email }}</span>
          <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {{ authStore.user.role }}
          </span>
        </div>
      </header>

      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
