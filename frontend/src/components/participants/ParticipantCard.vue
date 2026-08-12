<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

/**
 * Carte de participant.
 *
 * Props :
 * - participant : objet participant (id, firstName, lastName, email,
 *                 phone, role, bio, eventsParticipated)
 * - showActions : affiche le bouton « Voir le profil »
 */
const props = defineProps({
  participant: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const initials = computed(() => {
  const p = props.participant
  return ((p.firstName?.[0] ?? '') + (p.lastName?.[0] ?? '')).toUpperCase()
})
</script>

<template>
  <article class="participant-card card card-hover">
    <div
      class="participant-avatar"
      :aria-hidden="true"
    >
      {{ initials }}
    </div>

    <div class="participant-body">
      <h3 class="participant-name">
        {{ participant.firstName }} {{ participant.lastName }}
        <span class="badge badge-info">{{ participant.role }}</span>
      </h3>

      <p
        v-if="participant.bio"
        class="participant-bio"
      >
        {{ participant.bio }}
      </p>

      <ul class="participant-contact">
        <li>📧 {{ participant.email }}</li>
        <li v-if="participant.phone">
          📱 {{ participant.phone }}
        </li>
        <li>🎉 {{ participant.eventsParticipated }} événement(s) participé(s)</li>
      </ul>
    </div>

    <footer
      v-if="showActions"
      class="participant-actions"
    >
      <RouterLink
        :to="`/participants/${participant.id}`"
        class="btn btn-secondary btn-sm"
      >
        Voir le profil
      </RouterLink>
    </footer>
  </article>
</template>

<style scoped>
.participant-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
}

.participant-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.participant-name {
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.participant-bio {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.participant-contact {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.participant-actions {
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}
</style>
