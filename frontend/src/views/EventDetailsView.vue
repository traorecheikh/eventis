<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import EventDetails from '../components/events/EventDetails.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import { useEventStore } from '../stores'

/**
 * Page de details d'un evenement.
 *
 * La recherche par id (et sa disponibilite en temps reel) est
 * deleguee au eventStore (architecture View -> Component -> Store
 * -> Service API -> Axios). PUT/DELETE /events/:id n'existent pas
 * encore cote backend (voir AGENTS.md section 11) : aucune action
 * d'edition ou de suppression n'est proposee ici.
 */
const route = useRoute()
const eventStore = useEventStore()

async function loadEvent() {
  await eventStore.fetchEventById(route.params.id)
}

onMounted(loadEvent)
watch(() => route.params.id, loadEvent)
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 12 }"
    :enter="{ opacity: 1, y: 0 }"
    class="mx-auto max-w-3xl"
  >
    <LoadingSpinner v-if="eventStore.loading" />
    <ErrorMessage v-else-if="eventStore.error" :message="eventStore.error" />

    <EventDetails
      v-else-if="eventStore.currentEvent"
      :event="eventStore.currentEvent"
      :availability="eventStore.currentAvailability"
    />

    <div
      v-else
      class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500"
    >
      L'evenement demande n'existe pas.
    </div>
  </div>
</template>
