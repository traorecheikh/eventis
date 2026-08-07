# EventHub

Plateforme de gestion d'événements en architecture microservices.

Examen pratique DevOps, Master 1 Intelligence Artificielle, Dakar Institute of
Technology. Équipe 7.

![CI](https://github.com/traorecheikh/eventis/actions/workflows/ci.yml/badge.svg)
![CD](https://github.com/traorecheikh/eventis/actions/workflows/cd.yml/badge.svg)

Application déployée : [https://eventis.xyz](https://eventis.xyz)

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

| Domaine | Fonctionnalités |
|---|---|
| Événements | Création, modification, suppression, listage avec filtres par date et par lieu, détail, vérification des places restantes |
| Participants | Création de compte, modification de profil, suppression, listage, recherche par email ou par nom |
| Inscriptions | Inscription à un événement, annulation, liste des inscrits d'un événement, liste des événements d'un participant, statistiques, détection des places disponibles avant inscription |
| Authentification | Inscription, connexion, jetons JWT, deux rôles, protection des routes sensibles |

---

## 2. Architecture

Quatre services backend indépendants, une interface web, une passerelle, quatre
bases de données.

```mermaid
graph TB
    U[Navigateur]
    T["Traefik<br/>TLS, eventis.xyz<br/>géré par Dokploy"]
    NG["nginx<br/>sert le build Vue<br/>proxifie /api/*"]

    AU["auth-service :3004"]
    EV["events-service :3001"]
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
    RE -.->|capacité| EV
    RE -.->|participant| PA
    EV -.->|nombre d'inscrits| RE
```

### Principes

- **Une base par service.** Quatre conteneurs PostgreSQL distincts. Aucun service ne
  lit la base d'un autre. Les échanges passent exclusivement par API REST.
- **Un seul point d'entrée.** Seul le conteneur `nginx` est exposé. Les quatre
  services et les quatre bases restent sur un réseau Docker privé, sans port publié
  sur l'hôte.
- **Authentification centralisée.** `auth-service` émet les jetons JWT, les trois
  autres services les vérifient localement avec un secret partagé.

Le détail figure dans
[knowledge-base/architecture/vue-ensemble.md](knowledge-base/architecture/vue-ensemble.md).

### Microservices

| Service | Port | Responsabilité |
|---|---|---|
| `auth-service` | 3004 | Comptes, connexion, émission et vérification des jetons |
| `events-service` | 3001 | Cycle de vie des événements, calcul des places restantes |
| `participants-service` | 3002 | Profils des participants, recherche |
| `registrations-service` | 3003 | Inscriptions, annulations, statistiques |

Le contrat complet de chaque service se trouve dans
[knowledge-base/api/](knowledge-base/api/).

---

## 3. Prérequis techniques

| Outil | Version minimale | Nécessaire pour |
|---|---|---|
| Docker Engine | 24 | Lancement conteneurisé |
| Docker Compose | v2 | Orchestration |
| Node.js | 24 | Lancement manuel |
| npm | 10 | Lancement manuel |
| PostgreSQL | 16 | Lancement manuel sans Docker |
| Git | 2.40 | Récupération du code |

Vérification :

```bash
docker --version && docker compose version && node --version && npm --version
```

---

## 4. Installation et lancement manuel

Sans Docker. Utile pour développer avec rechargement à chaud.

### 4.1 Récupérer le code

```bash
git clone https://github.com/traorecheikh/eventis.git
cd eventis
cp .env.example .env
```

Éditer `.env` et renseigner les mots de passe ainsi que le secret JWT :

```bash
openssl rand -base64 48    # valeur de JWT_SECRET
openssl rand -base64 24    # valeur de chaque mot de passe de base
```

### 4.2 Préparer les quatre bases

Avec un PostgreSQL local :

```bash
createdb auth && createdb events && createdb participants && createdb registrations
psql -d auth          -f auth-service/sql/schema.sql
psql -d events        -f events-service/sql/schema.sql
psql -d participants  -f participants-service/sql/schema.sql
psql -d registrations -f registrations-service/sql/schema.sql
```

Plus simple, les bases en conteneurs et les services en local :

```bash
docker compose up -d auth-db events-db participants-db registrations-db
```

### 4.3 Lancer les quatre services

Un terminal par service.

```bash
cd auth-service          && npm install && npm run dev    # port 3004
cd events-service        && npm install && npm run dev    # port 3001
cd participants-service  && npm install && npm run dev    # port 3002
cd registrations-service && npm install && npm run dev    # port 3003
```

### 4.4 Lancer l'interface

```bash
cd frontend && npm install && npm run dev                 # port 5173
```

L'application est disponible sur `http://localhost:5173`.

### 4.5 Vérifier

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

Chaque appel doit renvoyer `{"status":"ok", ...}`.

---

## 5. Instructions Docker

Chaque composant possède son propre `Dockerfile`.

### 5.1 Construire une image

```bash
docker build -t eventhub-auth          ./auth-service
docker build -t eventhub-events        ./events-service
docker build -t eventhub-participants  ./participants-service
docker build -t eventhub-registrations ./registrations-service
docker build -t eventhub-frontend      ./frontend
```

### 5.2 Lancer un service seul

```bash
docker network create eventhub-net

docker run -d --name events-db --network eventhub-net \
  -e POSTGRES_USER=events_user \
  -e POSTGRES_PASSWORD=motdepasse \
  -e POSTGRES_DB=events \
  -v events_data:/var/lib/postgresql/data \
  postgres:16-alpine

docker run -d --name events-service --network eventhub-net \
  -e DATABASE_URL=postgres://events_user:motdepasse@events-db:5432/events \
  -e JWT_SECRET=votre_secret \
  -e PORT=3001 \
  -p 3001:3001 \
  eventhub-events
```

### 5.3 Choix de conteneurisation

| Pratique | Mise en oeuvre |
|---|---|
| Image de base légère | `node:24-alpine` pour les services, `nginx:alpine` pour le frontend |
| Construction multi-étapes | Étape de dépendances puis étape d'exécution. Le frontend construit avec Node puis ne conserve que Nginx et les fichiers statiques. |
| Utilisateur non privilégié | `USER node`, les conteneurs ne tournent pas en root |
| Variables d'environnement | Aucune valeur en dur, toute la configuration est injectée |
| Sonde de santé | Directive `HEALTHCHECK` interrogeant `/health` |
| Contexte de build réduit | `.dockerignore` excluant `node_modules`, `.git` et les tests |
| Volumes persistants | Un volume nommé par base de données |

Détail dans
[knowledge-base/specs/dockerfile-type.md](knowledge-base/specs/dockerfile-type.md).

---

## 6. Instructions Docker Compose

Méthode recommandée. Une seule commande lance l'ensemble de la plateforme.

### 6.1 Démarrer

```bash
cp .env.example .env      # puis renseigner les valeurs
docker compose up -d
docker compose ps
```

Les dix conteneurs doivent afficher `(healthy)`. Le premier démarrage prend deux à
trois minutes, le temps de l'initialisation des bases.

| URL | Contenu |
|---|---|
| `http://localhost` | Interface web |
| `http://localhost/api/events` | API événements |
| `http://localhost/api/auth/docs` | Swagger auth-service |
| `http://localhost/api/events/docs` | Swagger events-service |
| `http://localhost/api/participants/docs` | Swagger participants-service |
| `http://localhost/api/registrations/docs` | Swagger registrations-service |

### 6.2 Commandes courantes

```bash
docker compose logs -f events-service     # suivre un service
docker compose restart events-service     # redémarrer
docker compose build events-service       # reconstruire après modification
docker compose down                       # arrêter, conserver les données
docker compose down -v                    # arrêter et détruire les volumes
```

### 6.3 Contenu de l'orchestration

| Élément | Détail |
|---|---|
| Services | 4 services Node, 4 PostgreSQL, 1 Nginx, 1 supervision |
| Réseaux | `frontend` et `backend`. Seul Nginx appartient aux deux. |
| Volumes | `auth_data`, `events_data`, `participants_data`, `registrations_data` |
| Sondes | Sur chaque conteneur, avec `depends_on: condition: service_healthy` |
| Redémarrage | `restart: unless-stopped` |
| Limites | Mémoire plafonnée par conteneur |

### 6.4 Jeu de données de démonstration

```bash
docker compose exec events-db psql -U events_user -d events -f /seed/events.sql
```

---

## 7. Pipeline GitHub Actions

Trois workflows dans `.github/workflows/`.

| Workflow | Déclenchement | Rôle |
|---|---|---|
| `ci.yml` | push et PR sur `develop` et `feature/*` | Lint, tests, build |
| `cd.yml` | push sur `main` | Chaîne complète jusqu'au déploiement |
| `security.yml` | PR et hebdomadaire | CodeQL, Semgrep, audit des dépendances |

### 7.1 Étapes du pipeline

| # | Étape | Contenu |
|---|---|---|
| 1 | Checkout | `actions/checkout@v4` |
| 2 | Setup | `actions/setup-node@v4`, Node 24, cache npm |
| 3 | Tests | Jest et Supertest sur les 4 services, Vitest sur le frontend, base PostgreSQL éphémère |
| 4 | Build | `npm ci` puis construction du bundle Vue |
| 5 | Docker Build | Construction des 5 images via `docker/build-push-action@v5` |
| 6 | Docker Push | Publication sur `ghcr.io` avec le `GITHUB_TOKEN` |
| 7 | Deploy | Appel du webhook Dokploy, puis vérification de `/api/events` |

### 7.2 Contrôles de qualité

| Contrôle | Outil | Effet |
|---|---|---|
| Style | ESLint et Prettier | Bloque la PR |
| Couverture | Jest, seuil à 60 pour cent | Bloque la PR |
| Vulnérabilités des images | Trivy | Signale, ne bloque pas |
| Vulnérabilités des dépendances | `npm audit` | Signale |
| Analyse statique | CodeQL et Semgrep | Signale |

### 7.3 Stratégie de branches

| Branche | Rôle |
|---|---|
| `main` | Production, déploiement automatique sur eventis.xyz |
| `develop` | Intégration continue, cible par défaut des PR |
| `feature/*` | Développement d'une fonctionnalité |

`main` et `develop` sont protégées : aucun push direct, une approbation obligatoire,
CI verte obligatoire.

### 7.4 Déploiement

Les images sont construites par GitHub Actions et publiées sur GHCR. Le VPS ne
construit rien : il télécharge des images prêtes. La dernière étape du workflow
appelle le webhook Dokploy, qui déclenche un `docker compose pull` suivi d'un
redéploiement.

Détail dans
[knowledge-base/specs/pipeline-ci-cd.md](knowledge-base/specs/pipeline-ci-cd.md).

---

## 8. Structure du projet

```
eventis/
├── auth-service/               service d'authentification
│   ├── src/
│   ├── tests/
│   ├── sql/schema.sql
│   ├── Dockerfile
│   └── package.json
├── events-service/             service des événements
├── participants-service/       service des participants
├── registrations-service/      service des inscriptions
├── frontend/                   interface Vue 3
│   ├── src/
│   ├── nginx.conf              passerelle et service des fichiers statiques
│   ├── Dockerfile
│   └── package.json
├── e2e/                        tests Playwright
├── seed/                       données de démonstration
├── .github/
│   ├── workflows/              ci.yml, cd.yml, security.yml
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── knowledge-base/             documentation interne
│   ├── adr/                    décisions d'architecture
│   ├── api/                    contrats des 4 services
│   ├── architecture/           diagrammes et modèles de données
│   ├── runbooks/               procédures d'exploitation
│   ├── scrum/                  pilotage du projet
│   └── specs/                  spécifications Docker et CI/CD
├── rapport/                    sources LaTeX du rapport
├── docker-compose.yml
├── .env.example
├── AGENTS.md                   règles de travail de l'équipe
├── CLAUDE.md                   lien symbolique vers AGENTS.md
└── README.md
```

---

## 9. Technologies utilisées

### Backend

| Technologie | Version | Rôle |
|---|---|---|
| Node.js | 24 LTS | Exécution |
| Express | 4 | Framework HTTP |
| PostgreSQL | 16 | Base de données relationnelle |
| node-postgres | 8 | Client PostgreSQL |
| jsonwebtoken | 9 | Émission et vérification des JWT |
| bcrypt | 5 | Hachage des mots de passe |
| swagger-jsdoc, swagger-ui-express | 6, 5 | Documentation d'API |

### Frontend

| Technologie | Version | Rôle |
|---|---|---|
| Vue.js | 3 | Framework d'interface |
| Vite | 5 | Outil de construction |
| Vue Router | 4 | Navigation |
| Pinia | 2 | Gestion d'état |
| Axios | 1 | Client HTTP |

### Tests

| Technologie | Rôle |
|---|---|
| Jest | Tests unitaires backend |
| Supertest | Tests d'intégration des routes |
| Vitest | Tests unitaires frontend |
| Playwright | Tests de bout en bout |

### Infrastructure

| Technologie | Rôle |
|---|---|
| Docker et Docker Compose | Conteneurisation et orchestration |
| Nginx | Service des fichiers statiques et passerelle |
| GitHub Actions | Intégration et livraison continues |
| GitHub Container Registry | Registre d'images |
| Dokploy | Plateforme de déploiement sur VPS |
| Traefik | Entrée HTTPS et certificats Let's Encrypt |
| Uptime Kuma | Supervision |
| Trivy, CodeQL, Semgrep | Analyse de sécurité |

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
| Règles de travail | [AGENTS.md](AGENTS.md) |

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
