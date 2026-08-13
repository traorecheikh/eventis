<script setup>
import { computed, onMounted } from 'vue'
import EventStatistics from '../components/dashboard/EventStatistics.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import { useEventStore, useParticipantStore, useRegistrationStore } from '../stores'

/**
 * Tableau de bord : statistiques reelles issues de
 * GET /api/registrations/stats, croisees avec les titres
 * d'evenements charges (eventStore) pour le graphique.
 */
const eventStore = useEventStore()
const participantStore = useParticipantStore()
const registrationStore = useRegistrationStore()

onMounted(() => {
  eventStore.fetchEvents({ limit: 100 })
  participantStore.fetchParticipants({ limit: 1 })
  registrationStore.fetchGlobalStats()
})

const statsReady = computed(
  () => !eventStore.loading && !participantStore.loading && !registrationStore.loading
)

const statistics = computed(() => {
  const stats = registrationStore.globalStats
  if (!stats) return null

  const eventTitle = (id) => eventStore.events.find((e) => e.id === id)?.title || `Evenement #${id}`

  return {
    totalRegistrations: stats.totalRegistrations,
    totalConfirmed: stats.totalConfirmed,
    totalCancelled: stats.totalCancelled,
    activeEventsCount: eventStore.pagination.total,
    participantsCount: participantStore.pagination.total,
    chartData: (stats.byEvent || []).map((row) => ({
      label: eventTitle(row.eventId),
      value: row.confirmedCount
    }))
  }
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <h2 class="text-lg font-semibold text-slate-900">Vue d'ensemble</h2>

    <ErrorMessage v-if="eventStore.error || registrationStore.error" :message="eventStore.error || registrationStore.error" />

    <LoadingSpinner v-if="!statsReady" label="Chargement des statistiques..." />

    <EventStatistics v-else-if="statistics" :statistics="statistics" />
  </div>
</template>
