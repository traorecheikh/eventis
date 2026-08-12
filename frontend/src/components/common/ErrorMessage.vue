<script setup>
/**
 * Bandeau d'erreur réutilisable.
 *
 * Props :
 * - message : texte de l'erreur (obligatoire)
 * - retryLabel : libellé du bouton de relance (optionnel)
 *
 * Événements :
 * - retry : émis lorsque l'utilisateur clique sur « Réessayer »
 */
defineProps({
  message: {
    type: String,
    required: true
  },
  retryLabel: {
    type: String,
    default: 'Réessayer'
  }
})

defineEmits(['retry'])
</script>

<template>
  <div
    class="error-message"
    role="alert"
  >
    <span
      class="error-icon"
      aria-hidden="true"
    >⚠</span>
    <p class="error-text">
      {{ message }}
    </p>
    <button
      v-if="$slots.retry"
      type="button"
      class="btn btn-ghost btn-sm"
      @click="$emit('retry')"
    >
      {{ retryLabel }}
    </button>
  </div>
</template>

<style scoped>
.error-message {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  background: var(--color-danger-soft);
  border: 1px solid #fecaca;
  color: var(--color-danger);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.error-icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  min-width: 120px;
}
</style>
