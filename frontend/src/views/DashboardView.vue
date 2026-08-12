<script setup>
import { computed, onMounted } from 'vue'
import EventStatistics from '../components/dashboard/EventStatistics.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import {
  useEventStore,
  useParticipantStore,
  useRegistrationStore
} from '../stores'

/**
 * Tableau de bord de gestion connecté aux stores métier.
 *
 * Les statistiques sont calculées à partir des données réelles
 * chargées depuis l'API (eventStore, participantStore,
 * registrationStore). Si le backend est indisponible, les stores
 * replient sur les données mockées locales : le tableau de bord
 * reste donc toujours fonctionnel.
 */
const eventStore = useEventStore()
const participantStore = useParticipantStore()
const registrationStore = useRegistrationStore()

onMounted(async () => {
  await Promise.all([
    eventStore.fetchEvents(),
    participantStore.fetchParticipants(),
    registrationStore.fetchRegistrations()
  ])
})

/**
 * Statistiques calculées depuis les données chargées.
 */
const statistics = computed(() => {
  const events = eventStore.events
  const registrations = registrationStore.registrations

  const activeEvents = events.filter((event) => event.remainingSeats > 0)
  const totalParticipants = events.reduce(
    (sum, event) => sum + (event.currentParticipants ?? 0),
    0
  )
  const remainingSeats = events.reduce(
    (sum, event) => sum + Math.max(0, event.remainingSeats ?? 0),
    0
  )
  const totalCapacity = events.reduce(
    (sum, event) => sum + (event.maxParticipants ?? 0),
    0
  )
  const fillRate =
    totalCapacity > 0
      ? Math.round((totalParticipants / totalCapacity) * 100)
      : 0

  // Répartition des inscriptions par mois (format « mois : n »)
  // lorsque les inscriptions portent une date ; sinon répartition
  // par statut.
  const byMonth = registrations.reduce((acc, registration) => {
    const label = registration.monthLabel ?? registration.registeredAt ?? '—'
    acc[label] = (acc[label] ?? 0) + 1
    return acc
  }, {})

  // Répartition des événements par catégorie
  const byCategory = events.reduce((acc, event) => {
    const category = event.category || 'Général'
    acc[category] = (acc[category] ?? 0) + 1
    return acc
  }, {})

  return {
    activeEvents: activeEvents.length,
    totalParticipants,
    remainingSeats,
    fillRate,
    byMonth,
    byCategory
  }
})

const statsReady = computed(
  () => !eventStore.loading && !participantStore.loading && !registrationStore.loading
)
</script>

<template>
  <div class="dashboard">
    <h2 class="section-title">
      Vue d'ensemble
    </h2>

    <ErrorMessage
      v-if="eventStore.error || registrationStore.error"
      :message="eventStore.error || registrationStore.error"
    />

    <LoadingSpinner
      v-if="!statsReady"
      label="Chargement des statistiques…"
    />

    <template v-else>
      <div class="stats-grid">
        <StatCard
          label="Événements actifs"
          :value="statistics.activeEvents"
          tone="primary"
        />
        <StatCard
          label="Participants inscrits"
          :value="statistics.totalParticipants"
          tone="success"
        />
        <StatCard
          label="Places restantes"
          :value="statistics.remainingSeats"
          tone="info"
        />
        <StatCard
          label="Taux de remplissage"
          :value="`${statistics.fillRate}%`"
          tone="warning"
        />
      </div>

      <EventStatistics :statistics="statistics" />

      <p class="note">
        Statistiques calculées à partir des données de l'API (événements,
        inscriptions). Si le backend est indisponible, les données locales
        sont utilisées en repli.
      </p>
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-title {
  font-size: var(--font-size-lg);
  color: var(--color-ink);
  margin-bottom: var(--space-1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
}

.note {
  font-size: var(--font-size-sm);
  font-style: italic;
  color: var(--color-text-muted);
}
</style>
