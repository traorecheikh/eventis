<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import RegistrationForm from '../components/registrations/RegistrationForm.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import AppModal from '../components/common/AppModal.vue'
import AppButton from '../components/common/AppButton.vue'
import { useEventStore, useRegistrationStore, useAuthStore } from '../stores'

/**
 * Formulaire d'inscription à un événement.
 *
 * La logique est déléguée aux stores (eventStore pour récupérer
 * l'événement, registrationStore pour créer l'inscription).
 * Le service API Axios sera injecté à la phase 5.
 */
const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
const registrationStore = useRegistrationStore()
const authStore = useAuthStore()

const showModal = ref(false)

onMounted(async () => {
  await eventStore.fetchEventById(route.params.eventId)
})

/**
 * Pré-remplissage du formulaire lorsque l'utilisateur est connecté.
 */
const prefilledForm = computed(() => {
  const user = authStore.user
  if (!user) return {}
  return {
    firstName: user.firstName ?? splitName(user)?.firstName ?? '',
    lastName: user.lastName ?? splitName(user)?.lastName ?? '',
    email: user.email ?? ''
  }
})

/**
 * Découpe un nom complet (ex. "Marie Dupont") en prénom / nom.
 */
function splitName(user) {
  const full = user.fullName || user.name || ''
  const parts = full.trim().split(/\s+/)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  }
}

async function handleSubmit(data) {
  if (!eventStore.currentEvent) {
    return
  }

  // Normalisation des champs du formulaire vers le format attendu
  // par le store et par le backend
  // (POST /api/registrations : { eventId, participant: { fullName,
  // email, phone, dietaryRequirements } }).
  const current = eventStore.currentEvent
  const payload = {
    eventId: Number(current.id ?? current.eventId),
    eventTitle: current.title ?? current.name ?? '',
    eventDate: current.date ?? current.eventDate ?? '',
    fullName: [data.firstName, data.lastName].filter(Boolean).join(' ').trim(),
    email: data.email,
    phone: data.phone ?? '',
    dietary: data.dietaryRequirements ?? '',
    comments: data.comments ?? ''
  }

  await registrationStore.createRegistration(payload)

  if (registrationStore.error) {
    return
  }

  showModal.value = true

  // Recharger la liste « Mes inscriptions » après la fermeture
  // de la modale de confirmation (fetchRegistrations écrase la
  // liste locale ; on attend que l'utilisateur ait vu le message).
  setTimeout(() => {
    registrationStore.fetchRegistrations()
  }, 900)
}

function confirmRegistration() {
  showModal.value = false
  setTimeout(() => router.push({ name: 'my-registrations' }), 800)
}
</script>

<template>
  <div class="registration">
    <LoadingSpinner v-if="eventStore.loading" />

    <ErrorMessage
      v-if="eventStore.error"
      :message="eventStore.error"
    />

    <ErrorMessage
      v-if="registrationStore.error"
      :message="registrationStore.error"
    />

    <template v-if="eventStore.currentEvent">
      <p class="breadcrumb">
        <RouterLink :to="`/events/${eventStore.currentEvent.id}`">
          ← Retour à l'événement
        </RouterLink>
      </p>

      <p
        v-if="!authStore.isAuthenticated"
        class="note"
      >
        Vous pouvez vous connecter pour préremplir vos informations
        et garder un suivi de vos inscriptions.
      </p>

      <RegistrationForm
        :event-title="eventStore.currentEvent.title"
        :loading="registrationStore.loading"
        :initial="prefilledForm"
        @submit="handleSubmit"
      />
    </template>

    <div
      v-else-if="!eventStore.loading && !eventStore.error"
      class="not-found-inline card"
    >
      <p>Événement introuvable.</p>
    </div>

    <AppModal
      :open="showModal"
      title="Inscription confirmée"
      @close="showModal = false"
    >
      <p>
        Votre inscription à « <strong>{{ eventStore.currentEvent?.title }}</strong> » a bien été
        enregistrée. Vous serez redirigé vers vos inscriptions.
      </p>
      <template #footer>
        <AppButton
          variant="secondary"
          @click="showModal = false"
        >
          Fermer
        </AppButton>
        <AppButton @click="confirmRegistration">
          Voir mes inscriptions
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.registration {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.breadcrumb {
  color: var(--color-text-secondary);
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
