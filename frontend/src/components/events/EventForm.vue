<script setup>
import { reactive, watch } from 'vue'

/**
 * Formulaire de création / édition d'événement.
 *
 * Props :
 * - initial : objet événement pré-rempli (optionnel, pour l'édition)
 *
 * Événements :
 * - submit : émis avec l'objet complet de l'événement
 */
const props = defineProps({
  initial: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  title: props.initial.title ?? '',
  date: props.initial.date ?? '',
  time: props.initial.time ?? '',
  location: props.initial.location ?? '',
  category: props.initial.category ?? 'Technologie',
  description: props.initial.description ?? '',
  maxParticipants: props.initial.maxParticipants ?? 100
})

/**
 * Préremplit le formulaire dès que les données initiales arrivent
 * (elles peuvent être résolues de manière asynchrone par la vue).
 */
watch(
  () => props.initial,
  (next) => {
    if (!next || Object.keys(next).length === 0) return
    form.title = next.title ?? ''
    form.date = next.date ?? ''
    form.time = next.time ?? ''
    form.location = next.location ?? ''
    form.category = next.category ?? 'Technologie'
    form.description = next.description ?? ''
    form.maxParticipants = next.maxParticipants ?? 100
  },
  { deep: true, immediate: true }
)

const categories = ['Technologie', 'Design', 'Hackathon', 'Networking', 'Conférence', 'Atelier']

/**
 * Convertit les champs du formulaire (format interne) vers le
 * format exact attendu par le backend pour POST/PUT /api/events :
 * { name, eventDate, venue, maxCapacity }.
 *
 * La date est normalisée au format ISO (AAAA-MM-JJ), format
 * attendu par le backend.
 */
function toBackendPayload() {
  return {
    name: form.title.trim(),
    eventDate: toIsoDate(form.date),
    venue: form.location.trim(),
    maxCapacity: Number(form.maxParticipants) || 0,
    // Champs internes (conservés localement pour l'affichage,
    // ne sont pas envoyés au backend) :
    time: form.time,
    category: form.category,
    description: form.description
  }
}

/**
 * Normalise une date (champ input date ISO ou texte libre)
 * vers le format ISO AAAA-MM-JJ.
 */
function toIsoDate(value) {
  if (!value) return ''
  // Déjà au format ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value.trim()
  // Tentative de conversion depuis une Date valide
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }
  return value.trim()
}

function handleSubmit() {
  if (Number(form.maxParticipants) < 1) {
    form.maxParticipants = 1
  }
  // L'événement submit émet le payload backend complet
  // (name, eventDate, venue, maxCapacity) + les champs
  // internes pour l'affichage local.
  emit('submit', toBackendPayload())
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <form
    class="event-form card"
    @submit.prevent="handleSubmit"
  >
    <div class="event-form-grid">
      <div class="form-group">
        <label for="event-title">Titre *</label>
        <input
          id="event-title"
          v-model="form.title"
          type="text"
          class="form-control"
          required
          placeholder="Ex : Conférence Tech Paris"
        >
      </div>

      <div class="form-group">
        <label for="event-category">Catégorie</label>
        <select
          id="event-category"
          v-model="form.category"
          class="form-control"
        >
          <option
            v-for="cat in categories"
            :key="cat"
            :value="cat"
          >
            {{ cat }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="event-date">Date *</label>
        <input
          id="event-date"
          v-model="form.date"
          type="date"
          class="form-control"
          required
        >
      </div>

      <div class="form-group">
        <label for="event-time">Horaire</label>
        <input
          id="event-time"
          v-model="form.time"
          type="text"
          class="form-control"
          placeholder="Ex : 09h00 – 18h00"
        >
      </div>

      <div class="form-group">
        <label for="event-location">Lieu *</label>
        <input
          id="event-location"
          v-model="form.location"
          type="text"
          class="form-control"
          required
          placeholder="Ex : Paris, France"
        >
      </div>

      <div class="form-group">
        <label for="event-max">Nombre maximum de participants</label>
        <input
          id="event-max"
          v-model.number="form.maxParticipants"
          type="number"
          min="1"
          class="form-control"
        >
      </div>
    </div>

    <div class="form-group">
      <label for="event-description">Description</label>
      <textarea
        id="event-description"
        v-model="form.description"
        class="form-control"
        rows="4"
        placeholder="Décrivez votre événement..."
      />
    </div>

    <div class="event-form-actions">
      <button
        type="button"
        class="btn btn-ghost"
        @click="handleCancel"
      >
        Annuler
      </button>
      <button
        type="submit"
        class="btn btn-primary"
      >
        Enregistrer l'événement
      </button>
    </div>
  </form>
</template>

<style scoped>
.event-form {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.event-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 640px) {
  .event-form-grid {
    grid-template-columns: 1fr;
  }
}

.event-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
</style>
