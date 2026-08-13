<script setup>
import { computed } from 'vue'

/**
 * Graphique en barres (SVG pur, sans dependance externe).
 *
 * Props :
 * - data : tableau d'objets { label: string, value: number }
 * - title : titre du graphique
 */
const props = defineProps({
  data: {
    type: Array,
    required: true,
    validator: (arr) => arr.every((d) => typeof d.label === 'string' && typeof d.value === 'number')
  },
  title: {
    type: String,
    default: 'Inscriptions par evenement'
  }
})

const maxValue = computed(() => Math.max(...props.data.map((d) => d.value), 1))
const ariaSummary = computed(() => props.data.map((d) => `${d.label} : ${d.value} inscriptions`).join(', '))

const padding = { top: 12, right: 8, bottom: 32, left: 8 }
const width = 520
const height = 200

const barWidth = computed(() => {
  const n = props.data.length || 1
  return (width - padding.left - padding.right) / n - 8
})
</script>

<template>
  <figure class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" :aria-label="title">
    <figcaption class="mb-4 text-base font-semibold text-slate-900">{{ title }}</figcaption>

    <svg
      :width="width"
      :height="height"
      viewBox="0 0 520 200"
      role="img"
      :aria-label="`${title} : ${ariaSummary}`"
      class="block h-auto w-full"
    >
      <rect
        v-for="(d, i) in data"
        :key="d.label"
        :x="padding.left + i * (width - padding.left - padding.right) / data.length + 4"
        :y="height - padding.bottom - (d.value / maxValue) * (height - padding.top - padding.bottom)"
        :width="barWidth"
        :height="(d.value / maxValue) * (height - padding.top - padding.bottom)"
        fill="#216d66"
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
        fill="#64748b"
      >
        {{ d.label }}
      </text>
    </svg>

    <ul class="sr-only">
      <li v-for="d in data" :key="d.label">{{ d.label }} : {{ d.value }} inscriptions</li>
    </ul>
  </figure>
</template>
