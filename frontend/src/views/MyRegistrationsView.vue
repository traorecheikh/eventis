<script setup>
import { onMounted } from 'vue'
import RegistrationCard from '../components/registrations/RegistrationCard.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import { useRegistrationStore } from '../stores'

/**
 * Page « Mes inscriptions » : liste des événements auxquels
 * l'utilisateur est inscrit.
 *
 * La logique est déléguée au registrationStore
 * (architecture View → Component → Store → Service API Axios).
 * La liste est rechargée après toute annulation afin d'assurer
 * la cohérence avec le backend (DELETE /api/registrations/:id).
 */
const registrationStore = useRegistrationStore()

onMounted(async () => {
  await registrationStore.fetchRegistrations()
})

/**
 * Annulation d'une inscription avec confirmation de l'utilisateur
 * et rechargement de la liste côté backend.
 */
async function handleCancel(registration) {
  if (!window.confirm(
    `Annuler votre inscription à « ${registration.eventTitle} » ?`
  )) {
    return
  }
  await registrationStore.cancelRegistration(registration.id)
  if (!registrationStore.error) {
    await registrationStore.fetchRegistrations()
  }
}
</script>

<template>
  <div class="my-registrations">
    <h1>Mes inscriptions</h1>
    <p class="page-subtitle">
      Retrouvez ici tous vos événements et le statut de votre inscription.
    </p>

    <ErrorMessage
      v-if="registrationStore.error"
      :message="registrationStore.error"
    />

    <LoadingSpinner v-if="registrationStore.loading" />

    <div
      v-else-if="registrationStore.registrations.length > 0"
      class="registrations-list"
    >
      <RegistrationCard
        v-for="registration in registrationStore.registrations"
        :key="registration.id"
        :registration="registration"
        @cancel="handleCancel(registration)"
      />
    </div>

    <p
      v-else
      class="empty-state"
    >
      Vous n'êtes inscrit à aucun événement pour le moment.
      <RouterLink to="/events">
        Découvrir les événements
      </RouterLink>
    </p>
  </div>
</template>

<style scoped>
.my-registrations {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
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

.registrations-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.empty-state {
  margin-top: var(--space-6);
  color: var(--color-text-secondary);
  font-style: italic;
}
</style>
