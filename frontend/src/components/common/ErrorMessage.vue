<script setup>
/**
 * Bandeau d'erreur reutilisable.
 *
 * Props :
 * - message : texte de l'erreur (obligatoire)
 * - retryLabel : libelle du bouton de relance (optionnel)
 *
 * Evenements :
 * - retry : emis lorsque l'utilisateur clique sur « Reessayer »
 */
import { TriangleAlert } from 'lucide-vue-next'

defineProps({
  message: {
    type: String,
    required: true
  },
  retryLabel: {
    type: String,
    default: 'Reessayer'
  }
})

defineEmits(['retry'])
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    role="alert"
  >
    <TriangleAlert class="h-5 w-5 shrink-0" aria-hidden="true" />
    <p class="min-w-[120px] flex-1">
      {{ message }}
    </p>
    <button
      v-if="$slots.retry"
      type="button"
      class="rounded-md border border-red-300 px-3 py-1 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
      @click="$emit('retry')"
    >
      {{ retryLabel }}
    </button>
  </div>
</template>
