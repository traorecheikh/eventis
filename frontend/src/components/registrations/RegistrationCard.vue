<script setup>
import { CalendarDays, MapPin } from 'lucide-vue-next'
import { registrationStatusMeta } from '../../utils/registrationStatus.js'
import AppButton from '../common/AppButton.vue'

/**
 * Carte d'inscription d'un participant a un evenement.
 *
 * Props :
 * - registration : { id, eventId, status, registeredAt, event?: {title, date, location} }
 *   (event present quand la liste est chargee avec enrich=true)
 */
const props = defineProps({
  registration: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['cancel'])

const statusMeta = registrationStatusMeta(props.registration.status)

function handleCancel() {
  if (props.registration.status === 'annulee') return
  emit('cancel', props.registration.id)
}
</script>

<template>
  <article class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="font-semibold text-slate-900">
          <RouterLink :to="`/events/${registration.eventId}`" class="hover:text-brand-600">
            {{ registration.event?.title || `Evenement #${registration.eventId}` }}
          </RouterLink>
        </h3>
        <p v-if="registration.event?.date" class="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <CalendarDays class="h-4 w-4" aria-hidden="true" /> {{ registration.event.date }}
        </p>
        <p v-if="registration.event?.location" class="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin class="h-4 w-4" aria-hidden="true" /> {{ registration.event.location }}
        </p>
      </div>
      <span
        class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
        :class="statusMeta.tone === 'success' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'"
      >
        {{ statusMeta.label }}
      </span>
    </div>

    <footer class="flex items-center gap-2 border-t border-slate-100 pt-3">
      <RouterLink :to="`/events/${registration.eventId}`" class="text-sm font-medium text-slate-500 hover:text-brand-600">
        Voir l'evenement
      </RouterLink>
      <AppButton
        variant="ghost"
        size="sm"
        class="ml-auto"
        :disabled="registration.status === 'annulee'"
        @click="handleCancel"
      >
        {{ registration.status === 'annulee' ? 'Annulee' : 'Annuler' }}
      </AppButton>
    </footer>
  </article>
</template>
