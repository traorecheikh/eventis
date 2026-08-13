<script setup>
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Plus } from 'lucide-vue-next'
import EventFilter from '../components/events/EventFilter.vue'
import EventList from '../components/events/EventList.vue'
import EventForm from '../components/events/EventForm.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import AppButton from '../components/common/AppButton.vue'
import AppModal from '../components/common/AppModal.vue'
import { useEventStore, useAuthStore } from '../stores'

/**
 * Liste des evenements.
 *
 * La logique est deleguee au eventStore (architecture View ->
 * Component -> Store -> Service API -> Axios). GET /api/events ne
 * propose pas de recherche plein texte cote serveur : le filtrage
 * (EventFilter) s'applique uniquement sur la page chargee.
 *
 * La creation (POST /api/events) exige un Bearer JWT mais aucun
 * role particulier cote backend : le bouton de creation est visible
 * pour tout utilisateur connecte. PUT/DELETE /events/:id n'existent
 * pas encore : aucune action d'edition ou de suppression ici.
 */
const eventStore = useEventStore()
const authStore = useAuthStore()

const search = ref('')
const showCreateModal = ref(false)

onMounted(() => {
  eventStore.fetchEvents({ page: 1 })
})

async function handleFilter(value) {
  search.value = value
  await eventStore.fetchEvents({ page: 1, search: value })
}

async function goToPage(page) {
  await eventStore.fetchEvents({ page, search: search.value })
}

async function handleCreate(payload) {
  try {
    await eventStore.addEvent(payload)
    showCreateModal.value = false
    toast.success('Evenement cree avec succes', { description: payload.title })
    await eventStore.fetchEvents({ page: 1, search: search.value })
  } catch {
    toast.error(eventStore.error || "La creation de l'evenement a echoue.")
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <section
      v-motion
      :initial="{ opacity: 0, y: 12 }"
      :enter="{ opacity: 1, y: 0 }"
      class="flex flex-wrap items-start justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Evenements</h1>
        <p class="mt-1 text-slate-500">
          Decouvrez les conferences, ateliers et seminaires a venir.
        </p>
      </div>
      <AppButton v-if="authStore.isAuthenticated" @click="showCreateModal = true">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Creer un evenement
      </AppButton>
    </section>

    <EventFilter @filter="handleFilter" />

    <ErrorMessage v-if="eventStore.error" :message="eventStore.error" />

    <LoadingSpinner v-if="eventStore.loading" />

    <template v-else>
      <EventList :events="eventStore.events" />

      <div
        v-if="eventStore.pagination.totalPages > 1"
        class="flex items-center justify-center gap-3"
      >
        <AppButton
          variant="ghost"
          size="sm"
          :disabled="eventStore.pagination.page <= 1"
          @click="goToPage(eventStore.pagination.page - 1)"
        >
          Precedent
        </AppButton>
        <span class="text-sm text-slate-500">
          Page {{ eventStore.pagination.page }} sur {{ eventStore.pagination.totalPages }}
        </span>
        <AppButton
          variant="ghost"
          size="sm"
          :disabled="eventStore.pagination.page >= eventStore.pagination.totalPages"
          @click="goToPage(eventStore.pagination.page + 1)"
        >
          Suivant
        </AppButton>
      </div>
    </template>

    <AppModal
      :open="showCreateModal"
      title="Creer un evenement"
      @close="showCreateModal = false"
    >
      <EventForm @submit="handleCreate" @cancel="showCreateModal = false" />
    </AppModal>
  </div>
</template>
