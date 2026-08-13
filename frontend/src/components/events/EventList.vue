<script setup>
import EventCard from './EventCard.vue'

/**
 * Grille d'evenements.
 *
 * Composant purement presentatif : le chargement, l'erreur et la
 * pagination sont geres par la vue appelante (EventsView), qui
 * pilote directement le eventStore.
 *
 * Props :
 * - events : liste des evenements a afficher
 */
defineProps({
  events: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div
    v-if="events.length === 0"
    class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500"
  >
    Aucun evenement ne correspond a votre recherche.
  </div>

  <div
    v-else
    class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
  >
    <EventCard
      v-for="event in events"
      :key="event.id"
      :event="event"
    />
  </div>
</template>
