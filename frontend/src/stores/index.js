/**
 * Point d'entrée central des stores Pinia.
 *
 * Ce fichier exporte tous les stores de l'application afin de
 * faciliter leur import depuis les composants :
 *
 *   import { useEventStore, useRegistrationStore } from '@/stores'
 *
 * Architecture globale :
 *
 *   View → Component → Pinia Store → Service API → Axios → Backend
 *
 * Les appels API réels seront injectés dans les actions des stores
 * à la phase 5 (services/API).
 */

export { useAuthStore } from './authStore'
export { useEventStore } from './eventStore'
export { useParticipantStore } from './participantStore'
export { useRegistrationStore } from './registrationStore'
