<script setup>
import { CalendarDays, MapPin, ArrowRight } from 'lucide-vue-next'

/**
 * Carte d'evenement reutilisable.
 *
 * Props :
 * - event : { id, title, date, location, description? }
 *
 * La disponibilite (places restantes) n'est pas incluse dans la
 * liste des evenements par le backend : elle est consultee en
 * temps reel sur la page de detail (GET /events/:id/availability),
 * pas approximee ici.
 */
defineProps({
  event: {
    type: Object,
    required: true
  }
})

function formatDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <article class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
    <h3 class="text-lg font-semibold text-slate-900">
      <RouterLink :to="`/events/${event.id}`" class="hover:text-brand-600">
        {{ event.title }}
      </RouterLink>
    </h3>

    <ul class="flex flex-col gap-1.5 text-sm text-slate-600">
      <li class="flex items-center gap-2">
        <CalendarDays class="h-4 w-4 text-brand-600" aria-hidden="true" />
        {{ formatDate(event.date) }}
      </li>
      <li class="flex items-center gap-2">
        <MapPin class="h-4 w-4 text-brand-600" aria-hidden="true" />
        {{ event.location }}
      </li>
    </ul>

    <p v-if="event.description" class="line-clamp-2 text-sm text-slate-500">
      {{ event.description }}
    </p>

    <RouterLink
      :to="`/events/${event.id}`"
      class="mt-auto flex items-center gap-1.5 pt-2 text-sm font-medium text-brand-600 hover:text-brand-700"
    >
      Voir les details
      <ArrowRight class="h-4 w-4" aria-hidden="true" />
    </RouterLink>
  </article>
</template>
