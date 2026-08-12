<script setup>
import { ref } from 'vue'
import EventCard from './EventCard.vue'
import EventForm from './EventForm.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import ErrorMessage from '../common/ErrorMessage.vue'
import AppModal from '../common/AppModal.vue'
import AppButton from '../common/AppButton.vue'

/**
 * Liste d'événements gérant les états de chargement,
 * d'erreur et de liste vide.
 *
 * Props :
 * - events : liste des événements à afficher
 * - loading : état de chargement
 * - error : message d'erreur éventuel
 * - admin : active le mode gestion (création / suppression)
 *
 * En mode admin, la création d'événement est déléguée au store
 * (addEvent → eventService.createEvent → POST /api/events).
 */
defineProps({
  events: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  admin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['retry', 'createEvent', 'deleteEvent'])

const showCreateModal = ref(false)

/**
 * Gère la soumission du formulaire de création.
 *
 * Les champs internes du formulaire (time, category,
 * description) sont retirés : seuls name, eventDate,
 * venue et maxCapacity sont transmis à la vue, puis au
 * store et au backend.
 */
function handleCreate(payload) {
  showCreateModal.value = false
  const { name, eventDate, venue, maxCapacity } = payload
  emit('createEvent', { name, eventDate, venue, maxCapacity })
}
</script>

<template>
  <div class="event-list">
    <LoadingSpinner
      v-if="loading"
      label="Chargement des événements…"
    />

    <ErrorMessage
      v-else-if="error"
      :message="error"
      @retry="$emit('retry')"
    />

    <div
      v-else-if="events.length === 0"
      class="event-list-empty card"
    >
      <p>Aucun événement ne correspond à votre recherche.</p>
    </div>

    <div
      v-else
      class="event-list-grid"
    >
      <EventCard
        v-for="event in events"
        :key="event.id"
        :event="event"
        :admin="admin"
        @delete="$emit('deleteEvent', event.id)"
      />
    </div>

    <AppModal
      v-if="admin"
      :open="showCreateModal"
      title="Créer un événement"
      @close="showCreateModal = false"
    >
      <EventForm
        @submit="handleCreate"
        @cancel="showCreateModal = false"
      />
    </AppModal>

    <AppButton
      v-if="admin"
      variant="primary"
      class="event-list-create"
      @click="showCreateModal = true"
    >
      + Créer un événement
    </AppButton>
  </div>
</template>

<style scoped>
.event-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}

.event-list-empty {
  padding: var(--space-8) var(--space-6);
  text-align: center;
  color: var(--color-text-secondary);
}

.event-list-create {
  margin-top: var(--space-6);
  display: block;
}
</style>
