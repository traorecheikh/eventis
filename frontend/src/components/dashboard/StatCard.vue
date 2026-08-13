<script setup>
/**
 * Carte de statistique pour le tableau de bord.
 *
 * Props :
 * - label : libelle de la statistique
 * - value : valeur affichee
 * - tone  : 'primary' | 'success' | 'warning' | 'info' (defaut 'primary')
 */
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  tone: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'success', 'warning', 'info'].includes(v)
  }
})

const accents = {
  primary: 'bg-brand-600',
  success: 'bg-emerald-500',
  warning: 'bg-accent-500',
  info: 'bg-sky-500'
}
</script>

<template>
  <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5">
    <span class="absolute inset-x-0 top-0 h-1" :class="accents[tone]" aria-hidden="true" />
    <span class="block text-3xl font-extrabold leading-tight text-slate-900">{{ value }}</span>
    <span class="mt-1 block text-sm text-slate-500">{{ label }}</span>
  </div>
</template>
