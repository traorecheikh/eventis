/**
 * Convertit les données du formulaire d'inscription en payload
 * attendu par le registrations-service.
 *
 * Ce mapeur centralise la conversion afin que les composants
 * manipulent des champs lisibles (fullName, email, ...) pendant
 * que seuls les champs exacts du backend sont envoyés.
 *
 * Champs supposés côté backend (à confirmer par Swagger/OpenAPI) :
 *   { eventId, participant: { fullName, email, phone, dietaryRequirements } }
 *
 * @param {Object} data données du formulaire
 * @returns {Object} payload backend
 */
export function mapRegistrationPayload(data) {
  // Le payload entrant peut être au format « plat » (champs au premier
  // niveau : eventId, fullName, email, ...) ou déjà au format imbriqué
  // ({ eventId, participant: { ... } }) construit par la vue.
  const source = data?.participant && Object.keys(data.participant).length
    ? data.participant
    : data
  return {
    eventId: Number(data?.eventId),
    participant: {
      fullName: String(source?.fullName ?? source?.name ?? '').trim(),
      email: String(source?.email ?? '').trim(),
      phone: String(source?.phone ?? '').trim(),
      dietaryRequirements: String(
        source?.dietaryRequirements ?? source?.dietary ?? ''
      ).trim()
    }
  }
}
