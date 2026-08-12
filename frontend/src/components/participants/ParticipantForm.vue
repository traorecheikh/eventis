<script setup>
import { reactive } from 'vue'

/**
 * Formulaire de création / édition d'un participant.
 *
 * Props :
 * - initial : objet participant pré-rempli (optionnel)
 *
 * Événements :
 * - submit : émis avec l'objet participant complet
 */
const props = defineProps({
  initial: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit'])

const initial = props.initial

const form = reactive({
  firstName: initial.firstName ?? '',
  lastName: initial.lastName ?? '',
  email: initial.email ?? '',
  phone: initial.phone ?? '',
  bio: initial.bio ?? ''
})

function handleSubmit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form
    class="participant-form card"
    @submit.prevent="handleSubmit"
  >
    <div class="participant-form-grid">
      <div class="form-group">
        <label for="participant-firstname">Prénom *</label>
        <input
          id="participant-firstname"
          v-model="form.firstName"
          type="text"
          class="form-control"
          required
          placeholder="Marie"
        >
      </div>

      <div class="form-group">
        <label for="participant-lastname">Nom *</label>
        <input
          id="participant-lastname"
          v-model="form.lastName"
          type="text"
          class="form-control"
          required
          placeholder="Dupont"
        >
      </div>

      <div class="form-group">
        <label for="participant-email">Adresse e-mail *</label>
        <input
          id="participant-email"
          v-model="form.email"
          type="email"
          class="form-control"
          required
          placeholder="vous@exemple.com"
        >
      </div>

      <div class="form-group">
        <label for="participant-phone">Téléphone</label>
        <input
          id="participant-phone"
          v-model="form.phone"
          type="tel"
          class="form-control"
          placeholder="06 12 34 56 78"
        >
      </div>
    </div>

    <div class="form-group">
      <label for="participant-bio">Biographie</label>
      <textarea
        id="participant-bio"
        v-model="form.bio"
        class="form-control"
        rows="3"
        placeholder="Quelques mots sur vous..."
      />
    </div>

    <div class="participant-form-actions">
      <button
        type="submit"
        class="btn btn-primary"
      >
        Enregistrer le participant
      </button>
    </div>
  </form>
</template>

<style scoped>
.participant-form {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.participant-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.participant-form-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .participant-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
