<script setup>
import { computed } from 'vue'
import { Mail, Phone } from 'lucide-vue-next'

/**
 * Carte de participant.
 *
 * Props :
 * - participant : { id, name, email, phone?, type }
 * - showActions : affiche le bouton "Voir le profil"
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

const typeLabels = { etudiant: 'Etudiant', professeur: 'Professeur', externe: 'Externe' }

const initials = computed(() =>
  (props.participant.name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
)
</script>

<template>
  <article class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex items-center gap-4">
      <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white" aria-hidden="true">
        {{ initials }}
      </div>
      <div>
        <h3 class="flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-900">
          {{ participant.name }}
          <span class="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {{ typeLabels[participant.type] || participant.type }}
          </span>
        </h3>
      </div>
    </div>

    <ul class="flex flex-col gap-1.5 text-sm text-slate-600">
      <li class="flex items-center gap-2">
        <Mail class="h-4 w-4 text-brand-600" aria-hidden="true" /> {{ participant.email }}
      </li>
      <li v-if="participant.phone" class="flex items-center gap-2">
        <Phone class="h-4 w-4 text-brand-600" aria-hidden="true" /> {{ participant.phone }}
      </li>
    </ul>

    <footer v-if="showActions" class="border-t border-slate-100 pt-3">
      <RouterLink :to="`/participants/${participant.id}`" class="text-sm font-medium text-brand-600 hover:text-brand-700">
        Voir le profil
      </RouterLink>
    </footer>
  </article>
</template>
