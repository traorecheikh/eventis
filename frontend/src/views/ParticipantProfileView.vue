<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ParticipantCard from '../components/participants/ParticipantCard.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import { useParticipantStore } from '../stores'

/**
 * Profil d'un participant.
 *
 * La consultation par id est déléguée au participantStore
 * (architecture View → Component → Store → Service API Axios).
 * L'API participants n'expose que la consultation : la modification
 * du profil n'est PAS disponible tant que l'endpoint
 * PUT /api/participants/:id n'est pas confirmé par Swagger/OpenAPI.
 */
const route = useRoute()
const participantStore = useParticipantStore()

onMounted(async () => {
  await participantStore.fetchParticipantById(route.params.id)
})
</script>

<template>
  <div class="profile">
    <ErrorMessage
      v-if="participantStore.error"
      :message="participantStore.error"
    />

    <LoadingSpinner v-if="participantStore.loading" />

    <template v-else-if="participantStore.currentParticipant">
      <ParticipantCard
        :participant="participantStore.currentParticipant"
        :show-actions="false"
      />
    </template>

    <div
      v-else-if="!participantStore.loading"
      class="not-found-inline card"
    >
      <p>Le profil demandé n'existe pas.</p>
    </div>
  </div>
</template>

<style scoped>
.profile {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.note {
  font-size: var(--font-size-sm);
  font-style: italic;
  color: var(--color-text-muted);
}

.not-found-inline {
  padding: var(--space-8) var(--space-6);
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}
</style>
