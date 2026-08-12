import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EventForm from '../events/EventForm.vue'
import RegistrationForm from '../registrations/RegistrationForm.vue'
import AppModal from '../common/AppModal.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import ErrorMessage from '../common/ErrorMessage.vue'
import EventCard from '../events/EventCard.vue'
import { RouterLink } from 'vue-router'

/**
 * Tests des composants réutilisables.
 *
 * Les formulaires sont montés sans store : ils n'émettent que des
 * événements, ce qui permet de vérifier la conversion de payload et
 * la validation sans dépendre de Pinia.
 */

describe('EventForm', () => {
  it('soumet le payload au format exact du backend (name, eventDate, venue, maxCapacity)', async () => {
    const wrapper = mount(EventForm, { props: { initial: {} } })
    await wrapper.find('#event-title').setValue('Conférence IA')
    await wrapper.find('#event-date').setValue('2026-09-15')
    await wrapper.find('#event-location').setValue('Dakar')
    await wrapper.find('#event-max').setValue('100')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toHaveLength(1)
    const payload = wrapper.emitted('submit')[0][0]
    expect(payload.name).toBe('Conférence IA')
    expect(payload.eventDate).toBe('2026-09-15')
    expect(payload.venue).toBe('Dakar')
    expect(payload.maxCapacity).toBe(100)
    // Les champs internes suivent (non envoyés au backend).
    expect(payload.category).toBe('Technologie')
  })

  it('préremplit les champs depuis la prop initial (édition)', async () => {
    const wrapper = mount(EventForm, {
      props: {
        initial: {
          title: 'Atelier UX',
          date: '2026-10-01',
          location: 'Thiès',
          category: 'Design',
          maxParticipants: 50
        }
      }
    })
    expect(wrapper.find('#event-title').element.value).toBe('Atelier UX')
    expect(wrapper.find('#event-date').element.value).toBe('2026-10-01')
    expect(wrapper.find('#event-location').element.value).toBe('Thiès')
    expect(wrapper.find('#event-max').element.value).toBe('50')
  })

  it('émet cancel au clic sur le bouton Annuler', async () => {
    const wrapper = mount(EventForm)
    await wrapper.findAll('button').find((b) => b.text().includes('Annuler')).trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('force la capacité minimum à 1', async () => {
    const wrapper = mount(EventForm, { props: { initial: {} } })
    await wrapper.find('#event-title').setValue('Hackathon')
    await wrapper.find('#event-date').setValue('2026-11-10')
    await wrapper.find('#event-location').setValue('Lyon')
    await wrapper.find('#event-max').setValue('-5')
    await wrapper.find('form').trigger('submit')
    const payload = wrapper.emitted('submit')[0][0]
    expect(payload.maxCapacity).toBe(1)
  })
})

describe('RegistrationForm', () => {
  it('émet le formulaire complet au submit', async () => {
    const wrapper = mount(RegistrationForm, {
      props: { eventTitle: 'Conférence IA' }
    })
    await wrapper.find('#reg-firstname').setValue('Awa')
    await wrapper.find('#reg-lastname').setValue('Diop')
    await wrapper.find('#reg-email').setValue('awa@b.c')
    await wrapper.find('#reg-phone').setValue('+221770000000')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toHaveLength(1)
    const data = wrapper.emitted('submit')[0][0]
    expect(data.firstName).toBe('Awa')
    expect(data.lastName).toBe('Diop')
    expect(data.email).toBe('awa@b.c')
    expect(data.phone).toBe('+221770000000')
  })

  it('affiche le titre de l\'événement', () => {
    const wrapper = mount(RegistrationForm, {
      props: { eventTitle: 'Conférence IA' }
    })
    expect(wrapper.text()).toContain('Conférence IA')
  })

  it('refuse la soumission HTML5 si un champ requis est vide', () => {
    const wrapper = mount(RegistrationForm)
    const form = wrapper.find('form').element
    expect(form.checkValidity()).toBe(false)
  })
})

describe('AppModal', () => {
  it('ne rend rien quand open=false', () => {
    const wrapper = mount(AppModal, { props: { open: false, title: 'Test' } })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  /**
   * AppModal utilise un <Teleport to="body"> : le montage doit
   * s'attacher au document réel pour que le dialogue soit rendu
   * dans le DOM.
   */
  function mountModal(props) {
    const wrapper = mount(AppModal, {
      props,
      attachTo: document.body
    })
    return wrapper
  }

  it('rend le dialogue et son titre quand open=true', () => {
    const wrapper = mountModal({ open: true, title: 'Confirmer' })
    // Le <Teleport to="body"> place le dialogue hors du wrapper local :
    // la recherche se fait directement dans document.body.
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.textContent).toContain('Confirmer')
    wrapper.unmount()
  })

  it('émet close au clic sur l\'arrière-plan', async () => {
    const wrapper = mountModal({ open: true, title: 'T' })
    const overlay = document.querySelector('.modal-overlay')
    await overlay.dispatchEvent(new window.Event('click', { bubbles: true }))
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })
})

describe('LoadingSpinner', () => {
  it('affiche un message de chargement accessible', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('[role="status"]').exists() || wrapper.text().toLowerCase().includes('chargement')).toBe(true)
  })
})

describe('ErrorMessage', () => {
  it('affiche le message d\'erreur avec le rôle alert', () => {
    const wrapper = mount(ErrorMessage, { props: { message: 'Erreur réseau' } })
    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.text()).toContain('Erreur réseau')
  })

  it('cache le texte du message quand le message est vide', () => {
    const wrapper = mount(ErrorMessage, { props: { message: '' } })
    // L'icône ⚠ reste affichée, mais le paragraphe du message est vide.
    expect(wrapper.find('.error-text').text().trim()).toBe('')
    expect(wrapper.attributes('role')).toBe('alert')
  })
})

describe('EventCard', () => {
  const event = {
    id: 1,
    title: 'Conférence IA',
    date: '15 septembre 2026',
    location: 'Dakar',
    category: 'Technologie',
    maxParticipants: 100,
    currentParticipants: 20,
    remainingSeats: 80,
    status: 'published'
  }

  it('affiche les informations clés de l\'événement', () => {
    const wrapper = mount(EventCard, {
      props: { event },
      global: { stubs: { RouterLink: true } }
    })
    // Le stub RouterLink rend ses slots dans la propriété `slots` : le
    // titre de l'événement y est consultable. Les métadonnées sont
    // rendues directement (sans RouterLink).
    const link = wrapper.findComponent({ name: 'RouterLink' })
    expect(link.props('to')).toBe('/events/1')
    const slotText = link.vm?.$slots?.default?.()?.[0]?.children ?? link.html()
    expect(String(slotText)).toContain('Conférence IA')
    const text = wrapper.text()
    expect(text).toContain('Dakar')
    expect(text).toContain('15 septembre 2026')
  })

  it('lie le titre vers la page de détails', () => {
    const wrapper = mount(EventCard, {
      props: { event },
      global: { stubs: { RouterLink: true } }
    })
    const link = wrapper.findComponent(RouterLink)
    expect(link.props('to')).toBe('/events/1')
    // Le stub RouterLink expose le texte du titre dans son slot.
    const slotText =
      link.vm?.$slots?.default?.()?.map((node) => node.children || '').join('') ?? ''
    expect(slotText).toContain('Conférence IA')
  })

  it('affiche le badge « Complet » pour un événement plein', () => {
    const full = { ...event, currentParticipants: 100, remainingSeats: 0 }
    const wrapper = mount(EventCard, {
      props: { event: full },
      global: { stubs: { RouterLink: true } }
    })
    expect(wrapper.text()).toContain('Complet')
  })
})
