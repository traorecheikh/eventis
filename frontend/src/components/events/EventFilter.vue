<script setup>
import { ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'
import { Search, X } from 'lucide-vue-next'

/**
 * Barre de recherche pour la liste d'evenements.
 *
 * L'API GET /api/events ne propose pas de recherche plein texte
 * cote serveur : le filtrage (titre, lieu) s'applique uniquement
 * sur la page d'evenements deja chargee par le eventStore. On
 * l'annonce explicitement pour ne pas laisser croire a une
 * recherche globale.
 *
 * Evenements :
 * - filter : emis (debounce 350ms) avec le texte de recherche.
 */
const emit = defineEmits(['filter'])

const search = ref('')
const debouncedSearch = refDebounced(search, 350)

watch(debouncedSearch, (value) => {
  emit('filter', value.trim())
})

function clearSearch() {
  search.value = ''
}
</script>

<template>
  <div
    class="rounded-xl border border-slate-200 bg-white p-4"
    role="search"
    aria-label="Filtrer les evenements"
  >
    <label for="event-search" class="sr-only">Rechercher un evenement par titre ou lieu</label>
    <div class="relative">
      <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        id="event-search"
        v-model="search"
        type="search"
        placeholder="Rechercher par titre ou lieu..."
        class="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-9 text-base outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
      <button
        v-if="search"
        type="button"
        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
        aria-label="Effacer la recherche"
        @click="clearSearch"
      >
        <X class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
    <p class="mt-2 text-xs text-slate-400">
      La recherche s'applique aux evenements de la page actuellement chargee.
    </p>
  </div>
</template>
