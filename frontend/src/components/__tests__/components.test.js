import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import AppModal from '../common/AppModal.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import ErrorMessage from '../common/ErrorMessage.vue'
import EventCard from '../events/EventCard.vue'
import ParticipantForm from '../participants/ParticipantForm.vue'

/**
 * Tests des composants reutilisables partages (primitives common/ et
 * EventCard). Les formulaires (EventForm, ParticipantForm) sont
 * testes separement, montes avec un routeur reel car ils utilisent
 * RouterLink/useRoute.
 */

describe('AppModal', () => {
  it('ne rend rien quand open=false', () => {
    mount(AppModal, { props: { open: false, title: 'Test' }, attachTo: document.body })
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('rend le dialogue et son titre quand open=true', async () => {
    const wrapper = mount(AppModal, { props: { open: true, title: 'Confirmer' }, attachTo: document.body })
    // Reka UI (DialogPortal/Presence) monte le contenu de facon asynchrone.
    await new Promise((resolve) => setTimeout(resolve, 0))
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog.textContent).toContain('Confirmer')
    wrapper.unmount()
  })

  it('emet close au clic sur le bouton de fermeture', async () => {
    const wrapper = mount(AppModal, { props: { open: true, title: 'T' }, attachTo: document.body })
    await new Promise((resolve) => setTimeout(resolve, 0))
    const closeButton = document.querySelector('[aria-label="Fermer la fenetre"]')
    await closeButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })
})

describe('LoadingSpinner', () => {
  it('affiche un statut accessible', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.text().toLowerCase()).toContain('chargement')
  })
})

describe('ErrorMessage', () => {
  it('affiche le message d\'erreur avec le role alert', () => {
    const wrapper = mount(ErrorMessage, { props: { message: 'Erreur reseau' } })
    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.text()).toContain('Erreur reseau')
  })
})

describe('EventCard', () => {
  const event = {
    id: 1,
    title: 'Conference IA',
    date: '2026-09-15T10:00:00.000Z',
    location: 'Dakar',
    description: 'Panel sur l\'intelligence artificielle en Afrique.'
  }

  it('affiche les informations reelles de l evenement (title/date/location)', () => {
    const wrapper = mount(EventCard, {
      props: { event },
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    const text = wrapper.text()
    expect(text).toContain('Dakar')
    expect(text).toContain('2026')
  })

  it('lie le titre vers la page de details', () => {
    const wrapper = mount(EventCard, {
      props: { event },
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.props('to')).toBe('/events/1')
  })

  it('n affiche pas de badge de capacite (non fourni par la liste GET /events)', () => {
    const wrapper = mount(EventCard, {
      props: { event },
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    expect(wrapper.text()).not.toContain('Complet')
  })
})

describe('ParticipantForm', () => {
  it('emet name/email/phone/type au format exact du backend', async () => {
    const wrapper = mount(ParticipantForm, { props: { initial: {} } })
    await wrapper.find('#participant-name').setValue('Awa Diallo')
    await wrapper.find('#participant-email').setValue('awa@dit.sn')
    await wrapper.find('#participant-phone').setValue('+221770000000')
    await wrapper.find('#participant-type').setValue('professeur')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      name: 'Awa Diallo',
      email: 'awa@dit.sn',
      phone: '+221770000000',
      type: 'professeur'
    })
  })

  it('preremplit les champs depuis la prop initial', () => {
    const wrapper = mount(ParticipantForm, {
      props: { initial: { name: 'Moussa Ba', email: 'moussa@dit.sn', type: 'externe' } }
    })
    expect(wrapper.find('#participant-name').element.value).toBe('Moussa Ba')
    expect(wrapper.find('#participant-email').element.value).toBe('moussa@dit.sn')
    expect(wrapper.find('#participant-type').element.value).toBe('externe')
  })

  it('type par defaut est etudiant', () => {
    const wrapper = mount(ParticipantForm, { props: { initial: {} } })
    expect(wrapper.find('#participant-type').element.value).toBe('etudiant')
  })
})
