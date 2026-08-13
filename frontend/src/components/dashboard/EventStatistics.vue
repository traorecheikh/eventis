<script setup>
import { computed } from 'vue'
import StatCard from './StatCard.vue'
import RegistrationChart from './RegistrationChart.vue'

/**
 * Bloc de statistiques pour le tableau de bord.
 *
 * Props :
 * - statistics : { totalRegistrations, totalConfirmed, totalCancelled,
 *                   activeEventsCount, participantsCount,
 *                   chartData: [{label, value}] }
 *   (donnees reelles issues de GET /api/registrations/stats)
 */
const props = defineProps({
  statistics: {
    type: Object,
    required: true
  }
})

const keyStats = computed(() => [
  { label: 'Evenements', value: props.statistics.activeEventsCount ?? 0, tone: 'info' },
  { label: 'Participants', value: props.statistics.participantsCount ?? 0, tone: 'primary' },
  { label: 'Inscriptions confirmees', value: props.statistics.totalConfirmed ?? 0, tone: 'success' },
  { label: 'Inscriptions annulees', value: props.statistics.totalCancelled ?? 0, tone: 'warning' }
])
</script>

<template>
  <section class="flex flex-col gap-5" aria-label="Statistiques">
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard v-for="stat in keyStats" :key="stat.label" :label="stat.label" :value="stat.value" :tone="stat.tone" />
    </div>

    <RegistrationChart
      v-if="statistics.chartData?.length > 0"
      title="Inscriptions confirmees par evenement"
      :data="statistics.chartData"
    />
    <p v-else class="text-sm italic text-slate-500">Aucune inscription pour le moment.</p>
  </section>
</template>
