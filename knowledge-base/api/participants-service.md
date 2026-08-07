# Contrat d'API : participants-service

**Statut : figé le 06/08/2026.**

| Propriété | Valeur |
|---|---|
| Port interne | `3002` |
| Préfixe via la passerelle | `/api/participants` |
| Base de données | `participants-db` (PostgreSQL 16, base `participants`) |
| Documentation live | `/api/participants/docs` |
| Propriétaire | Mamadou Seydou Soumountera |

---

## Modèle de données

Table `participants`.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `SERIAL` | clé primaire |
| `name` | `VARCHAR(150)` | non nul |
| `email` | `VARCHAR(150)` | non nul, **unique** |
| `phone` | `VARCHAR(30)` | nullable |
| `type` | `VARCHAR(20)` | non nul, parmi `etudiant`, `professeur`, `externe` |
| `created_at` | `TIMESTAMPTZ` | défaut `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | défaut `NOW()` |

Index : unique sur `email`, `idx_participants_name` sur `name` pour la recherche.

Le champ `type` est contraint côté base par un `CHECK`, pas seulement côté
application. Le sujet impose ces trois valeurs exactes.

### Représentation JSON

```json
{
  "id": 12,
  "name": "Awa Diallo",
  "email": "awa.diallo@dit.sn",
  "phone": "+221770000000",
  "type": "etudiant",
  "createdAt": "2026-08-07T10:12:00.000Z",
  "updatedAt": "2026-08-07T10:12:00.000Z"
}
```

---

## Points d'entrée

### `POST /participants`

Crée un participant.

```json
{
  "name": "Awa Diallo",
  "email": "awa.diallo@dit.sn",
  "phone": "+221770000000",
  "type": "etudiant"
}
```

Validation : `name` entre 2 et 150 caractères, `email` au format valide et normalisé
en minuscules avant insertion, `phone` optionnel au format international, `type`
strictement dans l'énumération.

| Code | Cas |
|---|---|
| `201` | Créé. |
| `400` | Validation échouée. |
| `409` | Cet email existe déjà. |

Accès public : c'est le formulaire d'inscription à la plateforme.

---

### `GET /participants`

Liste paginée.

| Paramètre | Effet |
|---|---|
| `type` | Filtre sur `etudiant`, `professeur` ou `externe` |
| `page`, `limit` | Pagination, mêmes défauts que events-service |

Réponse `200` : même enveloppe `{ data, pagination }` que events-service.

Authentification requise. La liste des participants contient des données
personnelles (email, téléphone), elle n'est pas publique.

---

### `GET /participants/search`

Recherche exigée par le sujet : par email ou par nom.

| Paramètre | Effet |
|---|---|
| `email` | Correspondance exacte, insensible à la casse |
| `name` | Correspondance partielle, insensible à la casse (`ILIKE %terme%`) |

Au moins un des deux paramètres est obligatoire, sinon `400`.

Réponse `200` : `{ "data": [ ... ] }`. Un tableau vide est une réponse valide,
pas une erreur `404`.

Authentification requise.

---

### `GET /participants/:id`

| Code | Cas |
|---|---|
| `200` | Trouvé. |
| `404` | Introuvable. |

Ce point d'entrée est appelé par `registrations-service` pour vérifier qu'un
participant existe avant de l'inscrire. Il doit rester rapide et stable.

Authentification requise.

---

### `PUT /participants/:id`

Met à jour le profil. Tous les champs optionnels.

| Code | Cas |
|---|---|
| `200` | Mis à jour. |
| `400` | Validation échouée. |
| `404` | Introuvable. |
| `409` | Le nouvel email est déjà pris par un autre participant. |

Authentification requise.

---

### `DELETE /participants/:id`

| Code | Cas |
|---|---|
| `204` | Supprimé. |
| `404` | Introuvable. |

Authentification requise.

---

### `GET /health`

```json
{ "status": "ok", "service": "participants-service", "database": "connected" }
```

---

## Relation avec auth-service

`participants-service` gère l'**identité métier** (qui est cette personne).
`auth-service` gère l'**authentification** (qui peut se connecter).

Ce sont deux tables dans deux bases différentes. Le lien se fait par l'email :
lorsqu'un compte est créé dans `auth-service`, le champ `email` correspond à celui
d'un participant. Aucune clé étrangère entre les deux bases, c'est volontaire et
cohérent avec le découpage microservices.

Un participant peut exister sans compte de connexion (inscrit par un organisateur).
Un compte ne peut pas exister sans participant correspondant : `auth-service`
vérifie via `GET participants-service/participants/search?email=...` au moment de
l'inscription.

---

## Variables d'environnement

| Clé | Exemple |
|---|---|
| `PORT` | `3002` |
| `DATABASE_URL` | `postgres://participants_user:pass@participants-db:5432/participants` |
| `JWT_SECRET` | secret partagé |
| `NODE_ENV` | `production` |
