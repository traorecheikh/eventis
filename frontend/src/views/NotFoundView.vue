<script setup>
import { RouterLink } from 'vue-router'
import { Compass, Home } from 'lucide-vue-next'
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 12 }"
    :enter="{ opacity: 1, y: 0 }"
    class="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"
  >
    <Compass class="h-12 w-12 text-brand-300" aria-hidden="true" />
    <span class="text-6xl font-extrabold text-slate-200">404</span>
    <h1 class="text-2xl font-semibold text-slate-900">Page introuvable</h1>
    <p class="max-w-md text-slate-500">
      La page que vous recherchez n'existe pas ou a ete deplacee.
    </p>
    <RouterLink
      to="/"
      class="mt-2 inline-flex h-11 items-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
    >
      <Home class="h-4 w-4" aria-hidden="true" />
      Retour a l'accueil
    </RouterLink>
  </div>
</template>
