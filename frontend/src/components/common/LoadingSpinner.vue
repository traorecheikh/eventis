<script setup>
/**
 * Indicateur de chargement reutilisable.
 *
 * Props :
 * - size : 'sm' | 'md' | 'lg' (defaut 'md')
 * - label : texte accessible lu par les lecteurs d'ecran
 */
import { computed } from 'vue'
import { LoaderCircle } from 'lucide-vue-next'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  label: {
    type: String,
    default: 'Chargement en cours…'
  }
})

const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
const classes = computed(() => sizes[props.size])
</script>

<template>
  <div class="flex items-center justify-center py-8" role="status" :aria-label="label">
    <LoaderCircle :class="classes" class="animate-spin text-brand-600" aria-hidden="true" />
    <span class="sr-only">{{ label }}</span>
  </div>
</template>
