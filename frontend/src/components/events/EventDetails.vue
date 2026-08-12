<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

/**
 * Bloc de détails d'un événement.
 *
 * Props :
 * - event : objet événement complet
 *
 * Affiche description, infos pratiques, capacité et
 * appels à l'action.
 */
const props = defineProps({
  event: {
    type: Object,
    required: true
  },
  /**
   * Mode administration : affiche les actions de gestion
   * (modifier / supprimer déléguées au store).
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
  <section
    class="event-details card"
    :aria-label="`Détails de l'événement ${event.title}`"
  >
    <header class="event-details-header">
      <div>
        <span class="event-category">{{ event.category }}</span>
        <h1 class="event-title">
          {{ event.title }}
        </h1>
      </div>
      <span
        v-if="isFull"
        class="badge badge-danger"
      >Complet</span>
    </header>

    <ul class="event-details-meta">
      <li>📅 <strong>Date :</strong> {{ event.date }}</li>
      <li>🕐 <strong>Horaire :</strong> {{ event.time }}</li>
      <li>📍 <strong>Lieu :</strong> {{ event.location }}</li>
      <li>🎤 <strong>Organisateur :</strong> {{ event.organizer }}</li>
    </ul>

    <div class="event-details-description">
      <h2>Description</h2>
      <p>{{ event.description }}</p>
    </div>

    <div class="event-details-capacity">
      <div class="capacity-info">
        <span>Places occupées</span>
        <strong>{{ event.currentParticipants }} / {{ event.maxParticipants }}</strong>
      </div>
      <div class="capacity-bar-track">
        <div
          class="capacity-bar-fill"
          :class="{ full: isFull }"
          role="progressbar"
          :aria-valuenow="fillPercent"
          aria-valuemin="0"
          aria-valuemax="100"
          :style="{ width: fillPercent + '%' }"
        />
      </div>
      <span class="capacity-percent">{{ fillPercent }}% rempli</span>
    </div>

    <footer class="event-details-actions">
      <RouterLink
        to="/events"
        class="btn btn-ghost"
      >
        ← Retour à la liste
      </RouterLink>
      <RouterLink
        v-if="!isFull"
        :to="`/events/${event.id}/register`"
        class="btn btn-primary btn-lg"
      >
        S'inscrire à cet événement
      </RouterLink>
      <span
        v-else
        class="btn btn-ghost btn-lg"
        aria-disabled="true"
      >
        Toutes les places sont réservées
      </span>
      <RouterLink
        v-if="admin"
        :to="props.admin ? `/events/${event.id}/edit?admin=1` : `/events/${event.id}/edit`"
        class="btn btn-secondary"
      >
        ✏️ Modifier
      </RouterLink>
      <button
        v-if="admin"
        type="button"
        class="btn btn-danger"
        @click="handleDelete"
      >
        Supprimer
      </button>
    </footer>
  </section>
</template>

<style scoped>
.event-details {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.event-details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
}

.event-category {
  display: inline-block;
  margin-bottom: var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
}

.event-title {
  font-size: var(--font-size-2xl);
}

.event-details-meta {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.event-details-description h2 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-2);
}

.event-details-description p {
  color: var(--color-text-secondary);
}

.event-details-capacity {
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.capacity-info {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-2);
}

.capacity-bar-track {
  height: 8px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.capacity-bar-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width 400ms ease;
}

.capacity-bar-fill.full {
  background: var(--color-danger);
}

.capacity-percent {
  display: block;
  margin-top: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.event-details-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-4);
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .event-details {
    padding: var(--space-4);
  }

  .event-title {
    font-size: var(--font-size-xl);
  }

  .event-details-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
