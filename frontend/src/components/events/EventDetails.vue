<script setup>
import { RouterLink } from 'vue-router'
import { ArrowLeft, CalendarDays, MapPin, Users } from 'lucide-vue-next'

/**
 * Bloc de details d'un evenement.
 *
 * Props :
 * - event : objet evenement complet { id, title, description?, date,
 *   location, maxCapacity, creatorId, createdAt, updatedAt }
 * - availability : { eventId, maxCapacity, registeredCount,
 *   remainingSeats, isFull } | null, issu d'un appel separe a
 *   GET /events/:id/availability (peut etre indisponible si le
 *   registrations-service ne repond pas : on l'affiche alors comme
 *   tel, jamais de valeur devinee).
 *
 * PUT/DELETE /events/:id n'existent pas encore cote backend : aucune
 * action d'edition ou de suppression n'est proposee ici.
 */
defineProps({
  event: {
    type: Object,
    required: true
  },
  availability: {
    type: Object,
    default: null
  }
})

function formatDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <article
    class="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
    :aria-label="`Details de l'evenement ${event.title}`"
  >
    <header class="flex flex-wrap items-start justify-between gap-3">
      <h1 class="text-2xl font-semibold text-slate-900">{{ event.title }}</h1>
      <span
        v-if="availability?.isFull"
        class="shrink-0 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
      >
        Complet
      </span>
    </header>

    <ul class="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:gap-6">
      <li class="flex items-center gap-2">
        <CalendarDays class="h-4 w-4 text-brand-600" aria-hidden="true" />
        {{ formatDate(event.date) }}
      </li>
      <li class="flex items-center gap-2">
        <MapPin class="h-4 w-4 text-brand-600" aria-hidden="true" />
        {{ event.location }}
      </li>
    </ul>

    <p v-if="event.description" class="whitespace-pre-line text-slate-700">
      {{ event.description }}
    </p>

    <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div class="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Users class="h-4 w-4 text-brand-600" aria-hidden="true" />
        Disponibilite
      </div>
      <template v-if="availability">
        <p class="mt-1.5 text-sm text-slate-600">
          {{ availability.remainingSeats }} place(s) restante(s) sur {{ availability.maxCapacity }}
        </p>
        <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            class="h-full rounded-full transition-[width]"
            :class="availability.isFull ? 'bg-red-500' : 'bg-brand-600'"
            :style="{ width: Math.min(100, Math.round((availability.registeredCount / availability.maxCapacity) * 100)) + '%' }"
            role="progressbar"
            :aria-valuenow="availability.registeredCount"
            aria-valuemin="0"
            :aria-valuemax="availability.maxCapacity"
          />
        </div>
      </template>
      <p v-else class="mt-1.5 text-sm text-slate-500">
        Disponibilite momentanement indisponible.
      </p>
    </div>

    <footer class="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
      <RouterLink
        to="/events"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft class="h-4 w-4" aria-hidden="true" />
        Retour a la liste
      </RouterLink>
      <RouterLink
        v-if="!availability?.isFull"
        :to="`/events/${event.id}/register`"
        class="ml-auto inline-flex h-11 items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        S'inscrire a cet evenement
      </RouterLink>
      <span
        v-else
        class="ml-auto inline-flex h-11 items-center rounded-lg bg-slate-100 px-5 text-sm font-medium text-slate-500"
      >
        Evenement complet
      </span>
    </footer>
  </article>
</template>
