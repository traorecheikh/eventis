<script setup>
/**
 * Carte de statistique pour le tableau de bord.
 *
 * Props :
 * - label : libellé de la statistique (ex : « Événements actifs »)
 * - value : valeur affichée (ex : 4, « 70 % »)
 * - tone  : 'primary' | 'success' | 'warning' | 'info' (défaut 'primary')
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
</script>

<template>
  <div
    class="stat-card card"
    :class="`stat-card-${tone}`"
  >
    <span
      class="stat-accent"
      aria-hidden="true"
    />
    <span class="stat-value">{{ value }}</span>
    <span class="stat-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.stat-card {
  position: relative;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stat-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  background: var(--color-primary);
}

.stat-card-success .stat-accent {
  background: var(--color-success);
}

.stat-card-warning .stat-accent {
  background: var(--color-warning);
}

.stat-card-info .stat-accent {
  background: var(--color-info);
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  color: var(--color-ink);
  line-height: 1.1;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
</style>
