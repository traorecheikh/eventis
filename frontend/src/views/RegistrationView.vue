<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ArrowLeft, CalendarDays, MapPin, Users, CircleCheck } from 'lucide-vue-next'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import AppModal from '../components/common/AppModal.vue'
import AppButton from '../components/common/AppButton.vue'
import { useEventStore, useRegistrationStore, useAuthStore } from '../stores'

/**
 * Confirmation d'inscription a un evenement.
 *
 * Le backend lie une inscription a un participant existant
 * (eventId + participantId), il n'accepte pas de details de
 * participant en ligne : l'utilisateur doit etre connecte et avoir
 * un profil participant (authStore.participantId) avant de pouvoir
 * confirmer.
 */
const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
const registrationStore = useRegistrationStore()
const authStore = useAuthStore()

const showModal = ref(false)

onMounted(() => {
  eventStore.fetchEventById(route.params.eventId)
})

async function handleConfirm() {
  try {
    await registrationStore.register(route.params.eventId, authStore.participantId)
    await eventStore.refreshAvailability(route.params.eventId)
    showModal.value = true
  } catch {
    toast.error(registrationStore.error)
  }
}

function goToMyRegistrations() {
  showModal.value = false
  router.push({ name: 'my-registrations' })
}
</script>

<template>
  <div class="mx-auto flex max-w-2xl flex-col gap-4">
    <RouterLink :to="`/events/${route.params.eventId}`" class="inline-flex w-fit items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600">
      <ArrowLeft class="h-4 w-4" aria-hidden="true" />
      Retour a l'evenement
    </RouterLink>

    <LoadingSpinner v-if="eventStore.loading" />
    <ErrorMessage v-else-if="eventStore.error" :message="eventStore.error" />

    <template v-else-if="eventStore.currentEvent">
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 class="text-xl font-semibold text-slate-900">S'inscrire a l'evenement</h1>
        <p class="mt-1 text-lg font-medium text-brand-700">{{ eventStore.currentEvent.title }}</p>
        <ul class="mt-3 flex flex-col gap-1.5 text-sm text-slate-600">
          <li class="flex items-center gap-2">
            <CalendarDays class="h-4 w-4 text-brand-600" aria-hidden="true" /> {{ eventStore.currentEvent.date }}
          </li>
          <li class="flex items-center gap-2">
            <MapPin class="h-4 w-4 text-brand-600" aria-hidden="true" /> {{ eventStore.currentEvent.location }}
          </li>
          <li v-if="eventStore.currentAvailability" class="flex items-center gap-2">
            <Users class="h-4 w-4 text-brand-600" aria-hidden="true" />
            {{ eventStore.currentAvailability.remainingSeats }} place(s) restante(s) sur {{ eventStore.currentAvailability.maxCapacity }}
          </li>
        </ul>

        <div class="mt-6 border-t border-slate-200 pt-5">
          <template v-if="!authStore.isAuthenticated">
            <p class="text-sm text-slate-600">Connectez-vous pour vous inscrire a cet evenement.</p>
            <RouterLink
              :to="{ name: 'login', query: { redirect: route.fullPath } }"
              class="mt-3 inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
            >
              Se connecter
            </RouterLink>
          </template>

          <template v-else-if="!authStore.participantId">
            <p class="text-sm text-slate-600">
              Votre compte n'a pas encore de profil participant. Creez-le pour pouvoir vous inscrire.
            </p>
            <RouterLink
              :to="{ name: 'participant-profile', params: { id: 'nouveau' } }"
              class="mt-3 inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
            >
              Creer mon profil participant
            </RouterLink>
          </template>

          <template v-else>
            <p class="text-sm text-slate-600">
              Inscription au nom de <strong>{{ authStore.participantProfile.name }}</strong>
              ({{ authStore.participantProfile.email }}).
            </p>
            <ErrorMessage v-if="registrationStore.error" class="mt-3" :message="registrationStore.error" />
            <AppButton class="mt-3" size="lg" :loading="registrationStore.loading" :disabled="eventStore.currentAvailability?.isFull" @click="handleConfirm">
              {{ eventStore.currentAvailability?.isFull ? 'Evenement complet' : "Confirmer l'inscription" }}
            </AppButton>
          </template>
        </div>
      </div>
    </template>

    <div v-else class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
      Evenement introuvable.
    </div>

    <AppModal :open="showModal" title="Inscription confirmee" @close="showModal = false">
      <div class="flex items-start gap-3">
        <CircleCheck class="h-6 w-6 shrink-0 text-brand-600" aria-hidden="true" />
        <p class="text-slate-700">
          Votre inscription a <strong>{{ eventStore.currentEvent?.title }}</strong> a bien ete enregistree.
        </p>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="showModal = false">Fermer</AppButton>
        <AppButton @click="goToMyRegistrations">Voir mes inscriptions</AppButton>
      </template>
    </AppModal>
  </div>
</template>
