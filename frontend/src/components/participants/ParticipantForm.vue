<script setup>
import { reactive, watch } from 'vue'
import AppButton from '../common/AppButton.vue'

/**
 * Formulaire de creation / edition d'un profil participant.
 *
 * Champs reels (participants-service) : name, email, phone?, type
 * (etudiant | professeur | externe).
 *
 * Props :
 * - initial : profil pre-rempli (optionnel)
 * - loading : desactive le bouton pendant l'appel API
 * - submitLabel : libelle du bouton de soumission
 *
 * Evenements :
 * - submit : emis avec { name, email, phone, type }
 */
const props = defineProps({
  initial: {
    type: Object,
    default: () => ({})
  },
  loading: Boolean,
  submitLabel: {
    type: String,
    default: 'Creer mon profil'
  }
})

const emit = defineEmits(['submit'])

const form = reactive({
  name: props.initial.name ?? '',
  email: props.initial.email ?? '',
  phone: props.initial.phone ?? '',
  type: props.initial.type ?? 'etudiant'
})

watch(
  () => props.initial,
  (next) => {
    if (!next) return
    if (!form.name && next.name) form.name = next.name
    if (!form.email && next.email) form.email = next.email
    if (!form.phone && next.phone) form.phone = next.phone
    if (next.type) form.type = next.type
  }
)

function handleSubmit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-1.5">
      <label for="participant-name" class="text-sm font-semibold text-slate-700">Nom complet *</label>
      <input
        id="participant-name"
        v-model="form.name"
        type="text"
        required
        minlength="2"
        maxlength="150"
        placeholder="Awa Diallo"
        class="rounded-md border border-slate-300 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="participant-email" class="text-sm font-semibold text-slate-700">Adresse e-mail *</label>
      <input
        id="participant-email"
        v-model="form.email"
        type="email"
        required
        placeholder="vous@exemple.com"
        class="rounded-md border border-slate-300 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="participant-phone" class="text-sm font-semibold text-slate-700">Telephone</label>
      <input
        id="participant-phone"
        v-model="form.phone"
        type="tel"
        placeholder="+221 77 000 00 00"
        class="rounded-md border border-slate-300 px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="participant-type" class="text-sm font-semibold text-slate-700">Statut *</label>
      <select
        id="participant-type"
        v-model="form.type"
        required
        class="rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        <option value="etudiant">Etudiant</option>
        <option value="professeur">Professeur</option>
        <option value="externe">Externe</option>
      </select>
    </div>

    <AppButton type="submit" class="self-start" :loading="loading">
      {{ submitLabel }}
    </AppButton>
  </form>
</template>
