# Contrat d'API : events-service

**Statut : figé le 06/08/2026.** Toute modification exige une PR sur ce fichier,
approuvée par le Scrum Master, avant toute modification de code.

| Propriété | Valeur |
|---|---|
| Port interne | `3001` |
| Préfixe via la passerelle | `/api/events` |
| Base de données | `events-db` (PostgreSQL 16, base `events`) |
| Documentation live | `/api/events/docs` (Swagger UI) |
| Propriétaire | Kassem Dehou Modeste |

---

## Modèle de données

Table `events`.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `SERIAL` | clé primaire |
| `title` | `VARCHAR(200)` | non nul |
| `description` | `TEXT` | nullable |
| `date` | `TIMESTAMPTZ` | non nul |
| `location` | `VARCHAR(200)` | non nul |
| `max_capacity` | `INTEGER` | non nul, strictement positif |
| `created_at` | `TIMESTAMPTZ` | défaut `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | défaut `NOW()` |

Index : `idx_events_date` sur `date`, `idx_events_location` sur `location`.
Les deux filtres exigés par le sujet passent par ces index.

### Représentation JSON

```json
{
  "id": 1,
  "title": "Conference IA et Afrique",
  "description": "Panel sur l'adoption de l'IA au Senegal",
  "date": "2026-09-15T14:00:00.000Z",
  "location": "Amphi A, DIT Dakar",
  "maxCapacity": 120,
  "createdAt": "2026-08-07T10:12:00.000Z",
  "updatedAt": "2026-08-07T10:12:00.000Z"
}
```

Convention : la base est en `snake_case`, l'API expose du `camelCase`. La conversion
se fait dans la couche de mapping du service.

---

## Points d'entrée

### `POST /events`

Crée un événement.

Corps attendu :

```json
{
  "title": "Conference IA et Afrique",
  "description": "Panel sur l'adoption de l'IA au Senegal",
  "date": "2026-09-15T14:00:00.000Z",
  "location": "Amphi A, DIT Dakar",
  "maxCapacity": 120
}
```

Validation : `title` entre 3 et 200 caractères, `date` au format ISO 8601 et
strictement dans le futur, `location` non vide, `maxCapacity` entier supérieur à 0.

| Code | Cas |
|---|---|
| `201` | Créé. Renvoie l'événement complet. |
| `400` | Validation échouée. |
| `401` | Jeton JWT absent ou invalide. |

Authentification requise.

---

### `GET /events`

Liste les événements, avec filtres.

| Paramètre | Type | Effet |
|---|---|---|
| `date` | `YYYY-MM-DD` | Événements de ce jour |
| `dateFrom` | `YYYY-MM-DD` | Événements à partir de cette date |
| `dateTo` | `YYYY-MM-DD` | Événements jusqu'à cette date |
| `location` | texte | Correspondance partielle insensible à la casse |
| `page` | entier | Défaut `1` |
| `limit` | entier | Défaut `20`, maximum `100` |

Réponse `200` :

```json
{
  "data": [ { "id": 1, "title": "..." } ],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

Accès public, pas de jeton requis.

---

### `GET /events/:id`

Détail d'un événement.

| Code | Cas |
|---|---|
| `200` | Trouvé. |
| `404` | Aucun événement avec cet identifiant. |

Accès public.

---

### `PUT /events/:id`

Met à jour un événement. Corps identique à `POST /events`, tous les champs optionnels.

Règle métier : `maxCapacity` ne peut pas descendre en dessous du nombre d'inscriptions
déjà confirmées. Le service interroge
`GET registrations-service/registrations/stats/event/:id` avant d'accepter la baisse.
En cas de violation, `409 Conflict`.

| Code | Cas |
|---|---|
| `200` | Mis à jour. |
| `400` | Validation échouée. |
| `401` | Non authentifié. |
| `404` | Introuvable. |
| `409` | Capacité inférieure aux inscriptions existantes. |

---

### `DELETE /events/:id`

Supprime un événement.

| Code | Cas |
|---|---|
| `204` | Supprimé. |
| `401` | Non authentifié. |
| `404` | Introuvable. |

Note : la suppression n'est pas propagée automatiquement vers
`registrations-service`. Les inscriptions orphelines sont nettoyées par ce dernier
lors de son prochain appel de vérification. Ce compromis est assumé et documenté
dans `knowledge-base/adr/0003-postgres-une-base-par-service.md`.

---

### `GET /events/:id/availability`

**Point d'entrée le plus important du système.** C'est celui qu'appelle
`registrations-service` avant chaque inscription.

Réponse `200` :

```json
{
  "eventId": 1,
  "maxCapacity": 120,
  "registeredCount": 87,
  "remainingSeats": 33,
  "isFull": false
}
```

Le service interroge `registrations-service` pour obtenir `registeredCount`. Si
`registrations-service` est indisponible, la réponse est `503` avec
`{ "error": "SERVICE_UNAVAILABLE", "message": "Impossible de verifier les inscriptions" }`.
Aucune valeur par défaut optimiste n'est renvoyée : il vaut mieux refuser une
inscription que de faire du surbooking.

| Code | Cas |
|---|---|
| `200` | Disponibilité calculée. |
| `404` | Événement introuvable. |
| `503` | registrations-service injoignable. |

---

### `GET /health`

Sonde de santé utilisée par la directive `healthcheck` de Docker Compose.

```json
{ "status": "ok", "service": "events-service", "database": "connected" }
```

Renvoie `503` si la connexion PostgreSQL est perdue. Aucune authentification.

---

## Format d'erreur commun

Tous les services renvoient la même enveloppe d'erreur.

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Le champ maxCapacity doit etre un entier positif",
  "details": [ { "field": "maxCapacity", "issue": "doit etre superieur a 0" } ]
}
```

Codes `error` utilisés : `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`,
`FORBIDDEN`, `CONFLICT`, `SERVICE_UNAVAILABLE`, `INTERNAL_ERROR`.

---

## Variables d'environnement

| Clé | Exemple | Rôle |
|---|---|---|
| `PORT` | `3001` | Port d'écoute |
| `DATABASE_URL` | `postgres://events_user:pass@events-db:5432/events` | Connexion |
| `JWT_SECRET` | (secret partagé) | Vérification des jetons émis par auth-service |
| `REGISTRATIONS_SERVICE_URL` | `http://registrations-service:3003` | Appel inter-services |
| `NODE_ENV` | `production` | Mode |

---

## Ce qui peut être codé immédiatement

Le contrat ci-dessus est figé. Les écrans Événements se développent contre ces
formes de réponse sans attendre l'implémentation du service. En attendant le service
réel, utiliser un bouchon local (`msw` ou un simple `json-server`) alimenté par les
exemples JSON de ce document.
