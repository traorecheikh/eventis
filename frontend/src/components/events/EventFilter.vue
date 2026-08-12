<script setup>
import { reactive, watch } from 'vue'

/**
 * Barre de filtres pour la liste d'événements.
 *
 * Props :
 * - categories : liste des catégories disponibles (issues du store)
 * - currentFilters : { search, category, onlyFull } synchronisé
 *   avec l'état de la vue
 *
 * Événements :
 * - filter : émis à chaque modification avec
 *   { search, category, onlyFull }
 */
defineProps({
  categories: {
    type: Array,
    default: () => ['Technologie', 'Design', 'Hackathon', 'Networking', 'Conférence', 'Atelier']
  },
  currentFilters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['filter'])

const filters = reactive({
  search: '',
  category: '',
  onlyFull: false
})

watch(filters, () => emit('filter', { ...filters }), { deep: true })
</script>

<template>
  <div
    class="event-filter card"
    role="search"
    aria-label="Filtrer les événements"
  >
    <div class="event-filter-grid">
      <label
        class="sr-only"
        for="filter-search"
      >Rechercher un événement</label>
      <input
        id="filter-search"
        v-model="filters.search"
        type="search"
        class="form-control"
        placeholder="🔍 Rechercher un événement..."
      >

      <label
        class="sr-only"
        for="filter-category"
      >Catégorie</label>
      <select
        id="filter-category"
        v-model="filters.category"
        class="form-control"
      >
        <option value="">
          Toutes les catégories
        </option>
        <option
          v-for="cat in categories"
          :key="cat"
          :value="cat"
        >
          {{ cat }}
        </option>
      </select>

      <label class="checkbox-label">
        <input
          v-model="filters.showFullOnly"
          type="checkbox"
        >
        <span>Afficher uniquement les événements complets</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.event-filter {
  padding: var(--space-4);
}

.event-filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: var(--space-3);
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .event-filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
