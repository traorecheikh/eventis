# Contrat d'API : registrations-service

**Statut : figé le 06/08/2026.**

C'est le service le plus complexe : il est le seul à appeler deux autres services
avant d'écrire en base.

| Propriété | Valeur |
|---|---|
| Port interne | `3003` |
| Préfixe via la passerelle | `/api/registrations` |
| Base de données | `registrations-db` (PostgreSQL 16, base `registrations`) |
| Documentation live | `/api/registrations/docs` |
| Propriétaire | BAH Thierno Madjou |

---

## Modèle de données

Table `registrations`.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `SERIAL` | clé primaire |
| `event_id` | `INTEGER` | non nul (pas de clé étrangère, base séparée) |
| `participant_id` | `INTEGER` | non nul (pas de clé étrangère, base séparée) |
| `status` | `VARCHAR(20)` | non nul, parmi `confirmee`, `annulee` |
| `registered_at` | `TIMESTAMPTZ` | défaut `NOW()` |
| `cancelled_at` | `TIMESTAMPTZ` | nullable |

Contrainte unique partielle, essentielle :

```sql
CREATE UNIQUE INDEX idx_registrations_unique_active
  ON registrations (event_id, participant_id)
  WHERE status = 'confirmee';
```

Elle empêche un même participant d'être inscrit deux fois au même événement, tout
en autorisant une réinscription après annulation. C'est la garantie de dernier
recours : même si deux requêtes concurrentes passent la vérification applicative,
la base en rejette une.

Index : `idx_registrations_event` sur `event_id`, `idx_registrations_participant`
sur `participant_id`.

### Représentation JSON

```json
{
  "id": 501,
  "eventId": 1,
  "participantId": 12,
  "status": "confirmee",
  "registeredAt": "2026-08-07T11:30:00.000Z",
  "cancelledAt": null
}
```

---

## Points d'entrée

### `POST /registrations`

Inscrit un participant à un événement. Point d'entrée central du projet.

```json
{ "eventId": 1, "participantId": 12 }
```

**Séquence obligatoire, dans cet ordre :**

1. Valider le corps de la requête. Erreur `400` si invalide.
2. `GET participants-service/participants/:participantId`.
   Si `404`, renvoyer `404` avec `error: "PARTICIPANT_NOT_FOUND"`.
3. `GET events-service/events/:eventId/availability`.
   Si `404`, renvoyer `404` avec `error: "EVENT_NOT_FOUND"`.
   Si `isFull` vaut `true`, renvoyer `409` avec `error: "EVENT_FULL"`.
4. Vérifier qu'il n'existe pas déjà une inscription `confirmee` pour ce couple.
   Si oui, renvoyer `409` avec `error: "ALREADY_REGISTERED"`.
5. Insérer la ligne. Si la contrainte unique se déclenche malgré tout (concurrence),
   attraper l'erreur PostgreSQL `23505` et renvoyer `409 ALREADY_REGISTERED`.

Si l'étape 2 ou 3 échoue pour cause d'indisponibilité réseau, renvoyer `503` avec
`error: "SERVICE_UNAVAILABLE"`. Ne jamais inscrire "au cas où".

| Code | Cas |
|---|---|
| `201` | Inscription créée. |
| `400` | Corps invalide. |
| `404` | Événement ou participant introuvable. |
| `409` | Événement complet, ou déjà inscrit. |
| `503` | Un service amont est injoignable. |

Authentification requise.

---

### `DELETE /registrations/:id`

Annule une inscription. **Annulation logique, pas suppression physique.** La ligne
passe en `status = 'annulee'` et `cancelled_at` est renseigné. On conserve
l'historique pour les statistiques.

| Code | Cas |
|---|---|
| `200` | Annulée. Renvoie l'inscription mise à jour. |
| `404` | Introuvable. |
| `409` | Déjà annulée. |

Authentification requise.

---

### `GET /registrations/event/:eventId`

Liste les inscriptions d'un événement.

| Paramètre | Effet |
|---|---|
| `status` | Filtre `confirmee` ou `annulee`. Défaut : `confirmee`. |
| `page`, `limit` | Pagination |

Réponse `200` : enveloppe `{ data, pagination }`.

Option `?enrich=true` : le service enrichit chaque ligne avec le nom et l'email du
participant en appelant `participants-service`. Utile pour l'écran de liste des
inscrits du frontend. Si l'enrichissement échoue, les champs enrichis valent `null`
et la réponse reste `200` : une liste partielle vaut mieux qu'une erreur.

```json
{
  "id": 501,
  "eventId": 1,
  "participantId": 12,
  "status": "confirmee",
  "registeredAt": "2026-08-07T11:30:00.000Z",
  "participant": { "name": "Awa Diallo", "email": "awa.diallo@dit.sn" }
}
```

Authentification requise.

---

### `GET /registrations/participant/:participantId`

Liste les événements auxquels un participant est inscrit. Mêmes paramètres.

Option `?enrich=true` : enrichit avec le titre, la date et le lieu de l'événement
via `events-service`.

Authentification requise.

---

### `GET /registrations/stats/event/:eventId`

**Appelé par events-service** pour calculer la disponibilité. Doit être rapide.

```json
{ "eventId": 1, "confirmedCount": 87, "cancelledCount": 4, "totalCount": 91 }
```

Une seule requête SQL agrégée, pas de boucle applicative.

| Code | Cas |
|---|---|
| `200` | Toujours, même si l'événement n'a aucune inscription (compteurs à zéro). |

Accès interne. Pas de jeton requis : l'appel vient du réseau Docker privé.

---

### `GET /registrations/stats`

Statistiques globales pour le tableau de bord, exigées par le sujet.

```json
{
  "totalRegistrations": 340,
  "totalConfirmed": 312,
  "totalCancelled": 28,
  "byEvent": [
    { "eventId": 1, "confirmedCount": 87 },
    { "eventId": 2, "confirmedCount": 45 }
  ]
}
```

Authentification requise.

---

### `GET /health`

```json
{ "status": "ok", "service": "registrations-service", "database": "connected" }
```

La sonde de santé ne vérifie **pas** la joignabilité des autres services. Un service
dont les dépendances sont temporairement absentes reste `healthy` : sinon un
redémarrage d'events-service ferait cascader tout le compose en `unhealthy`.

---

## Politique d'appel inter-services

- Timeout de 3 secondes sur chaque appel sortant.
- Une seule tentative de réessai, sur les erreurs réseau uniquement, jamais sur un
  `4xx`.
- Chaque appel sortant est journalisé avec l'URL cible, le code de retour et la durée.
- Les URL des services viennent des variables d'environnement, jamais en dur.

---

## Variables d'environnement

| Clé | Exemple |
|---|---|
| `PORT` | `3003` |
| `DATABASE_URL` | `postgres://registrations_user:pass@registrations-db:5432/registrations` |
| `JWT_SECRET` | secret partagé |
| `EVENTS_SERVICE_URL` | `http://events-service:3001` |
| `PARTICIPANTS_SERVICE_URL` | `http://participants-service:3002` |
| `HTTP_TIMEOUT_MS` | `3000` |
| `NODE_ENV` | `production` |
