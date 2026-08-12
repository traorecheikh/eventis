<script setup>
import { reactive, watch } from 'vue'

/**
 * Formulaire d'inscription à un événement.
 *
 * Props :
 * - eventTitle : titre de l'événement (affichage)
 * - initial : pré-remplissage partiel (optionnel)
 *
 * Événements :
 * - submit : émis avec l'objet d'inscription complet
 */
const props = defineProps({
  eventTitle: {
    type: String,
    default: ''
  },
  initial: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit'])

const initialForm = {
  firstName: props.initial.firstName ?? '',
  lastName: props.initial.lastName ?? '',
  email: props.initial.email ?? '',
  phone: props.initial.phone ?? '',
  dietaryRequirements: props.initial.dietaryRequirements ?? '',
  comments: props.initial.comments ?? ''
}

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dietaryRequirements: '',
  comments: '',
  ...initialForm
})

/**
 * Réapplique le pré-remplissage lorsque le profil de l'utilisateur
 * connecté devient disponible (après hydratation du token JWT).
 * Les champs déjà modifiés par l'utilisateur ne sont pas écrasés.
 */
watch(
  () => props.initial,
  (next) => {
    if (!next) return
    if (!form.firstName && next.firstName) form.firstName = next.firstName
    if (!form.lastName && next.lastName) form.lastName = next.lastName
    if (!form.email && next.email) form.email = next.email
    if (!form.phone && next.phone) form.phone = next.phone
    if (!form.dietaryRequirements && next.dietaryRequirements)
      form.dietaryRequirements = next.dietaryRequirements
    if (!form.comments && next.comments) form.comments = next.comments
  },
  { deep: true }
)

function handleSubmit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form
    class="registration-form card"
    @submit.prevent="handleSubmit"
  >
    <h2 class="registration-form-title">
      S'inscrire à l'événement
      <span
        v-if="eventTitle"
        class="registration-form-event"
      >{{ eventTitle }}</span>
    </h2>

    <div class="registration-form-grid">
      <div class="form-group">
        <label for="reg-firstname">Prénom *</label>
        <input
          id="reg-firstname"
          v-model="form.firstName"
          type="text"
          class="form-control"
          required
          placeholder="Marie"
        >
      </div>

      <div class="form-group">
        <label for="reg-lastname">Nom *</label>
        <input
          id="reg-lastname"
          v-model="form.lastName"
          type="text"
          class="form-control"
          required
          placeholder="Dupont"
        >
      </div>
    </div>

    <div class="form-group">
      <label for="reg-email">Adresse e-mail *</label>
      <input
        id="reg-email"
        v-model="form.email"
        type="email"
        class="form-control"
        required
        placeholder="vous@exemple.com"
      >
    </div>

    <div class="form-group">
      <label for="reg-phone">Téléphone (optionnel)</label>
      <input
        id="reg-phone"
        v-model="form.phone"
        type="tel"
        class="form-control"
        placeholder="06 12 34 56 78"
      >
    </div>

    <div class="form-group">
      <label for="reg-dietary">Régime alimentaire (optionnel)</label>
      <input
        id="reg-dietary"
        v-model="form.dietaryRequirements"
        type="text"
        class="form-control"
        placeholder="Végétarien, allergies..."
      >
    </div>

    <div class="form-group">
      <label for="reg-comments">Commentaire (optionnel)</label>
      <textarea
        id="reg-comments"
        v-model="form.comments"
        class="form-control"
        rows="3"
        placeholder="Message à l'organisateur..."
      />
    </div>

    <div class="registration-form-actions">
      <button
        type="submit"
        class="btn btn-primary btn-lg"
      >
        Confirmer l'inscription
      </button>
    </div>
  </form>
</template>

<style scoped>
.registration-form {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.registration-form-title {
  font-size: var(--font-size-lg);
}

.registration-form-event {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
}

.registration-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.registration-form-actions {
  display: flex;
  justify-content: flex-start;
}

@media (max-width: 640px) {
  .registration-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
