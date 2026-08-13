<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import ParticipantCard from '../components/participants/ParticipantCard.vue'
import ParticipantForm from '../components/participants/ParticipantForm.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import { useParticipantStore, useAuthStore } from '../stores'

/**
 * Profil participant.
 *
 * Un compte auth-service n'est pas automatiquement lie a un profil
 * participants-service (deux bases separees). Route /participants/nouveau :
 * formulaire de creation, pre-rempli avec l'email du compte connecte.
 * Route /participants/:id : consultation (et edition si c'est le
 * profil de l'utilisateur connecte, authStore.participantId).
 */
const route = useRoute()
const router = useRouter()
const participantStore = useParticipantStore()
const authStore = useAuthStore()

const isCreating = computed(() => route.params.id === 'nouveau')
const isOwnProfile = computed(
  () => !isCreating.value && authStore.participantId === Number(route.params.id)
)

onMounted(() => {
  if (!isCreating.value) {
    participantStore.fetchParticipantById(route.params.id)
  }
})

async function handleCreate(payload) {
  try {
    const created = await participantStore.createParticipant(payload)
    await authStore.resolveParticipantProfile()
    toast.success('Profil participant cree', { description: created.name })
    router.push({ name: 'participant-profile', params: { id: created.id } })
  } catch {
    toast.error(participantStore.error)
  }
}

async function handleUpdate(payload) {
  try {
    await participantStore.updateParticipant(route.params.id, payload)
    await authStore.resolveParticipantProfile()
    toast.success('Profil mis a jour')
  } catch {
    toast.error(participantStore.error)
  }
}
</script>

<template>
  <div class="mx-auto flex max-w-xl flex-col gap-4">
    <template v-if="isCreating">
      <h1 class="text-xl font-semibold text-slate-900">Creer mon profil participant</h1>
      <p class="text-sm text-slate-500">
        Necessaire pour vous inscrire a un evenement. Cree une seule fois.
      </p>
      <ErrorMessage v-if="participantStore.error" :message="participantStore.error" />
      <ParticipantForm :initial="{ email: authStore.user?.email }" :loading="participantStore.loading" @submit="handleCreate" />
    </template>

    <template v-else>
      <ErrorMessage v-if="participantStore.error" :message="participantStore.error" />
      <LoadingSpinner v-if="participantStore.loading" />

      <template v-else-if="participantStore.currentParticipant">
        <ParticipantCard :participant="participantStore.currentParticipant" :show-actions="false" />

        <div v-if="isOwnProfile" class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold text-slate-900">Modifier mon profil</h2>
          <ParticipantForm
            :initial="participantStore.currentParticipant"
            :loading="participantStore.loading"
            submit-label="Enregistrer les modifications"
            @submit="handleUpdate"
          />
        </div>
      </template>

      <div v-else class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        Le profil demande n'existe pas.
      </div>
    </template>
  </div>
</template>
