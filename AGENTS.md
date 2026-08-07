# AGENTS.md

Instructions permanentes pour tout agent IA et tout membre de l'équipe travaillant
sur ce dépôt. Ce fichier est la source de vérité. `CLAUDE.md` est un lien
symbolique vers lui.

Projet : **EventHub**, examen pratique DevOps, Master 1 Intelligence Artificielle,
Dakar Institute of Technology. Équipe 7. Deadline interne : **17 août 2026**.

---

## 1. Stack verrouillée

Aucune de ces technologies ne se remplace sans une ADR validée par le Scrum Master.

| Couche | Technologie | Version |
|---|---|---|
| Backend | Node.js + Express | `node:24-alpine` |
| Frontend | Vue 3 + Vite + Pinia + Vue Router | Vue 3.4+ |
| Base de données | PostgreSQL | 16 |
| Passerelle | Nginx | `nginx:alpine` |
| Documentation API | swagger-ui-express + swagger-jsdoc | - |
| Tests backend | Jest + Supertest | - |
| Tests frontend | Vitest | - |
| Tests bout en bout | Playwright | - |
| Registry | GHCR (`ghcr.io`) | - |
| CI/CD | GitHub Actions | - |
| Hébergement | VPS Contabo + Dokploy | - |

### Interdictions explicites

- Pas de `node:latest` ni de `postgres:latest`. Les tags flottants cassent la
  reproductibilité des builds CI. Toujours une version majeure pinnée.
- Pas de MongoDB, pas de Prisma, pas de NestJS, pas de TypeScript sur le backend.
  Le sujet impose une base relationnelle et l'équipe a choisi Express en JavaScript.
- Pas de nouvelle dépendance npm sans justification. Si elle est structurante
  (ORM, framework, broker de messages), elle passe par une ADR dans
  `knowledge-base/adr/`.

---

## 2. Architecture

Quatre services backend, une passerelle, quatre bases.

```
Internet
   |
   v
Traefik (géré par Dokploy, TLS Let's Encrypt, eventis.xyz)
   |
   v
nginx  (sert le build Vue + proxifie /api/*)   <-- seul conteneur exposé
   |
   +--> /api/auth/*          --> auth-service:3004          --> auth-db
   +--> /api/events/*        --> events-service:3001        --> events-db
   +--> /api/participants/*  --> participants-service:3002  --> participants-db
   +--> /api/registrations/* --> registrations-service:3003 --> registrations-db
```

Règles :

- Un service ne lit **jamais** la base d'un autre service. Il passe par son API REST.
- Les bases et les services backend ne sont **jamais** publiés sur l'hôte. Ils vivent
  sur le réseau Docker `backend`. Seul `nginx` est sur le réseau `frontend`.
- `registrations-service` appelle `events-service` pour vérifier la capacité et
  `participants-service` pour vérifier l'existence du participant.

---

## 3. Git

### Branches

| Branche | Rôle |
|---|---|
| `main` | Production. Déploiement automatique sur eventis.xyz. |
| `develop` | Intégration continue. Cible par défaut des PR. |
| `feature/*` | Travail en cours. |

Nommage : `feature/<service>-<sujet-court>`, en minuscules, avec des tirets.
Exemples : `feature/events-crud`, `feature/frontend-page-inscriptions`,
`feature/ci-docker-build`.

### Interdiction absolue

**Aucun push direct sur `main` ou `develop`.** Les deux branches sont protégées.
Tout passe par une Pull Request. Si un agent IA se retrouve sur `main`, il crée une
branche `feature/*` avant toute modification.

### Commits

Format Conventional Commits, message en français, impératif présent.

```
<type>(<portée>): <description>

Types : feat, fix, docs, style, refactor, test, chore, ci
Portées : events, participants, registrations, auth, frontend, gateway,
          docker, ci, docs, kb
```

Exemples valides :

```
feat(events): ajouter la route GET /events/:id/availability
fix(registrations): corriger le calcul des places restantes
ci(docker): pousser les images sur GHCR apres les tests
docs(kb): figer le contrat d'API du service participants
```

### Pull Requests

- Cible `develop`, jamais `main` sauf release de fin de sprint.
- 1 approbation obligatoire.
- CI verte obligatoire.
- Le template `.github/PULL_REQUEST_TEMPLATE.md` doit être rempli, y compris la
  case Definition of Done.

---

## 4. Definition of Done

Une issue ne se ferme que si les quatre conditions sont vraies.

1. Le code est mergé via une PR approuvée par au moins une personne.
2. Les tests unitaires existent et passent au vert en CI.
3. Le conteneur du service se construit et démarre en `healthy`
   (`docker compose ps` le confirme).
4. La documentation Swagger du service et la section correspondante du `README.md`
   sont à jour.

---

## 5. Style de rédaction

Ces règles s'appliquent à tous les fichiers Markdown, au README, au rapport LaTeX
et à tout texte généré.

- **Langue : français.** Le code, les noms de variables et les messages de commit
  restent en anglais pour les mots-clés techniques, mais les descriptions sont en
  français.
- **Aucun tiret cadratin.** Ni le caractère long, ni sa variante moyenne. Utiliser
  deux points, une virgule, une parenthèse ou un point. Cette règle est vérifiable :
  `grep -rn "—" .` doit ne rien retourner.
- **Aucun emoji** dans les livrables (README, rapport, base de connaissances, code).
- Pas de superlatifs creux. On décrit ce que le code fait, pas à quel point c'est bien.
- Les tableaux Markdown sont préférés aux longues listes à puces quand il y a des
  colonnes naturelles.

---

## 6. Structure du dépôt

```
eventis/
  README.md                 livrable noté
  AGENTS.md                 ce fichier
  CLAUDE.md                 lien symbolique vers AGENTS.md
  docker-compose.yml        orchestration locale et production
  .env.example              variables requises, sans valeurs secrètes
  events-service/           service + Dockerfile
  participants-service/     service + Dockerfile
  registrations-service/    service + Dockerfile
  auth-service/             service + Dockerfile
  frontend/                 Vue 3 + Dockerfile (build + nginx)
  gateway/                  configuration nginx
  .github/workflows/        pipelines CI/CD
  knowledge-base/           documentation interne
  rapport/                  sources LaTeX du rapport PDF
```

---

## 7. Secrets

- Rien de secret n'entre dans le dépôt. Jamais.
- `.env` est dans `.gitignore`. `.env.example` liste les clés avec des valeurs
  factices et est versionné.
- Secrets de CI : dans GitHub Secrets (`DOKPLOY_WEBHOOK`).
- Secrets de runtime : dans les variables d'environnement Dokploy
  (`POSTGRES_PASSWORD`, `JWT_SECRET`).
- Si un secret est committé par erreur, il est considéré comme compromis :
  on le fait tourner, on ne se contente pas de le supprimer du dernier commit.

---

## 8. Rôles

Découpage en tranches verticales : chaque développeur possède un service backend
**et** les écrans qui le consomment.

| Personne | Rôle | Périmètre | Étiquette |
|---|---|---|---|
| Cheikh Ahmed Tijani Traoré | Scrum Master | Infrastructure, CI/CD, VPS, Dokploy, passerelle, documentation, pilotage, revue de toutes les PR | `resp:sm` |
| Alpha Abdoulaye LANSAR | Développeur | `auth-service`, socle frontend, écrans Connexion et Inscription, Vitest, Playwright | `resp:alpha` |
| Kassem Dehou Modeste | Développeur | `events-service` et les écrans Événements | `resp:kassem` |
| Mamadou Seydou Soumountera | Développeur | `participants-service` et les écrans Participants | `resp:mamadou` |
| BAH Thierno Madjou | Développeur | `registrations-service` et les écrans Inscriptions et Tableau de bord | `resp:thierno` |

Règle : on ne corrige pas le service d'un autre. Un écart avec le contrat d'API
ouvre une issue `bug` assignée au propriétaire du service.

Détail complet dans `knowledge-base/scrum/repartition-taches.md`.

---

## 9. Où chercher quoi

| Besoin | Fichier |
|---|---|
| Contrat d'un service avant de coder | `knowledge-base/api/<service>.md` |
| Pourquoi telle techno a été choisie | `knowledge-base/adr/` |
| Lancer le projet en local | `knowledge-base/runbooks/lancer-en-local.md` |
| Déployer ou revenir en arrière | `knowledge-base/runbooks/deployer.md`, `rollback.md` |
| Un conteneur ne démarre pas | `knowledge-base/runbooks/depannage.md` |
| Qui fait quoi et quand | `knowledge-base/scrum/repartition-taches.md`, `calendrier.md` |
| Spécification du Dockerfile ou du pipeline | `knowledge-base/specs/` |
