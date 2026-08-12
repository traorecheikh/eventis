<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

/**
 * Carte d'événement réutilisable.
 *
 * Props :
 * - event : objet événement (id, title, date, location, category,
 *           maxParticipants, currentParticipants, status)
 *
 * Affiche une barre de progression de la capacité et un badge
 * « Complet » lorsque toutes les places sont prises.
 */
const props = defineProps({
  event: {
    type: Object,
    required: true
  },
  /**
   * Mode administration : affiche les actions de gestion
   * (suppression déléguée au store via DELETE /api/events/:id).
   */
  admin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete'])

function handleDelete() {
  if (window.confirm(`Supprimer l'événement « ${props.event.title} » ?`)) {
    emit('delete', props.event.id)
  }
}

const fillPercent = computed(() => {
  const e = props.event
  if (!e.maxParticipants) return 0
  return Math.min(100, Math.round((e.currentParticipants / e.maxParticipants) * 100))
})

const isFull = computed(() => fillPercent.value >= 100)
</script>

<template>
  <article class="event-card card card-hover">
    <header class="event-card-header">
      <span class="event-category">{{ event.category }}</span>
      <span
        v-if="isFull"
        class="badge badge-danger"
      >Complet</span>
    </header>

    <h3 class="event-title">
      <RouterLink
        :to="`/events/${event.id}`"
        class="event-title-link"
      >
        {{ event.title }}
      </RouterLink>
    </h3>

    <ul class="event-meta">
      <li>📅 {{ event.date }}</li>
      <li>📍 {{ event.location }}</li>
      <li>👥 {{ event.currentParticipants }} / {{ event.maxParticipants }} participants</li>
    </ul>

    <div class="event-capacity">
      <div
        class="event-capacity-bar"
        :class="{ full: isFull }"
        role="progressbar"
        :aria-valuenow="fillPercent"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="`${fillPercent}% des places occupées`"
        :style="{ width: fillPercent + '%' }"
      />
      <span class="event-capacity-text">{{ fillPercent }}% rempli</span>
    </div>

    <footer class="event-card-footer">
      <RouterLink
        :to="`/events/${event.id}`"
        class="btn btn-secondary btn-sm"
      >
        Voir les détails
      </RouterLink>
      <RouterLink
        v-if="!isFull"
        :to="`/events/${event.id}/register`"
        class="btn btn-primary btn-sm"
      >
        S'inscrire
      </RouterLink>
      <span
        v-else
        class="btn btn-ghost btn-sm"
        aria-disabled="true"
      >
        Places épuisées
      </span>
      <button
        v-if="admin"
        type="button"
        class="btn btn-danger-outline btn-sm"
        @click="handleDelete"
      >
        Supprimer
      </button>
    </footer>
  </article>
</template>

<style scoped>
.event-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
}

.event-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.event-category {
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
}

.event-title {
  font-size: var(--font-size-lg);
}

.event-title-link {
  color: var(--color-ink);
  text-decoration: none;
}

.event-title-link:hover {
  color: var(--color-primary);
}

.event-meta {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.event-capacity {
  margin-top: auto;
}

.event-capacity-bar {
  height: 6px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width 400ms ease;
}

.event-capacity-bar.full {
  background: var(--color-danger);
}

.event-capacity-text {
  display: block;
  margin-top: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.event-card-footer {
  display: flex;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}
</style>
