<script setup>
/**
 * Modale reutilisable, construite sur Reka UI (DialogRoot) :
 * gestion du focus, fermeture Echap/overlay et attributs ARIA sont
 * geres par le primitive, pas reimplementes a la main (AGENTS.md
 * section 6).
 *
 * Utilisation :
 *   <AppModal :open="showModal" title="Confirmer" @close="showModal = false">
 *     <p>Contenu...</p>
 *     <template #footer><AppButton>OK</AppButton></template>
 *   </AppModal>
 */
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle } from 'reka-ui'
import { X } from 'lucide-vue-next'

defineProps({
  open: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])
</script>

<template>
  <DialogRoot :open="open" @update:open="(value) => !value && emit('close')">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-slate-900/55 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out"
      />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-4rem)] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-white shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out"
      >
        <header class="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <DialogTitle v-if="title" class="text-lg font-semibold text-slate-900">
            {{ title }}
          </DialogTitle>
          <span v-else />
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100"
            aria-label="Fermer la fenetre"
            @click="emit('close')"
          >
            <X class="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div class="overflow-y-auto px-6 py-5">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
