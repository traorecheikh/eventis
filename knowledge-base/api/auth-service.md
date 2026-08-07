# Contrat d'API : auth-service

**Statut : figé le 06/08/2026.**

Quatrième microservice. Le sujet exige "au moins 3 services backend" : celui-ci est
le service supplémentaire qui porte l'authentification JWT.

| Propriété | Valeur |
|---|---|
| Port interne | `3004` |
| Préfixe via la passerelle | `/api/auth` |
| Base de données | `auth-db` (PostgreSQL 16, base `auth`) |
| Documentation live | `/api/auth/docs` |
| Propriétaire | Paire A |

---

## Modèle de données

Table `users`.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `SERIAL` | clé primaire |
| `email` | `VARCHAR(150)` | non nul, unique |
| `password_hash` | `VARCHAR(255)` | non nul |
| `role` | `VARCHAR(20)` | non nul, parmi `organisateur`, `participant` |
| `participant_id` | `INTEGER` | nullable, référence logique vers participants-service |
| `created_at` | `TIMESTAMPTZ` | défaut `NOW()` |
| `last_login_at` | `TIMESTAMPTZ` | nullable |

Le mot de passe est haché avec `bcrypt`, coût 10. Le mot de passe en clair
n'apparaît jamais dans un log, jamais dans une réponse, jamais en base.

### Rôles

| Rôle | Droits |
|---|---|
| `organisateur` | Créer, modifier, supprimer des événements. Voir toutes les listes. |
| `participant` | Consulter les événements, s'inscrire, annuler sa propre inscription. |

---

## Points d'entrée

### `POST /auth/register`

```json
{
  "email": "awa.diallo@dit.sn",
  "password": "MotDePasse123",
  "role": "participant"
}
```

Validation : email valide et normalisé en minuscules, mot de passe d'au moins
8 caractères contenant au moins une lettre et un chiffre, `role` dans l'énumération.

Le service vérifie qu'un participant existe avec cet email via
`GET participants-service/participants/search?email=...` et renseigne
`participant_id`. Si aucun participant ne correspond, `participant_id` reste `null`
et le compte est créé quand même : le lien pourra être fait plus tard.

Réponse `201` :

```json
{
  "user": { "id": 3, "email": "awa.diallo@dit.sn", "role": "participant", "participantId": 12 },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

| Code | Cas |
|---|---|
| `201` | Compte créé, jeton émis. |
| `400` | Validation échouée. |
| `409` | Cet email a déjà un compte. |

---

### `POST /auth/login`

```json
{ "email": "awa.diallo@dit.sn", "password": "MotDePasse123" }
```

Réponse `200` : même forme que `register`.

| Code | Cas |
|---|---|
| `200` | Connecté. |
| `400` | Corps invalide. |
| `401` | Identifiants incorrects. |

**Important :** en cas d'email inconnu comme en cas de mot de passe faux, la réponse
est identique (`401`, message générique "Identifiants incorrects"). Ne jamais
révéler si l'email existe : cela permettrait d'énumérer les comptes.

Met à jour `last_login_at`.

---

### `GET /auth/me`

Renvoie l'utilisateur associé au jeton fourni dans l'en-tête
`Authorization: Bearer <token>`.

```json
{ "id": 3, "email": "awa.diallo@dit.sn", "role": "participant", "participantId": 12 }
```

| Code | Cas |
|---|---|
| `200` | Jeton valide. |
| `401` | Jeton absent, expiré ou signature invalide. |

---

### `POST /auth/verify`

Point d'entrée interne destiné aux autres services qui souhaitent valider un jeton
sans embarquer la logique JWT.

```json
{ "token": "eyJhbGciOiJIUzI1NiIs..." }
```

Réponse `200` : `{ "valid": true, "payload": { "sub": 3, "email": "...", "role": "participant" } }`
Réponse `401` : `{ "valid": false, "reason": "expired" }`

En pratique, les trois autres services vérifient le jeton **localement** avec le
`JWT_SECRET` partagé, ce qui évite un aller-retour réseau à chaque requête. Ce point
d'entrée existe comme filet de sécurité et pour le débogage.

---

### `GET /health`

```json
{ "status": "ok", "service": "auth-service", "database": "connected" }
```

---

## Format du jeton

Algorithme `HS256`, secret partagé via la variable `JWT_SECRET`.

```json
{
  "sub": 3,
  "email": "awa.diallo@dit.sn",
  "role": "participant",
  "participantId": 12,
  "iat": 1786000000,
  "exp": 1786086400
}
```

Durée de validité : 24 heures (`86400` secondes). Pas de jeton de rafraîchissement :
hors périmètre pour un examen de deux semaines, et documenté comme amélioration
possible dans le rapport.

---

## Middleware partagé

Les quatre services utilisent le même middleware `requireAuth`, dupliqué dans chaque
service (pas de package partagé : cela créerait un couplage de build entre
microservices).

```
1. Lire l'en-tete Authorization. Absent -> 401 UNAUTHORIZED.
2. Extraire le jeton apres "Bearer ". Format invalide -> 401.
3. jwt.verify avec JWT_SECRET. Echec -> 401.
4. Attacher le payload a req.user.
5. Passer au handler suivant.
```

Un second middleware `requireRole('organisateur')` renvoie `403 FORBIDDEN` si le
rôle ne correspond pas.

### Points d'entrée protégés par rôle

| Route | Rôle exigé |
|---|---|
| `POST`, `PUT`, `DELETE /events` | `organisateur` |
| `GET /events`, `GET /events/:id` | aucun, accès public |
| `GET /participants`, `/search` | authentifié |
| `POST /registrations` | authentifié |
| `DELETE /registrations/:id` | authentifié, et propriétaire ou organisateur |
| `GET /registrations/stats` | `organisateur` |

---

## Variables d'environnement

| Clé | Exemple |
|---|---|
| `PORT` | `3004` |
| `DATABASE_URL` | `postgres://auth_user:pass@auth-db:5432/auth` |
| `JWT_SECRET` | chaîne aléatoire d'au moins 32 caractères |
| `JWT_EXPIRES_IN` | `24h` |
| `BCRYPT_ROUNDS` | `10` |
| `PARTICIPANTS_SERVICE_URL` | `http://participants-service:3002` |
| `NODE_ENV` | `production` |

Génération du secret :

```bash
openssl rand -base64 48
```

Ce secret est identique pour les quatre services. Il est stocké dans les variables
d'environnement Dokploy en production et dans le `.env` local en développement.
Il n'est jamais committé.
