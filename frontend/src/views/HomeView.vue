<script setup>
import { computed, onMounted } from 'vue'
import { CalendarPlus, Search } from 'lucide-vue-next'
import EventCard from '../components/events/EventCard.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import { useEventStore } from '../stores'

/**
 * Page d'accueil publique : les evenements les plus recents,
 * charges depuis GET /api/events (sans repli local).
 */
const eventStore = useEventStore()

onMounted(() => {
  eventStore.fetchEvents({ limit: 3 })
})

const featuredEvents = computed(() => eventStore.events)
</script>

<template>
  <div class="flex flex-col gap-16">
    <section v-motion :initial="{ opacity: 0, y: 16 }" :enter="{ opacity: 1, y: 0 }" class="py-8 text-center">
      <h1 class="text-4xl font-bold text-slate-900">EventHub</h1>
      <p class="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
        Conferences, ateliers et seminaires du Dakar Institute of Technology :
        creez un evenement, gerez les inscriptions et suivez la disponibilite
        en temps reel.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <RouterLink
          to="/events"
          class="inline-flex h-12 items-center gap-2 rounded-lg bg-brand-600 px-6 text-base font-medium text-white transition-colors hover:bg-brand-700"
        >
          <Search class="h-4 w-4" aria-hidden="true" />
          Decouvrir les evenements
        </RouterLink>
        <RouterLink
          to="/register"
          class="inline-flex h-12 items-center gap-2 rounded-lg border border-brand-200 bg-white px-6 text-base font-medium text-brand-700 transition-colors hover:bg-brand-50"
        >
          <CalendarPlus class="h-4 w-4" aria-hidden="true" />
          Creer un compte
        </RouterLink>
      </div>
    </section>

    <section class="border-t border-slate-200 pt-10">
      <h2 class="mb-5 text-2xl font-semibold text-slate-900">Evenements recents</h2>

      <LoadingSpinner v-if="eventStore.loading" />
      <ErrorMessage v-else-if="eventStore.error" :message="eventStore.error" />
      <div v-else-if="featuredEvents.length > 0" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <EventCard v-for="event in featuredEvents" :key="event.id" :event="event" />
      </div>
      <div v-else class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        Aucun evenement disponible pour le moment.
      </div>
    </section>
  </div>
</template>
