<script setup>
/**
 * Modale réutilisable accessible.
 *
 * Fonctionnalités :
 * - Fermeture par touche Échap et clic sur l'arrière-plan
 * - Gestion du focus (retour à l'élément déclencheur à la fermeture)
 * - Attributs ARIA requis (role="dialog", aria-modal)
 *
 * Utilisation :
 *   <AppModal :open="showModal" title="Confirmer" @close="showModal = false">
 *     <p>Contenu...</p>
 *     <template #footer><AppButton>OK</AppButton></template>
 *   </AppModal>
 */
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'

const props = defineProps({
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

const modalRef = ref(null)
const previousFocus = ref(null)

function handleClose() {
  emit('close')
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    handleClose()
  }
  // Trap du focus : Tab / Shift+Tab restent dans la modale
  if (event.key === 'Tab' && modalRef.value) {
    const focusables = modalRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      previousFocus.value = document.activeElement
      document.body.style.overflow = 'hidden'
      await nextTick()
      const titleEl = modalRef.value?.querySelector('[data-modal-autofocus]')
      if (titleEl) titleEl.focus()
    } else {
      document.body.style.overflow = ''
      if (previousFocus.value) {
        previousFocus.value.focus?.()
      }
    }
  }
)

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay"
      role="presentation"
      @click="handleClose"
    >
      <div
        ref="modalRef"
        class="modal-dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="title || undefined"
        @click.stop
      >
        <header class="modal-header">
          <h2
            v-if="title"
            data-modal-autofocus
            tabindex="-1"
            class="modal-title"
          >
            {{ title }}
          </h2>
          <button
            class="modal-close"
            type="button"
            aria-label="Fermer la fenêtre"
            @click="handleClose"
          >
            ✕
          </button>
        </header>

        <div class="modal-body">
          <slot />
        </div>

        <footer
          v-if="$slots.footer"
          class="modal-footer"
        >
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 50;
  animation: fadeIn 150ms ease;
}

.modal-dialog {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 520px;
  max-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  animation: slideUp 180ms ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: var(--font-size-lg);
  color: var(--color-ink);
}

.modal-close {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.modal-close:hover {
  background: var(--color-surface-soft);
}

.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .modal-dialog {
    animation: none;
  }
}

@media (max-width: 480px) {
  .modal-dialog {
    max-height: 100vh;
    border-radius: var(--radius-md);
  }
}
</style>
