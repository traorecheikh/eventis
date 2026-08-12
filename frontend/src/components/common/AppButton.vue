<script setup>
/**
 * Bouton réutilisable de l'application.
 *
 * Props :
 * - variant : 'primary' | 'secondary' | 'ghost' | 'danger' (défaut 'primary')
 * - size    : 'sm' | 'md' | 'lg' (défaut 'md')
 * - disabled : désactive le bouton
 * - loading  : affiche un mini spinner et désactive le bouton
 */
import { computed } from 'vue'

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

const classes = computed(() => [
  'btn',
  `btn-${props.variant}`,
  { 'btn-sm': props.size === 'sm', 'btn-lg': props.size === 'lg' }
])
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span
      v-if="loading"
      class="btn-loading-spinner"
      aria-hidden="true"
    />
    <span><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  position: relative;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.btn-secondary .btn-loading-spinner,
.btn-ghost .btn-loading-spinner {
  border-color: rgba(29, 78, 216, 0.35);
  border-top-color: var(--color-primary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn-loading-spinner {
    animation: none;
  }
}
</style>
