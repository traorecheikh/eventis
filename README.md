# EventHub

Plateforme de gestion d'événements en architecture microservices.

Examen pratique DevOps, Master 1 Intelligence Artificielle, Dakar Institute of
Technology. Équipe 7.

![CI](https://github.com/traorecheikh/eventis/actions/workflows/ci.yml/badge.svg)
![CD](https://github.com/traorecheikh/eventis/actions/workflows/cd.yml/badge.svg)

Application déployée : [https://venuva.xyz](https://venuva.xyz)

---

## Sommaire

1. [Présentation du projet](#1-presentation-du-projet)
2. [Architecture](#2-architecture)
3. [Prérequis techniques](#3-prerequis-techniques)
4. [Installation et lancement manuel](#4-installation-et-lancement-manuel)
5. [Instructions Docker](#5-instructions-docker)
6. [Instructions Docker Compose](#6-instructions-docker-compose)
7. [Pipeline GitHub Actions](#7-pipeline-github-actions)
8. [Structure du projet](#8-structure-du-projet)
9. [Technologies utilisées](#9-technologies-utilisees)
10. [Documentation interne](#10-documentation-interne)
11. [Auteurs](#11-auteurs)

---

## 1. Présentation du projet

Le Dakar Institute of Technology organise des conférences, des ateliers et des
séminaires. Cette organisation repose aujourd'hui sur des outils dispersés :
formulaires Google, tableurs Excel et échanges par courriel. Il en résulte quatre
problèmes : le suivi des inscriptions en temps réel est difficile, les organisateurs
n'ont aucun tableau de bord, la communication avec les participants est mauvaise, et
les données sont éparpillées.

EventHub répond à ces quatre points par une plateforme web unique permettant de :

- créer et gérer des événements,
- gérer les inscriptions des participants,
- suivre la capacité et les statistiques,
- communiquer avec les participants.

### Fonctionnalités

| Domaine | Fonctionnalités | Statut |
|---|---|---|
| Authentification | Inscription, connexion, jetons JWT, deux rôles, protection des routes sensibles | Implémenté |
| Événements | Listage public avec pagination, création (authentifiée), lecture par id, disponibilité en temps réel | Implémenté partiellement, voir section 2 |
| Participants | Création de compte, modification de profil, suppression, listage, recherche | Implémenté |
| Inscriptions | Inscription à un événement, annulation, statistiques, refus du surbooking | Implémenté |

---

## 2. Architecture

Architecture cible : quatre services backend indépendants, une interface web, une
passerelle, quatre bases de données. Voir la colonne Statut ci-dessous pour ce qui
est réellement implémenté aujourd'hui.

```mermaid
graph TB
    U[Navigateur]
    T["Traefik<br/>TLS, venuva.xyz<br/>géré par Dokploy"]
    NG["gateway (nginx)<br/>sert le build Vue<br/>proxifie /api/*"]

    AU["auth-service :3004"]
    EV["event-service :3001"]
    PA["participants-service :3002"]
    RE["registrations-service :3003"]

    AUDB[("auth-db")]
    EVDB[("events-db")]
    PADB[("participants-db")]
    REDB[("registrations-db")]

    U -->|HTTPS| T --> NG
    NG --> AU
    NG --> EV
    NG --> PA
    NG --> RE
    AU --> AUDB
    EV --> EVDB
    PA --> PADB
    RE --> REDB
    RE -.->|verifie| EV
    RE -.->|verifie| PA
```

### Principes

- **Une base par service.** Un conteneur PostgreSQL par service backend, jamais
  partagé. Les échanges entre services passent exclusivement par API REST.
- **Un seul point d'entrée.** Seul le conteneur `gateway` (nginx) est exposé sur
  l'hôte. Les services et les bases restent sur des réseaux Docker privés.
- **Authentification centralisée.** `auth-service` émet les jetons JWT ; les
  autres services les vérifient localement avec le secret partagé `JWT_SECRET`.

Le détail figure dans
[knowledge-base/architecture/vue-ensemble.md](knowledge-base/architecture/vue-ensemble.md).

### Microservices

| Service | Dossier | Port | Statut |
|---|---|---|---|
| `auth-service` | `auth-service/` | 3004 | Implémenté : Prisma, ES modules, tests, Dockerfile |
| `events-service` | `event-service/` (nom de dossier à corriger, voir `AGENTS.md`) | 3001 | Implémenté partiellement : `GET /events` public paginé, `POST /events` authentifié, `GET /events/:id`, `GET /events/:id/availability`. Pas encore de `PUT/DELETE /events/:id` ni de filtres |
| `participants-service` | `participants-service/` | 3002 | Implémenté : CRUD, recherche, authentification JWT |
| `registrations-service` | `registrations-service/` | 3003 | Implémenté : inscription, annulation, statistiques, refus du surbooking |

Le contrat complet visé pour chaque service se trouve dans
[knowledge-base/api/](knowledge-base/api/).

---

## 3. Prérequis techniques

| Outil | Version minimale | Nécessaire pour |
|---|---|---|
| Docker Engine | 24 | Lancement conteneurisé, Prisma (génération du client) |
| Docker Compose | v2 | Orchestration |
| Node.js | 24 | Lancement manuel |
| npm | 10 | Lancement manuel |
| Git | 2.40 | Récupération du code |

Une base PostgreSQL locale n'est pas nécessaire : chaque service peut démarrer sa
propre base en conteneur via `npm run dx` (voir section 4).

Vérification :

```bash
docker --version && docker compose version && node --version && npm --version
```

---

## 4. Installation et lancement manuel

### 4.1 Récupérer le code

```bash
git clone https://github.com/traorecheikh/eventis.git
cd eventis
```

### 4.2 Lancer les quatre services backend

Chaque service a une commande unique qui démarre sa base PostgreSQL en conteneur
Docker (créée automatiquement au premier lancement), synchronise le schéma Prisma,
génère un `.env` de développement si absent, puis lance le serveur avec
rechargement à chaud :

```bash
cd auth-service && npm install && npm run dx              # port 3004
```

Dans des terminaux séparés :

```bash
cd event-service && npm install && npm run dx             # port 3001
cd participants-service && npm install && npm run dx      # port 3002
cd registrations-service && npm install && npm run dx     # port 3003
```

`registrations-service` a besoin de `EVENTS_SERVICE_URL` et
`PARTICIPANTS_SERVICE_URL` (voir `registrations-service/.env.example`) pour
joindre les deux autres services lors d'une inscription.

### 4.3 Lancer l'interface

```bash
cd frontend && npm install && npm run dev         # port 5173
```

Socle scaffoldé (Vue 3, Vite, Tailwind, Reka UI) : une seule vue de vérification,
aucun écran produit. L'application est disponible sur `http://localhost:5173`.

### 4.4 Vérifier

```bash
curl http://localhost:3004/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

Chaque appel doit renvoyer `{"status":"ok", ...}`.

---

## 5. Instructions Docker

Les quatre services backend et `gateway` ont chacun leur propre `Dockerfile`.

### 5.1 Construire une image

```bash
docker build -t eventhub-auth          ./auth-service
docker build -t eventhub-event         ./event-service
docker build -t eventhub-participants  ./participants-service
docker build -t eventhub-registrations ./registrations-service
docker build -f gateway/Dockerfile -t eventhub-gateway .   # contexte = racine, construit aussi frontend/
```

### 5.2 Lancer un service seul

```bash
docker network create eventhub-net

docker run -d --name auth-db --network eventhub-net \
  -e POSTGRES_USER=auth_user \
  -e POSTGRES_PASSWORD=motdepasse \
  -e POSTGRES_DB=auth \
  -v auth_data:/var/lib/postgresql/data \
  postgres:16-alpine

docker run -d --name auth-service --network eventhub-net \
  -e DATABASE_URL=postgresql://auth_user:motdepasse@auth-db:5432/auth \
  -e JWT_SECRET=votre_secret \
  -e PORT=3004 \
  -p 3004:3004 \
  eventhub-auth
```

### 5.3 Choix de conteneurisation

| Pratique | Mise en oeuvre |
|---|---|
| Image de base légère | `node:24-alpine` pour les services, `nginx:alpine` pour la passerelle |
| Construction multi-étapes | Étape de dépendances puis étape d'exécution. `gateway` construit le frontend avec Node puis ne conserve que Nginx et les fichiers statiques. |
| Utilisateur non privilégié | `USER node` sur les services Node, les conteneurs ne tournent pas en root |
| Variables d'environnement | Aucune valeur en dur, toute la configuration est injectée |
| Sonde de santé | Directive `HEALTHCHECK` interrogeant `/health` sur `127.0.0.1` (pas `localhost`, voir `knowledge-base/runbooks/depannage.md`) |
| Contexte de build réduit | `.dockerignore` excluant `node_modules`, `.git` et les tests |
| Volumes persistants | Un volume nommé par base de données |

---

## 6. Instructions Docker Compose

Deux fichiers compose :

- `docker-compose.yml` : production, télécharge des images prêtes depuis GHCR
  (`ghcr.io/traorecheikh/eventis-<service>`), ne construit rien.
- `docker-compose.dev.yml` : override de développement local, construit les
  images depuis les sources.

### 6.1 Démarrer en local (construction depuis les sources)

```bash
cp .env.example .env      # puis renseigner les valeurs
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
docker compose ps
```

Les dix conteneurs doivent afficher `(healthy)` : `auth-db`, `auth-service`,
`events-db`, `event-service`, `participants-db`, `participants-service`,
`registrations-db`, `registrations-service`, `gateway`, `uptime-kuma`.

| URL | Contenu |
|---|---|
| `http://localhost` | Interface web (socle) |
| `http://localhost/api/events` | API événements (liste publique paginée) |
| `http://localhost/api/events/:id/availability` | Disponibilité d'un événement en temps réel |
| `http://localhost/api/participants` | API participants (authentifiée) |
| `http://localhost/api/registrations` | API inscriptions (authentifiée) |
| `http://localhost/api/auth/register` | Inscription |
| `http://localhost:3010` | Uptime Kuma (supervision, moniteurs pas encore configurés) |

### 6.2 Démarrer en production (images GHCR)

```bash
docker compose up -d
```

Nécessite que les images `eventis-auth-service`, `eventis-event-service`,
`eventis-participants-service`, `eventis-registrations-service` et
`eventis-gateway` existent sur GHCR (publiées automatiquement par `cd.yml` sur
push vers `main`) et soient accessibles (publiques, ou un registry privé
configuré côté déploiement).

### 6.3 Commandes courantes

```bash
docker compose logs -f event-service      # suivre un service
docker compose restart event-service      # redémarrer
docker compose down                       # arrêter, conserver les données
docker compose down -v                    # arrêter et détruire les volumes
```

### 6.4 Contenu de l'orchestration

| Élément | Détail |
|---|---|
| Services | 4 services Node (`auth-service`, `event-service`, `participants-service`, `registrations-service`), 4 PostgreSQL, 1 passerelle Nginx (avec le build Vue intégré), 1 Uptime Kuma |
| Réseaux | `frontend` et `backend`. Seul `gateway` appartient aux deux. |
| Volumes | `auth_data`, `events_data`, `participants_data`, `registrations_data`, `uptime_kuma_data` |
| Sondes | Sur chaque conteneur applicatif, avec `depends_on: condition: service_healthy` |
| Redémarrage | `restart: unless-stopped` |

---

## 7. Pipeline GitHub Actions

Deux workflows dans `.github/workflows/`. Un troisième (`security.yml`, CodeQL et
Semgrep) est mentionné dans les specs mais pas encore écrit.

| Workflow | Déclenchement | Rôle |
|---|---|---|
| `ci.yml` | push sur `develop`/`feature/*`, PR vers `develop`/`main` | Job indépendant par service (path filters), lint et tests |
| `cd.yml` | push sur `main` | Tests, build et publication des images sur GHCR, mise à jour du tag d'image côté Dokploy, déclenchement du webhook, vérification post-déploiement |

### 7.1 Étapes du pipeline

| # | Étape | Contenu |
|---|---|---|
| 1 | Checkout | `actions/checkout@v4` |
| 2 | Setup | `actions/setup-node@v4`, Node 24, cache npm |
| 3 | Garde ES modules | `npm run lint:esm`, échoue si `require()` est présent dans `src/` |
| 4 | Migrations | `npx prisma migrate deploy` contre un PostgreSQL éphémère (service GitHub Actions) |
| 5 | Tests | Jest et Supertest sur les quatre services backend |
| 6 | Build frontend | `npm run generate:api` (genere `openapi.json` pour les quatre services puis le client Orval dans `frontend/src/api/generated/`, voir [ADR 0011](knowledge-base/adr/0011-openapi-genere-orval.md)) puis `npm run build` |
| 7 | Docker Build et Push | 5 images (`auth-service`, `event-service`, `participants-service`, `registrations-service`, `gateway`) via `docker/build-push-action@v5`, tags `latest` et SHA du commit |
| 8 | Deploy | Mise à jour de `IMAGE_TAG` côté Dokploy (force le re-téléchargement de l'image), webhook Dokploy, vérification de `/api/events` |

### 7.2 Contrôles de qualité

| Contrôle | Outil | Effet |
|---|---|---|
| ES modules obligatoires | Script `scripts/check-no-require.js` | Bloque le job |
| Migrations Prisma valides | `prisma migrate deploy` | Bloque le job |
| Tests unitaires et d'intégration | Jest, Supertest | Bloque le job |
| Couverture | Jest `--coverage` (mesurée, seuil non encore imposé) | Signale |

ESLint, Prettier, Trivy, CodeQL et Semgrep ne sont pas encore intégrés au pipeline.

### 7.3 Stratégie de branches

| Branche | Rôle |
|---|---|
| `main` | Production, déploiement automatique sur venuva.xyz |
| `develop` | Intégration continue, cible par défaut des PR |
| `feature/*` | Développement d'une fonctionnalité |

`main` et `develop` sont protégées : aucun push direct, une approbation
obligatoire, et les checks CI (`detect-changes`, `auth-service`, `event-service`,
`participants-service`, `registrations-service`, `frontend`, `gateway`) doivent
être verts pour merger.

### 7.4 Déploiement

Les images sont construites par GitHub Actions et publiées sur GHCR, taguées avec
le SHA du commit (pas seulement `latest`) pour permettre un rollback ciblé. Le VPS
ne construit rien : il télécharge des images prêtes. La dernière étape du workflow
met à jour la variable d'environnement `IMAGE_TAG` de l'application Dokploy via son
API, puis appelle le webhook de déploiement.

Détail dans
[knowledge-base/specs/pipeline-ci-cd.md](knowledge-base/specs/pipeline-ci-cd.md).

---

## 8. Structure du projet

```
eventis/
├── auth-service/               service d'authentification, implémenté
│   ├── src/
│   ├── prisma/                 schema.prisma, migrations
│   ├── tests/                  unit/, integration/
│   ├── scripts/                dx.js (dev local), check-no-require.js (garde ESM)
│   ├── Dockerfile
│   └── package.json
├── event-service/               service des événements, implémenté partiellement
│   └── (même structure que auth-service)
├── participants-service/       service des participants, implémenté
│   └── (même structure que auth-service)
├── registrations-service/      service des inscriptions, implémenté
│   └── (même structure que auth-service)
├── frontend/                   socle Vue 3 scaffoldé, aucun écran produit
│   ├── src/
│   ├── vite.config.js
│   └── package.json
├── gateway/                    passerelle Nginx
│   ├── nginx.conf
│   └── Dockerfile               construit aussi frontend/ (multi-étapes)
├── .github/
│   ├── workflows/               ci.yml, cd.yml
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── knowledge-base/             documentation interne
│   ├── adr/                    décisions d'architecture
│   ├── api/                    contrats visés des 4 services
│   ├── architecture/           diagrammes et modèles de données
│   ├── runbooks/               procédures d'exploitation
│   ├── scrum/                  pilotage du projet
│   └── specs/                  spécifications Docker et CI/CD
├── rapport/                    sources du rapport
├── docker-compose.yml           production, images GHCR
├── docker-compose.dev.yml       override developpement, build local
├── .env.example
├── AGENTS.md                   règles de travail de l'équipe, état du dépôt à jour
├── CLAUDE.md                   lien symbolique vers AGENTS.md
└── README.md
```

---

## 9. Technologies utilisées

### Backend

| Technologie | Version | Rôle |
|---|---|---|
| Node.js | 24 LTS | Exécution, ES modules (`import`/`export`) |
| Express | 5 | Framework HTTP |
| Prisma | 6 | ORM, migrations versionnées (voir [ADR 0010](knowledge-base/adr/0010-prisma-orm.md)) |
| PostgreSQL | 16 | Base de données relationnelle |
| jsonwebtoken | 9 | Émission et vérification des JWT |
| bcrypt | 6 | Hachage des mots de passe |

### Frontend

| Technologie | Version | Rôle |
|---|---|---|
| Vue.js | 3 | Framework d'interface |
| Vite | 8 | Outil de construction |
| Vue Router | 4 | Navigation |
| Pinia | 2 | Gestion d'état |
| Tailwind CSS | 4 | Style |
| Reka UI | - | Composants accessibles (headless) |
| lucide-vue-next | - | Icônes |
| vue-sonner | - | Notifications |
| @vueuse/motion | - | Transitions |
| Axios | 1 | Client HTTP |

### Tests

| Technologie | Rôle | Statut |
|---|---|---|
| Jest | Tests unitaires backend | Implémenté (quatre services backend) |
| Supertest | Tests d'intégration HTTP | Implémenté |
| Vitest | Tests unitaires frontend | Non commencé |
| Playwright | Tests de bout en bout | Non commencé |

### Infrastructure

| Technologie | Rôle |
|---|---|
| Docker et Docker Compose | Conteneurisation et orchestration |
| Nginx | Passerelle et service des fichiers statiques |
| GitHub Actions | Intégration et livraison continues |
| GitHub Container Registry | Registre d'images |
| Dokploy | Plateforme de déploiement sur VPS, pilotée aussi via son API |
| Traefik | Entrée HTTPS et certificats Let's Encrypt |
| Uptime Kuma | Supervision (conteneur en place, moniteurs pas encore configurés) |

---

## 10. Documentation interne

| Besoin | Document |
|---|---|
| Contrat d'un service avant de coder | [knowledge-base/api/](knowledge-base/api/) |
| Pourquoi une technologie a été retenue | [knowledge-base/adr/](knowledge-base/adr/) |
| Lancer le projet en local | [runbooks/lancer-en-local.md](knowledge-base/runbooks/lancer-en-local.md) |
| Installer le serveur | [runbooks/installer-vps-dokploy.md](knowledge-base/runbooks/installer-vps-dokploy.md) |
| Déployer ou revenir en arrière | [runbooks/deployer.md](knowledge-base/runbooks/deployer.md), [rollback.md](knowledge-base/runbooks/rollback.md) |
| Un conteneur ne démarre pas | [runbooks/depannage.md](knowledge-base/runbooks/depannage.md) |
| Qui fait quoi | [scrum/repartition-taches.md](knowledge-base/scrum/repartition-taches.md) |
| Règles de travail et état réel du dépôt | [AGENTS.md](AGENTS.md), section "État du dépôt" |

---

## 11. Auteurs

Équipe 7, Master 1 Intelligence Artificielle, Dakar Institute of Technology.

| Nom | Rôle |
|---|---|
| Cheikh Ahmed Tijani Traoré | Scrum Master, infrastructure, CI/CD, déploiement, documentation |
| Alpha Abdoulaye LANSAR | Développeur |
| Kassem Dehou Modeste | Développeur |
| Mamadou Seydou Soumountera | Développeur |
| BAH Thierno Madjou | Développeur |

La répartition détaillée figure dans
[knowledge-base/scrum/repartition-taches.md](knowledge-base/scrum/repartition-taches.md).

Projet réalisé dans le cadre de l'examen pratique DevOps, août 2026.
