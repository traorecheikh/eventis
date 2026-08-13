/**
 * Libelle et intention visuelle associes a un statut d'inscription.
 *
 * Statuts reels (registrations-service) : "confirmee" ou "annulee",
 * il n'existe pas d'etat intermediaire "en attente".
 */
export function registrationStatusMeta(status) {
  const map = {
    confirmee: { label: 'Confirmee', tone: 'success' },
    annulee: { label: 'Annulee', tone: 'neutral' }
  }
  return map[status] ?? { label: status, tone: 'neutral' }
}
