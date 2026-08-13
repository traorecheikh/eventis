<script setup>
import { computed, reactive } from 'vue'
import { CalendarPlus } from 'lucide-vue-next'
import AppButton from '../common/AppButton.vue'

/**
 * Formulaire de creation d'evenement (POST /api/events uniquement).
 *
 * Le backend n'expose pas encore PUT /events/:id ni DELETE
 * /events/:id (voir AGENTS.md, section 11) : ce formulaire ne gere
 * donc que la creation, jamais l'edition.
 *
 * Evenements :
 * - submit : emis avec { title, description, date, location, maxCapacity }
 *   exactement dans le format attendu par POST /api/events.
 * - cancel : emis quand l'utilisateur annule.
 */
const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  title: '',
  description: '',
  date: '',
  location: '',
  maxCapacity: 50
})

const errors = reactive({
  title: '',
  date: '',
  location: '',
  maxCapacity: ''
})

/**
 * Valeur minimale du champ date (maintenant), au format attendu par
 * un input datetime-local, pour empecher le choix d'une date passee
 * directement dans le selecteur natif.
 */
const minDateTime = computed(() => {
  const now = new Date(Date.now() + 60000)
  now.setSeconds(0, 0)
  return now.toISOString().slice(0, 16)
})

function validate() {
  errors.title = ''
  errors.date = ''
  errors.location = ''
  errors.maxCapacity = ''

  const title = form.title.trim()
  if (title.length < 3 || title.length > 200) {
    errors.title = 'Le titre doit contenir entre 3 et 200 caracteres.'
  }

  if (!form.date) {
    errors.date = 'La date est obligatoire.'
  } else {
    const parsed = new Date(form.date)
    if (Number.isNaN(parsed.getTime())) {
      errors.date = 'La date est invalide.'
    } else if (parsed.getTime() <= Date.now()) {
      errors.date = 'La date doit etre dans le futur.'
    }
  }

  if (!form.location.trim()) {
    errors.location = 'Le lieu est obligatoire.'
  }

  const capacity = Number(form.maxCapacity)
  if (!Number.isInteger(capacity) || capacity < 1) {
    errors.maxCapacity = 'La capacite doit etre un entier positif.'
  }

  return !errors.title && !errors.date && !errors.location && !errors.maxCapacity
}

function handleSubmit() {
  if (!validate()) return

  emit('submit', {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    date: new Date(form.date).toISOString(),
    location: form.location.trim(),
    maxCapacity: Number(form.maxCapacity)
  })
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <form
    class="flex flex-col gap-4"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <div class="flex flex-col gap-1.5">
      <label for="event-title" class="text-sm font-semibold text-slate-700">Titre *</label>
      <input
        id="event-title"
        v-model="form.title"
        type="text"
        required
        minlength="3"
        maxlength="200"
        placeholder="Ex : Conference IA du DIT"
        class="rounded-md border border-slate-300 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        :aria-invalid="Boolean(errors.title)"
        aria-describedby="event-title-error"
      >
      <p v-if="errors.title" id="event-title-error" class="text-sm text-red-600">
        {{ errors.title }}
      </p>
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="event-description" class="text-sm font-semibold text-slate-700">Description</label>
      <textarea
        id="event-description"
        v-model="form.description"
        rows="4"
        placeholder="Decrivez le contenu de l'evenement..."
        class="rounded-md border border-slate-300 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-1.5">
        <label for="event-date" class="text-sm font-semibold text-slate-700">Date et heure *</label>
        <input
          id="event-date"
          v-model="form.date"
          type="datetime-local"
          required
          :min="minDateTime"
          class="rounded-md border border-slate-300 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          :aria-invalid="Boolean(errors.date)"
          aria-describedby="event-date-error"
        >
        <p v-if="errors.date" id="event-date-error" class="text-sm text-red-600">
          {{ errors.date }}
        </p>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="event-capacity" class="text-sm font-semibold text-slate-700">Capacite maximale *</label>
        <input
          id="event-capacity"
          v-model.number="form.maxCapacity"
          type="number"
          min="1"
          step="1"
          required
          class="rounded-md border border-slate-300 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          :aria-invalid="Boolean(errors.maxCapacity)"
          aria-describedby="event-capacity-error"
        >
        <p v-if="errors.maxCapacity" id="event-capacity-error" class="text-sm text-red-600">
          {{ errors.maxCapacity }}
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="event-location" class="text-sm font-semibold text-slate-700">Lieu *</label>
      <input
        id="event-location"
        v-model="form.location"
        type="text"
        required
        placeholder="Ex : Amphi B, DIT, Dakar"
        class="rounded-md border border-slate-300 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        :aria-invalid="Boolean(errors.location)"
        aria-describedby="event-location-error"
      >
      <p v-if="errors.location" id="event-location-error" class="text-sm text-red-600">
        {{ errors.location }}
      </p>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <AppButton type="button" variant="ghost" @click="handleCancel">
        Annuler
      </AppButton>
      <AppButton type="submit" variant="primary">
        <CalendarPlus class="h-4 w-4" aria-hidden="true" />
        Creer l'evenement
      </AppButton>
    </div>
  </form>
</template>
