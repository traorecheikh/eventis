<script setup>
import { computed, onMounted } from 'vue'
import EventCard from '../components/events/EventCard.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import { useEventStore } from '../stores'

/**
 * Page d'accueil publique de l'application.
 *
 * Les événements présentés proviennent de l'API
 * (GET /api/events) via le eventStore. Si le backend est
 * indisponible, le store replie automatiquement sur les
 * données mockées locales.
 */
const eventStore = useEventStore()

onMounted(() => {
  eventStore.fetchEvents()
})

/**
 * Trois événements à la une : ceux qui disposent encore de
 * places, triés par capacité (priorité aux grands événements).
 */
const featuredEvents = computed(() =>
  eventStore.events
    .filter((event) => event.remainingSeats > 0)
    .sort((a, b) => (b.maxParticipants ?? 0) - (a.maxParticipants ?? 0))
    .slice(0, 3)
)
</script>

<template>
  <div class="home">
    <section class="hero">
      <h1>EventHub</h1>
      <p class="subtitle">
        Gestion d'événements simplifiée
      </p>
      <p class="description">
        Créez, gérez et participez à des événements en quelques clics.
        Inscrivez des participants, suivez les inscriptions et consultez
        vos statistiques depuis un tableau de bord centralisé.
      </p>
      <div class="actions">
        <RouterLink
          to="/events"
          class="btn btn-primary btn-lg"
        >
          Découvrir les événements
        </RouterLink>
        <RouterLink
          to="/register"
          class="btn btn-secondary btn-lg"
        >
          Créer un compte
        </RouterLink>
      </div>
    </section>

    <section class="featured">
      <h2>Événements à la une</h2>

      <LoadingSpinner v-if="eventStore.loading" />

      <div
        v-else-if="featuredEvents.length > 0"
        class="events-grid"
      >
        <EventCard
          v-for="event in featuredEvents"
          :key="event.id"
          :event="event"
        />
      </div>

      <div
        v-else
        class="events-grid-empty card"
      >
        <p>Aucun événement disponible pour le moment.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: var(--space-8) 0 var(--space-12);
}

h1 {
  font-size: var(--font-size-4xl);
  color: var(--color-ink);
  margin-bottom: var(--space-2);
}

.subtitle {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.description {
  max-width: 640px;
  margin: 0 auto var(--space-6);
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.actions {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.featured {
  padding-top: var(--space-8);
  border-top: 1px solid var(--color-border);
}

.featured h2 {
  font-size: var(--font-size-2xl);
  color: var(--color-ink);
  margin-bottom: var(--space-1);
}

.note {
  font-size: var(--font-size-sm);
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: var(--space-5);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-5);
}

.events-grid-empty {
  padding: var(--space-8) var(--space-6);
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}

@media (max-width: 480px) {
  .hero {
    padding-top: var(--space-4);
  }

  h1 {
    font-size: var(--font-size-3xl);
  }
}
</style>
