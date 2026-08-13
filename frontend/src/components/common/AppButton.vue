<script setup>
/**
 * Bouton reutilisable de l'application.
 *
 * Props :
 * - variant : 'primary' | 'secondary' | 'ghost' | 'danger' (defaut 'primary')
 * - size    : 'sm' | 'md' | 'lg' (defaut 'md')
 * - disabled : desactive le bouton
 * - loading  : affiche un mini spinner et desactive le bouton
 */
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost', 'danger'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  disabled: Boolean,
  loading: Boolean,
  type: {
    type: String,
    default: 'button'
  }
})

defineEmits(['click'])

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed'

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-600',
  secondary: 'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 focus-visible:ring-brand-600',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600'
}

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base'
}

const classes = computed(() => [base, variants[props.variant], sizes[props.size]])
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" aria-hidden="true" />
    <slot />
  </button>
</template>
