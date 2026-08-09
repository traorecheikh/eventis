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
| Frontend | Vue 3 + Vite + Pinia + Vue Router | Vue 3.4+, Vite 8 |
| Style frontend | Tailwind CSS + Reka UI (composants headless) | Tailwind 4 |
| Icones frontend | lucide-vue-next | - |
| Notifications frontend | vue-sonner | - |
| Animation frontend | @vueuse/motion | - |
| Base de données | PostgreSQL | 16 |
| ORM | Prisma | 6 |
| Passerelle | Nginx | `nginx:alpine` |
| Documentation API | swagger-ui-express + swagger-jsdoc | - |
| Client API frontend | Orval (genere depuis l'OpenAPI de chaque service) | - |
| Tests backend | Jest + Supertest | - |
| Tests frontend | Vitest | - |
| Tests bout en bout | Playwright | - |
| Registry | GHCR (`ghcr.io`) | - |
| CI/CD | GitHub Actions | - |
| Hébergement | VPS Contabo + Dokploy | - |

### Interdictions explicites

- Pas de `node:latest` ni de `postgres:latest`. Les tags flottants cassent la
  reproductibilité des builds CI. Toujours une version majeure pinnée.
- Pas de MongoDB, pas de NestJS, pas de TypeScript sur le backend. Le sujet
  impose une base relationnelle et l'équipe a choisi Express en JavaScript.
- Prisma est la couche d'accès aux données autorisée, voir
  [ADR 0010](knowledge-base/adr/0010-prisma-orm.md). Pas de requête SQL manuscrite
  en dehors des migrations Prisma.
- ES modules (`import`/`export`) partout sur le backend, jamais `require` ni
  `module.exports`. Chaque `package.json` de service porte `"type": "module"`.
  Vérifiable : `grep -rn "require(" --include=*.js --exclude-dir=node_modules .`
  ne doit rien retourner en dehors de `prisma/migrations/`.
- Pas de nouvelle dépendance npm sans justification. Si elle est structurante
  (ORM, framework, broker de messages), elle passe par une ADR dans
  `knowledge-base/adr/`.
- Le contrat OpenAPI de chaque service est **généré** depuis des annotations
  JSDoc `@openapi` au-dessus de chaque route (`swagger-jsdoc`), jamais écrit à
  la main. Le client frontend est **généré** par Orval depuis ce contrat,
  jamais écrit à la main. Voir
  [ADR 0011](knowledge-base/adr/0011-openapi-genere-orval.md). Ni
  `openapi.json` ni `frontend/src/api/generated/` ne sont committés
  (`.gitignore`) : un agent qui les voit absents doit les régénérer
  (`npm run docs:generate` dans chaque service, puis `npm run generate:api`
  dans `frontend/`), jamais les recréer à la main.

---

## 2. Architecture

Quatre services backend, une passerelle, quatre bases.

```
Internet
   |
   v
Traefik (géré par Dokploy, TLS Let's Encrypt, venuva.xyz)
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
| `main` | Production. Déploiement automatique sur venuva.xyz. |
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

## 6. Interface frontend : éviter le rendu générique d'IA

Constat documenté (retours communautaires type Reddit sur les interfaces générées
par IA) : les assistants de code convergent vers un même style reconnaissable au
premier coup d'œil, perçu comme non professionnel. Ces règles s'appliquent à tout
écran, composant ou maquette produit par un agent IA sur ce dépôt.

### Interdit

- Dégradé violet/bleu générique en fond de hero ou de bouton principal.
- Emoji utilisé comme icône fonctionnelle (bouton, statut, notification). Utiliser
  `lucide-vue-next`.
- Texte de remplissage générique ("Boostez votre productivité", "Une solution
  puissante et intuitive") ou score creux type "4.9/5", "0/20 avis" sans donnée
  réelle derrière.
- Représentation stéréotypée de personnes, notamment de personnes africaines, dans
  les illustrations, photos de profil factices ou textes d'exemple. Les données de
  démonstration (`seed/`) utilisent des noms, lieux et contextes réels du Sénégal
  sans caricature.
- Carte ou bouton avec `box-shadow` lourd et coins très arrondis par défaut sans
  justification de design.
- Tiret cadratin, y compris dans les textes d'interface (même règle qu'en section 5).

### Attendu

- Feedback visuel réel sur chaque action : `vue-sonner` pour les notifications,
  états de chargement explicites (pas de simple spinner générique sans contexte),
  transitions `@vueuse/motion` discrètes et fonctionnelles, jamais décoratives
  seules.
- Composants accessibles construits sur `reka-ui` (clavier, focus, ARIA), stylés
  avec Tailwind : pas de composant visuel réinventé à la main quand `reka-ui`
  couvre le cas (dialogue, menu, select, tooltip).
- Palette et typographie choisies pour ce projet, pas les valeurs par défaut du
  gabarit Vite. Contraste vérifié (WCAG AA minimum).
- Copie en français, concrète, qui décrit l'action ("Créer l'événement") plutôt que
  l'émotion ("Vivez une expérience unique").

---

## 7. Structure du dépôt

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

## 8. Secrets

- Rien de secret n'entre dans le dépôt. Jamais.
- `.env` est dans `.gitignore`. `.env.example` liste les clés avec des valeurs
  factices et est versionné.
- Secrets de CI : dans GitHub Secrets (`DOKPLOY_WEBHOOK`).
- Secrets de runtime : dans les variables d'environnement Dokploy
  (`POSTGRES_PASSWORD`, `JWT_SECRET`).
- Si un secret est committé par erreur, il est considéré comme compromis :
  on le fait tourner, on ne se contente pas de le supprimer du dernier commit.

---

## 9. Rôles

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

## 10. Où chercher quoi

| Besoin | Fichier |
|---|---|
| Contrat d'un service avant de coder | `knowledge-base/api/<service>.md` |
| Pourquoi telle techno a été choisie | `knowledge-base/adr/` |
| Lancer le projet en local | `knowledge-base/runbooks/lancer-en-local.md` |
| Déployer ou revenir en arrière | `knowledge-base/runbooks/deployer.md`, `rollback.md` |
| Un conteneur ne démarre pas | `knowledge-base/runbooks/depannage.md` |
| Qui fait quoi et quand | `knowledge-base/scrum/repartition-taches.md`, `calendrier.md` |
| Spécification du Dockerfile ou du pipeline | `knowledge-base/specs/` |

---

## 11. État du dépôt (à tenir à jour)

Ce dépôt est en cours de construction. Un agent qui reprend le travail doit
d'abord lire ce tableau, pas supposer que ce que décrivent le README ou les
contrats est déjà implémenté.

| Élément | État |
|---|---|
| `auth-service` | Implémenté : Prisma, ES modules, tests unitaires + intégration, Dockerfile |
| `event-service` | Implémenté partiellement : `GET /events` (public, pagination page/limit) et `POST /events` (authentifié) seulement. Manquent `GET /events/:id`, `PUT /events/:id`, `DELETE /events/:id`, `GET /events/:id/availability`, filtres `date`/`dateFrom`/`dateTo`/`location`. Voir le contrat `knowledge-base/api/events-service.md`. Le dossier s'appelle `event-service` (singulier) alors que le contrat et le README disent `events-service` : renommage à faire dans une PR dédiée, pas en même temps qu'une autre modification |
| `participants-service` | Squelette seulement : `package.json` avec les dépendances attendues, dossiers vides avec `.gitkeep`. Aucun code. Voir `participants-service/README.md` pour la marche à suivre |
| `registrations-service` | Squelette seulement, même état que `participants-service` |
| `frontend/` | Socle scaffoldé (Vue 3, Vite 8, Vue Router, Pinia, Tailwind, Reka UI, lucide, vue-sonner, @vueuse/motion) et vérifié : `npm run build` passe. Une seule vue de vérification (`HomeView.vue`), aucun écran produit réel. Voir section 6 pour les règles de design avant d'en construire |
| `gateway/` | `nginx.conf` proxifie `/api/auth` et `/api/events` seulement, sections `participants`/`registrations` commentées prêtes à activer. Construit et testé avec `docker compose up`, y compris le frontend intégré dans la même image (ADR 0005) |
| `docker-compose.yml` | Couvre `auth-service`, `event-service`, `gateway` (avec frontend intégré), `uptime-kuma`. Télécharge les images GHCR (`ghcr.io/traorecheikh/eventis-<service>`), ne construit rien : conforme à README section 7.4. Pour construire en local, ajouter `docker-compose.dev.yml` (`docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`). Ne couvre pas encore `participants-service`/`registrations-service`, absents du code |
| `.github/workflows/ci.yml` | Fait : jobs indépendants par service (path filters sur `auth-service/**`, `event-service/**`, `frontend/**`, `gateway/**`), `lint:esm` puis `test` par service backend. Vérifié par une execution réelle sur GitHub (tous les jobs verts) |
| `.github/workflows/cd.yml` | Fait : sur push `main`, rejoue les tests, construit et pousse les 3 images (`auth-service`, `event-service`, `gateway`) sur GHCR avec deux tags (`latest` et le SHA du commit, pour permettre un rollback ciblé, voir R-03 dans `knowledge-base/scrum/risques.md`), puis appelle le webhook Dokploy. Les images GHCR sont **privées par défaut** : suivre `knowledge-base/runbooks/installer-vps-dokploy.md` section 6 (les rendre publiques, ou configurer un registry privé dans Dokploy) avant le premier déploiement, sinon Dokploy ne pourra pas télécharger les images. Structure vérifiée (`act`, `docker build` local des 3 images), le job `deploy` (webhook) n'a pas pu être exécuté pour de vrai : nécessite `DOKPLOY_WEBHOOK` configuré et un vrai push sur `main` |
| `.github/workflows/security.yml` | N'existe pas encore, mentionné au README (CodeQL, Semgrep, audit des dépendances) |
| Uptime Kuma | Conteneur ajouté au compose, port `3010` en local. Configuration des moniteurs (health check par service) pas encore faite, à faire une fois le VPS stable |

**Consigne pour tout agent IA** : si une tâche demandée dépend d'un élément
marqué incomplet ci-dessus, le compléter dans la mesure du raisonnable avant de
continuer, en suivant le patron déjà établi par `auth-service` et
`event-service` (Prisma, ES modules, tests, Dockerfile, healthcheck). Mettre à
jour ce tableau après coup. Ne jamais prétendre qu'un élément est fini sans
l'avoir vérifié par une commande réelle (`npm test`, `docker compose build`,
`docker compose up` puis `curl`).
