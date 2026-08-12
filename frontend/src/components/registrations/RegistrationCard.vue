<script setup>
import { RouterLink } from 'vue-router'
import { registrationStatusMeta } from '../../assets/images/mockData.js'

/**
 * Carte d'inscription d'un participant à un événement.
 *
 * Props :
 * - registration : objet inscription (id, eventTitle, eventDate,
 *                  status, registeredAt, dietaryRequirements)
 */
const props = defineProps({
  registration: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['cancel'])

const statusMeta = registrationStatusMeta(props.registration.status)

/**
 * Annulation d'une inscription (Confirmée ou En attente uniquement).
 *
 * La logique d'annulation reste dans le store parent ; le composant
 * émet simplement l'événement cancel (architecture Component → Store).
 */
function handleCancel() {
  if (props.registration.status === 'Annulée') {
    return
  }
  emit('cancel', props.registration.id)
}
</script>

<template>
  <article class="registration-card card card-hover">
    <div class="registration-card-body">
      <div>
        <h3 class="registration-event">
          <RouterLink :to="`/events/${registration.eventId}`">
            {{ registration.eventTitle }}
          </RouterLink>
        </h3>
        <p class="registration-date">
          📅 {{ registration.eventDate }}
        </p>
        <p class="registration-meta">
          Inscrit le {{ registration.registeredAt }}
        </p>
        <p
          v-if="registration.dietaryRequirements"
          class="registration-meta"
        >
          🍽️ Régime : {{ registration.dietaryRequirements }}
        </p>
      </div>
      <span
        class="badge"
        :class="statusMeta.cssClass"
      >{{ statusMeta.label }}</span>
    </div>

    <footer class="registration-card-actions">
      <RouterLink
        :to="`/events/${registration.eventId}`"
        class="btn btn-ghost btn-sm"
      >
        Voir l'événement
      </RouterLink>
      <RouterLink
        to="/registrations"
        class="btn btn-secondary btn-sm"
      >
        Gérer
      </RouterLink>
      <button
        class="btn btn-ghost btn-sm"
        :class="{ 'btn-danger': registration.status !== 'Annulée' }"
        :disabled="registration.status === 'Annulée'"
        @click="handleCancel"
      >
        {{ registration.status === 'Annulée' ? 'Annulée' : 'Annuler' }}
      </button>
    </footer>
  </article>
</template>

<style scoped>
.registration-card {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.registration-card-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
}

.registration-event a {
  color: var(--color-ink);
  text-decoration: none;
  font-size: var(--font-size-base);
  font-weight: 600;
}

.registration-event a:hover {
  color: var(--color-primary);
}

.registration-date {
  margin-top: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.registration-meta {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.registration-card-actions {
  display: flex;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.btn-danger {
  color: var(--color-danger, #dc2626);
}

.btn-danger:hover {
  background: #fef2f2;
}
</style>
