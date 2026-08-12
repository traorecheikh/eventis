<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import EventFilter from '../components/events/EventFilter.vue'
import EventList from '../components/events/EventList.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import AppButton from '../components/common/AppButton.vue'
import { useEventStore } from '../stores'

import { onMounted } from 'vue'

/**
 * Liste des événements avec filtres.
 *
 * La logique est déléguée au eventStore (architecture View →
 * Component → Store → Service API Axios).
 *
 * En mode administration (route /dashboard/events ou
 * paramètre de requête ?admin=1), les actions de création
 * (POST /api/events) et suppression (DELETE /api/events/:id)
 * sont disponibles.
 */
const route = useRoute()
const eventStore = useEventStore()

const filters = ref({ search: '', category: '', onlyFull: false })

/**
 * Le mode administration est activé par la route /dashboard/events
 * ou par le paramètre de requête ?admin=1.
 */
function isAdmin() {
  return route.path.startsWith('/dashboard') || route.query.admin === '1'
}

onMounted(async () => {
  await eventStore.fetchEvents()
})

async function handleFilter(value) {
  filters.value = { ...value }
  await eventStore.fetchEvents({
    search: filters.value.search,
    category: filters.value.category,
    onlyFull: filters.value.onlyFull
  })
}

/**
 * Crée un événement : le payload contient exactement les champs
 * attendus par le backend (name, eventDate, venue, maxCapacity).
 */
async function handleCreate(payload) {
  await eventStore.addEvent(payload)
  await eventStore.fetchEvents({
    search: filters.value.search,
    category: filters.value.category,
    onlyFull: filters.value.onlyFull
  })
}

async function handleDelete(id) {
  await eventStore.removeEvent(id)
  if (!eventStore.error) {
    await eventStore.fetchEvents({
      search: filters.value.search,
      category: filters.value.category,
      onlyFull: filters.value.onlyFull
    })
  }
}
</script>

<template>
  <div class="events">
    <div class="page-header">
      <h1>Événements</h1>
      <p class="page-subtitle">
        Découvrez les événements à venir et inscrivez-vous en quelques clics.
      </p>
    </div>

    <ErrorMessage
      v-if="eventStore.error"
      :message="eventStore.error"
    />

    <AppButton
      v-if="eventStore.success"
      variant="primary"
    >
      {{ eventStore.success }}
    </AppButton>

    <EventFilter
      :categories="eventStore.categories"
      :current-filters="filters"
      @filter="handleFilter"
    />

    <LoadingSpinner v-if="eventStore.loading" />

    <EventList
      v-else
      :events="eventStore.events"
      :loading="eventStore.loading"
      :admin="isAdmin()"
      @create-event="handleCreate"
      @delete-event="handleDelete"
      @retry="eventStore.fetchEvents()"
    />
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: var(--space-6);
}

h1 {
  font-size: var(--font-size-2xl);
  color: var(--color-ink);
  margin-bottom: var(--space-1);
}

.page-subtitle {
  color: var(--color-text-secondary);
}

.note {
  font-size: var(--font-size-sm);
  font-style: italic;
  color: var(--color-text-muted);
}
</style>
