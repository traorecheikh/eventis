<script setup>
import { computed } from 'vue'

/**
 * Graphique en barres des inscriptions mensuelles (SVG pur,
 * sans dépendance externe).
 *
 * Props :
 * - data : tableau d'objets { label: string, value: number }
 * - title : titre du graphique
 *
 * Accessibilité : <svg> avec role="img", titre et étiquettes aria.
 */
const props = defineProps({
  data: {
    type: Array,
    required: true,
    validator: (arr) => arr.every((d) => typeof d.label === 'string' && typeof d.value === 'number')
  },
  title: {
    type: String,
    default: 'Inscriptions par mois'
  }
})

const svgId = computed(() => `chart-${Math.random().toString(36).slice(2, 8)}`)

const maxValue = computed(() => Math.max(...props.data.map((d) => d.value), 1))

const padding = { top: 12, right: 8, bottom: 32, left: 8 }
const width = 520
const height = 200

const barWidth = computed(() => {
  const n = props.data.length || 1
  return (width - padding.left - padding.right) / n - 8
})
</script>

<template>
  <figure
    class="chart-card card"
    :aria-label="title"
  >
    <figcaption class="chart-title">
      {{ title }}
    </figcaption>

    <svg
      :id="svgId"
      :width="width"
      :height="height"
      viewBox="0 0 520 200"
      role="img"
      :aria-label="`${title} — ${data.map(d => `${d.label}: ${d.value} inscriptions`).join(', ')}`"
      class="chart-svg"
    >
      <rect
        v-for="(d, i) in data"
        :key="d.label"
        :x="padding.left + i * (width - padding.left - padding.right) / data.length + 4"
        :y="height - padding.bottom - (d.value / maxValue) * (height - padding.top - padding.bottom)"
        :width="barWidth"
        :height="(d.value / maxValue) * (height - padding.top - padding.bottom)"
        fill="var(--color-primary)"
        rx="4"
      >
        <title>{{ `${d.label} : ${d.value} inscriptions` }}</title>
      </rect>

      <text
        v-for="(d, i) in data"
        :key="`label-${d.label}`"
        :x="padding.left + i * (width - padding.left - padding.right) / data.length + barWidth / 2 + 4"
        :y="height - 10"
        text-anchor="middle"
        font-size="11"
        fill="var(--color-text-muted)"
      >
        {{ d.label }}
      </text>
    </svg>

    <ul class="chart-legend sr-only">
      <li
        v-for="d in data"
        :key="d.label"
      >
        {{ d.label }} : {{ d.value }} inscriptions
      </li>
    </ul>
  </figure>
</template>

<style scoped>
.chart-card {
  padding: var(--space-5);
}

.chart-title {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: var(--space-4);
}

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
}
</style>
