<script setup>
import { onMounted } from 'vue'
import { toast } from 'vue-sonner'
import RegistrationCard from '../components/registrations/RegistrationCard.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import { useRegistrationStore, useAuthStore } from '../stores'

/**
 * Page "Mes inscriptions".
 *
 * Necessite un profil participant (authStore.participantId) : sans
 * lui, aucune inscription ne peut exister pour ce compte.
 */
const registrationStore = useRegistrationStore()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.participantId) {
    registrationStore.fetchMyRegistrations(authStore.participantId)
  }
})

async function handleCancel(id) {
  const registration = registrationStore.registrations.find((r) => r.id === id)
  if (!window.confirm(`Annuler votre inscription a "${registration?.event?.title || 'cet evenement'}" ?`)) {
    return
  }
  try {
    await registrationStore.cancelRegistration(id)
    toast.success('Inscription annulee')
  } catch {
    toast.error(registrationStore.error)
  }
}
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-2">
    <h1 class="text-2xl font-semibold text-slate-900">Mes inscriptions</h1>
    <p class="text-slate-500">Retrouvez ici tous vos evenements et le statut de votre inscription.</p>

    <template v-if="!authStore.participantId">
      <div class="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Creez d'abord votre
        <RouterLink :to="{ name: 'participant-profile', params: { id: 'nouveau' } }" class="font-medium text-brand-600 hover:text-brand-700">
          profil participant
        </RouterLink>
        pour voir vos inscriptions.
      </div>
    </template>

    <template v-else>
      <ErrorMessage v-if="registrationStore.error" class="mt-4" :message="registrationStore.error" />
      <LoadingSpinner v-if="registrationStore.loading" />

      <div v-else-if="registrationStore.registrations.length > 0" class="mt-4 flex flex-col gap-4">
        <RegistrationCard
          v-for="registration in registrationStore.registrations"
          :key="registration.id"
          :registration="registration"
          @cancel="handleCancel"
        />
      </div>

      <p v-else class="mt-6 text-slate-500">
        Vous n'etes inscrit a aucun evenement pour le moment.
        <RouterLink to="/events" class="font-medium text-brand-600 hover:text-brand-700">Decouvrir les evenements</RouterLink>
      </p>
    </template>
  </div>
</template>
