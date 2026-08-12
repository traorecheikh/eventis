<script setup>
import { computed } from 'vue'
import StatCard from './StatCard.vue'
import RegistrationChart from './RegistrationChart.vue'

/**
 * Bloc de statistiques d'événements pour le tableau de bord.
 *
 * Props :
 * - statistics : objet statistiques calculé par DashboardView
 *   (activeEvents, totalParticipants, remainingSeats, fillRate,
 *    byMonth { label: count }, byCategory { category: count })
 *
 * Les données proviennent des stores (eventStore, registrationStore)
 * et reflètent les données réelles de l'API (ou du repli local).
 */
const props = defineProps({
  statistics: {
    type: Object,
    required: true
  }
})

/**
 * Le RegistrationChart attend une liste
 * { label, value }. On convertit l'objet byMonth ici.
 */
const monthlyData = computed(() =>
  Object.entries(props.statistics.byMonth ?? {}).map(
    ([label, value]) => ({ label, value })
  )
)

/**
 * Conversion de l'objet byCategory vers la liste attendue par
 * le composant { category, count }.
 */
const categoriesData = computed(() =>
  Object.entries(props.statistics.byCategory ?? {})
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
)

/**
 * Indicateurs clés affichés sous forme de StatCard :
 * événements actifs, participants inscrits, places restantes,
 * taux de remplissage moyen.
 */
const keyStats = computed(() => [
  {
    label: 'Événements actifs',
    value: props.statistics.activeEvents ?? 0,
    tone: 'info'
  },
  {
    label: 'Participants inscrits',
    value: props.statistics.totalParticipants ?? 0,
    tone: 'success'
  },
  {
    label: 'Places restantes',
    value: props.statistics.remainingSeats ?? 0,
    tone: 'warning'
  },
  {
    label: 'Taux de remplissage',
    value: props.statistics.fillRate ?? 0,
    tone: 'primary',
    suffix: '%'
  }
])
</script>

<template>
  <section
    class="event-statistics"
    aria-label="Statistiques des événements"
  >
    <h2 class="event-statistics-title">
      Vue d'ensemble
    </h2>

    <div class="stat-grid">
      <StatCard
        v-for="stat in keyStats"
        :key="stat.label"
        :label="stat.label"
        :value="`${stat.value}${stat.suffix ?? ''}`"
        :tone="stat.tone"
      />
    </div>

    <div class="charts-grid">
      <RegistrationChart
        v-if="monthlyData.length > 0"
        title="Inscriptions par mois"
        :data="monthlyData"
      />

      <div class="categories-card card">
        <h3 class="chart-title">
          Événements par catégorie
        </h3>
        <ul
          v-if="categoriesData.length > 0"
          class="categories-list"
        >
          <li
            v-for="item in categoriesData"
            :key="item.category"
            class="category-row"
          >
            <span class="category-name">{{ item.category }}</span>
            <span class="badge badge-info">{{ item.count }}</span>
          </li>
        </ul>
        <p
          v-else
          class="empty-state"
        >
          Aucun événement chargé pour le moment.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.event-statistics {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.event-statistics-title {
  font-size: var(--font-size-xl);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

.charts-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: var(--space-4);
  align-items: start;
}

.chart-title {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: var(--space-4);
}

.categories-card {
  padding: var(--space-5);
}

.categories-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.empty-state {
  font-size: var(--font-size-sm);
  font-style: italic;
  color: var(--color-text-muted);
}

.category-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.category-name {
  color: var(--color-text);
}

@media (max-width: 960px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
