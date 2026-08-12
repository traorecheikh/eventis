<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EventDetails from '../components/events/EventDetails.vue'
import EventForm from '../components/events/EventForm.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import { useEventStore } from '../stores'

/**
 * Page de détails d'un événement.
 *
 * La recherche par id est déléguée au eventStore
 * (architecture View → Component → Store → Service API Axios).
 * En mode administration (?admin=1), l'édition (PUT /api/events/:id)
 * et la suppression (DELETE /api/events/:id) sont disponibles.
 */
const route = useRoute()
const eventStore = useEventStore()

/**
 * Le mode administration est activé par la route /dashboard/events/:id
 * ou par le paramètre de requête ?admin=1.
 */
function isAdmin() {
  return route.path.startsWith('/dashboard') || route.query.admin === '1'
}

async function loadEvent() {
  await eventStore.fetchEventById(route.params.id)
}

async function handleDelete(id) {
  await eventStore.removeEvent(id)
  // Après suppression, retour immédiat à la liste des événements.
  // Le rechargement de l'événement supprimé renverrait 404.
  if (!eventStore.error) {
    route.push('/events')
  }
}

const isEditRoute = computed(() => route.name === 'event-edit')
const editForm = ref(null)

async function handleEditSubmit(data) {
  await eventStore.editEvent(Number(route.params.id), data)
  await handleEditSuccess()
}

async function handleEditSuccess() {
  await eventStore.fetchEventById(route.params.id)
  if (!eventStore.error) {
    setTimeout(() => {
      route.push(`/events/${route.params.id}?admin=1`)
    }, 600)
  }
}

onMounted(loadEvent)
watch(() => route.params.id, loadEvent)
</script>

<template>
  <div class="event-details-page">
    <ErrorMessage
      v-if="eventStore.error"
      :message="eventStore.error"
    />

    <LoadingSpinner v-if="eventStore.loading" />

    <EventDetails
      v-else-if="eventStore.currentEvent && !isEditRoute"
      :event="eventStore.currentEvent"
      :admin="isAdmin()"
      @delete="handleDelete"
    />
    <div
      v-else-if="eventStore.currentEvent && isEditRoute && !isAdmin()"
      class="not-found-inline card"
    >
      <p>La modification d'événements est réservée aux organisateurs.</p>
      <router-link
        :to="`/events/${route.params.id}`"
        class="link"
      >
        Retour aux détails
      </router-link>
    </div>
    <EventForm
      v-else-if="eventStore.currentEvent"
      key="edit-form"
      ref="editForm"
      :initial="eventStore.currentEvent"
      :is-edit="true"
      @submit="handleEditSubmit"
      @cancel="route.push(`/events/${route.params.id}?admin=1`)"
    />

    <div
      v-else-if="!eventStore.loading"
      class="not-found-inline card"
    >
      <p>L'événement demandé n'existe pas.</p>
    </div>
  </div>
</template>

<style scoped>
.event-details-page {
  max-width: 960px;
  margin: 0 auto;
}

.not-found-inline {
  padding: var(--space-8) var(--space-6);
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}
</style>
