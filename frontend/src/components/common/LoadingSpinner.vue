<script setup>
/**
 * Indicateur de chargement réutilisable.
 *
 * Props :
 * - size : 'sm' | 'md' | 'lg' (défaut 'md')
 * - label : texte accessible lu par les lecteurs d'écran
 */
defineProps({
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
</script>

<template>
  <div
    class="spinner-wrapper"
    role="status"
    :aria-label="label"
  >
    <span
      :class="['spinner', `spinner-${size}`]"
      aria-hidden="true"
    />
    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<style scoped>
.spinner-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
}

.spinner {
  display: inline-block;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.spinner-sm {
  width: 18px;
  height: 18px;
}

.spinner-md {
  width: 32px;
  height: 32px;
}

.spinner-lg {
  width: 48px;
  height: 48px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
    border-top-color: var(--color-primary);
    border-color: var(--color-border);
  }
}
</style>
