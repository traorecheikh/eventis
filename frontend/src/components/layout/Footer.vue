<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { CalendarCheck } from 'lucide-vue-next'
import { useAuthStore } from '../../stores'

/**
 * Pied de page de l'application.
 */
const authStore = useAuthStore()
const year = new Date().getFullYear()

const footerLinks = computed(() => [
  { to: '/events', label: 'Evenements', auth: false },
  { to: '/registrations', label: 'Mes inscriptions', auth: true },
  { to: '/dashboard', label: 'Tableau de bord', auth: true },
  { to: '/login', label: 'Connexion', auth: false, hideWhenAuth: true }
].filter((link) => (!link.auth || authStore.isAuthenticated) && !(link.hideWhenAuth && authStore.isAuthenticated)))
</script>

<template>
  <footer class="mt-auto bg-brand-950 text-slate-300" role="contentinfo">
    <div class="mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 px-4 py-8 md:grid-cols-[1.5fr_1fr]">
      <div class="flex items-center gap-3 text-white">
        <CalendarCheck class="h-9 w-9 text-brand-300" aria-hidden="true" />
        <div>
          <strong class="block">EventHub</strong>
          <p class="mt-0.5 text-sm text-slate-400">
            Conferences, ateliers et seminaires du Dakar Institute of Technology.
          </p>
        </div>
      </div>

      <nav class="flex flex-wrap gap-x-5 gap-y-2 md:justify-end" aria-label="Liens du pied de page">
        <RouterLink
          v-for="link in footerLinks"
          :key="link.to"
          :to="link.to"
          class="text-sm text-slate-300 transition-colors hover:text-white"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <p class="col-span-full text-sm text-slate-500">
        {{ year }} EventHub, Equipe 7, Master 1 Intelligence Artificielle, Dakar Institute of Technology.
      </p>
    </div>
  </footer>
</template>
