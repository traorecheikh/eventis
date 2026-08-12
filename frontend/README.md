# EventHub — Frontend

**EventHub** est une application web de **gestion d'événements** conçue selon une architecture multi-microservices. Ce dépôt, `frontend/`, contient le client web : une application **Vue 3** construite avec **Vite**, qui consomme les API REST des microservices backend (auth, events, participants, registrations).

Le frontend a été développé par phases successives (1 à 9) : initialisation, navigation, composants et design system, gestion d'état Pinia, intégration des services API, fonctionnalités métier, tests automatisés et containerisation Docker de production.

## Présentation des fonctionnalités

L'application couvre quatre domaines fonctionnels principaux. Les **événements** peuvent être listés, recherchés, filtrés par catégorie, consultés en détail, créés, modifiés et supprimés par les organisateurs (mode administration via `?admin=1`). Les **inscriptions** permettent à un participant connecté de s'inscrire à un événement (formulaire prérempli depuis sa session), d'annuler son inscription et de consulter la liste de ses inscriptions. Les **participants** disposent d'une page de profil. Le **tableau de bord** agrège les statistiques calculées à partir des données réelles de l'API (événements actifs, inscrits, places restantes, taux de remplissage, inscriptions mensuelles). L'**authentification** est gérée par jeton JWT : connexion, inscription, déconnexion, hydratation de session au démarrage, routes protégées et gestion des sessions expirées (HTTP 401).

## Technologies

| Élément | Technologie |
| --- | --- |
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Bundler | Vite 6 |
| Langage | JavaScript (ES Modules) |
| État | Pinia |
| Routing | Vue Router (history mode) |
| HTTP | Axios |
| Tests unitaires | Vitest 4 + @vue/test-utils + happy-dom |
| Tests E2E | Playwright (Chromium) |
| Conteneurisation | Docker multi-stage (Node 24 Alpine → Nginx 1.27 Alpine) |

## Architecture

L'application suit strictement la chaîne de responsabilité suivante : aucun composant ne connaît Axios, aucun composant ne connaît les URLs d'API, et la logique d'état n'est jamais dupliquée dans les vues.

```text
View (Vue)
  ↓
Component (réutilisable)
  ↓
Pinia Store (état : data / loading / error / success)
  ↓
Service API (auth, event, participant, registration)
  ↓
Axios (instance api.js : baseURL, intercepteurs 401)
  ↓
Backend (microservices REST)
```

Le store `eventStore` illustre ce flux pour les événements : la vue `EventsView` délègue au composant `EventList`, qui invoque `eventStore.fetchEvents()` ; le store appelle `eventService.getEvents()`, qui utilise l'instance Axios configurée par `api.js`, qui joint `/api/events`.

### Garde de routes et JWT

Un garde global Vue Router protège `/dashboard` et `/registrations` : sans token valide, redirection vers `/login?redirect=...`. Le jeton JWT est stocké en `localStorage` (clé `eventhub_token`), décodé au démarrage pour hydrater la session (`authStore.hydrateFromToken()`), et supprimé automatiquement par l'intercepteur Axios en cas de réponse HTTP 401.

### Repli local (mode dégradé)

Si le backend est indisponible, les stores replient sur les données locales (`mockData.js`) pour ne jamais afficher une interface vide. Ce comportement est documenté et couvert par les tests.

## Arborescence du projet

```text
frontend/
├── public/                        # Fichiers statiques servis tels quels
├── src/
│   ├── assets/
│   │   ├── images/                # Images et données mockées (mockData.js)
│   │   ├── icons/                 # Icônes
│   │   └── styles/                # Système de design
│   │       ├── tokens.css         # Variables CSS (couleurs, espacements)
│   │       ├── utilities.css      # Boutons, formulaires, badges, cartes
│   │       └── main.css           # Point d'entrée des styles
│   ├── components/
│   │   ├── common/                # AppButton, AppModal, LoadingSpinner, ErrorMessage
│   │   ├── layout/                # Navbar, Footer
│   │   ├── events/                # EventCard, EventForm, EventFilter, EventList, EventDetails
│   │   ├── participants/          # ParticipantForm, ParticipantCard
│   │   ├── registrations/         # RegistrationForm, RegistrationCard
│   │   └── dashboard/             # StatCard, RegistrationChart (SVG), EventStatistics
│   ├── layouts/
│   │   ├── DefaultLayout.vue      # Pages publiques (header + footer)
│   │   └── DashboardLayout.vue    # Espace de gestion (sidebar)
│   ├── router/index.js            # Routes et garde de navigation
│   ├── stores/                    # Stores Pinia
│   │   ├── index.js               # Exporte les 4 stores
│   │   ├── authStore.js           # Utilisateur, connexion, déconnexion
│   │   ├── eventStore.js          # Événements et filtres
│   │   ├── participantStore.js    # Profils participants
│   │   └── registrationStore.js   # Inscriptions, création, annulation
│   ├── services/                  # Couche d'accès API (Axios)
│   │   ├── api.js                 # Instance Axios (baseURL, intercepteur 401)
│   │   ├── token.js               # Gestion JWT (localStorage, expiration)
│   │   ├── authService.js         # login, register, fetchCurrentUser, logout
│   │   ├── eventService.js        # getEvents, getEventById, createEvent, updateEvent, deleteEvent
│   │   ├── participantService.js  # getParticipants, getParticipantById
│   │   ├── registrationService.js # getRegistrations, createRegistration, cancelRegistration
│   │   └── registrationMapper.js  # Adaptation du payload d'inscription au format backend
│   ├── views/                     # Vues (pages)
│   │   ├── HomeView.vue           # /                      Accueil
│   │   ├── LoginView.vue          # /login                 Connexion
│   │   ├── RegisterView.vue       # /register              Création de compte
│   │   ├── EventsView.vue         # /events                Liste des événements
│   │   ├── EventDetailsView.vue   # /events/:id            Détails (+ édition/suppression admin)
│   │   ├── ParticipantProfileView.vue  # /participants/:id Profil participant
│   │   ├── RegistrationView.vue   # /events/:id/register   Inscription
│   │   ├── MyRegistrationsView.vue# /registrations         Mes inscriptions
│   │   ├── DashboardView.vue      # /dashboard             Tableau de bord
│   │   └── NotFoundView.vue       # 404                    Page introuvable
│   ├── App.vue                    # Composant racine
│   └── main.js                    # Point d'entrée (router + Pinia + hydratation)
├── tests/
│   └── e2e/app.spec.js            # Tests end-to-end Playwright (12 scénarios)
├── .env.example                   # Variables d'environnement de référence
├── .gitignore
├── index.html
├── nginx.conf                     # Configuration Nginx de production
├── entrypoint.sh                  # Substitution BACKEND_URL au démarrage du conteneur
├── docker-compose.yml             # Démo : frontend + backend mock
├── Dockerfile                     # Build multi-stage production
├── package.json
├── vite.config.js                 # Vite + configuration Vitest
└── README.md
```

## Installation et démarrage (développement)

```bash
code frontend            # Ouvrir dans Visual Studio Code
cd frontend
npm install              # Installation des dépendances
cp .env.example .env     # Copier les variables de référence
npm run dev              # Serveur de développement → http://localhost:3000
```

Le backend peut être le microservice réel ou le mock de démonstration fourni dans le dépôt parent (`mock-api/`) :

```bash
cd ../mock-api
npm install
npm start                # Backend mock → http://localhost:8080
```

## Tests

Deux suites de tests automatisés sont disponibles. Les tests **unitaires** (Vitest, 92 tests) couvrent les services, les stores, les composants et la garde de routes ; les tests **end-to-end** (Playwright, 12 scénarios) reproduisent les parcours réels dans Chromium contre le backend.

```bash
npm run test             # Tests unitaires Vitest (6 fichiers)
npm run test:watch       # Mode watch
npm run test:e2e         # Tests E2E Playwright (mock-api démarré automatiquement)
```

| Fichier de tests | Ce qui est testé |
| --- | --- |
| `services/__tests__/token.test.js` | Décodage JWT, expiration, durée de session |
| `services/__tests__/eventService.test.js` | Payload exact du backend (`name`, `eventDate`, `venue`, `maxCapacity`) |
| `services/__tests__/services.test.js` | `authService`, `registrationService`, `participantService`, `getCurrentUser` |
| `stores/__tests__/stores.test.js` | Les 4 stores (CRUD, filtres, repli local, connexion) |
| `components/__tests__/components.test.js` | EventForm (validation), RegistrationForm, AppModal (Échap, clic arrière-plan), EventCard |
| `router/__tests__/router.test.js` | Garde `requiresAuth`, redirection `/login?redirect=`, page 404 |
| `tests/e2e/app.spec.js` | 9 parcours métier + erreurs réseau, 401 et 404 |

Les erreurs HTTP attendues (400, 401, 403, 404, 422, 500 et erreurs réseau) sont couvertes par des mocks d'Axios dans les tests unitaires et par des scénarios dédiés en E2E (coupure réseau complète, session expirée).

## Build de production

```bash
npm run build     # Génère dist/ (SPA prête à servir)
npm run preview   # Prévisualisation locale du build
```

## Docker (production)

Le `Dockerfile` applique une stratégie **multi-stage** pour produire une image minimale :

| Étape | Image | Rôle |
| --- | --- | --- |
| Stage 1 `builder` | `node:24-alpine` | `npm ci` (dépendances), `npm run build` (Vite) |
| Stage 2 | `nginx:1.27-alpine` | Sert le build Vue, relaie `/api/*` vers le backend |

L'image finale pèse environ **75 Mo**. Le frontend appelle le backend en **relatif** (`/api/*`) : il ne contient **aucune référence aux noms de conteneurs** du backend. C'est Nginx, au démarrage, qui transmet ces appels à l'upstream défini par la variable `BACKEND_URL` (substituée par `entrypoint.sh` via `envsubst`).

```bash
# Construction
docker build -t eventhub-frontend .

# Exécution — backend accessible sur l'hôte
docker run -p 8080:80 \
  --add-host=host.docker.internal:host-gateway \
  -e BACKEND_URL=http://host.docker.internal:8080 \
  eventhub-frontend

# Exécution — backend dans un autre conteneur (réseau Docker)
docker run -p 8080:80 \
  -e BACKEND_URL=http://backend-service:8080 \
  eventhub-frontend

# Démonstration complète avec le backend mock (docker-compose.yml)
docker compose up --build     # → http://localhost:8080
```

La configuration Nginx (`nginx.conf`) sert la SPA (fallback `index.html` pour les routes Vue Router), active gzip, met en cache longue durée les assets fingerprintés et proxifie `/api/` avec les en-têtes `X-Forwarded-*` adaptés à un déploiement derrière un reverse-proxy supplémentaire.

## Variables d'environnement

```bash
cp .env.example .env
```

| Variable | Lecture | Rôle |
| --- | --- | --- |
| `VITE_API_BASE_URL` | À la construction (`npm run build` / `docker build`) | URL de l'API backend. En développement : `http://localhost:8080/api`. En production : `/api` (relayé par Nginx) |
| `VITE_API_VERSION` | À la construction | Version de l'API |
| `BACKEND_URL` | À l'exécution du conteneur (`-e`) | Cible du proxy Nginx pour `/api/*` |

Les variables `VITE_*` sont injectées dans le code lors du build : les modifier après la construction n'a aucun effet. En production, ne pas redéfinir `VITE_API_BASE_URL` (elle reste `/api`) : c'est `BACKEND_URL` qui oriente les appels vers le backend.

## API (endpoints utilisés)

Le frontend n'appelle **que** les endpoints réellement implémentés par le backend (aucun endpoint fictif). En l'absence de documentations Swagger/OpenAPI officielles fournies à ce stade, les endpoints suivants sont utilisés conformément au standard REST et devront être ajustés si la documentation officielle diffère.

| Méthode | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Connexion : `{ email, password }` → `{ token, user }` |
| `POST` | `/api/auth/register` | Création de compte → `{ token, user }` |
| `GET` | `/api/auth/me` | Profil de l'utilisateur connecté (Bearer requis) |
| `GET` | `/api/events` | Liste des événements (recherche/filtres côté client) |
| `GET` | `/api/events/:id` | Détail d'un événement |
| `POST` | `/api/events` | Création d'un événement |
| `PUT` | `/api/events/:id` | Modification d'un événement |
| `DELETE` | `/api/events/:id` | Suppression d'un événement |
| `GET` | `/api/participants` | Liste des participants |
| `GET` | `/api/participants/:id` | Profil d'un participant |
| `GET` | `/api/registrations` | Mes inscriptions (Bearer requis) |
| `POST` | `/api/registrations` | Créer une inscription (`{ eventId, participant: { fullName, email, phone, dietaryRequirements } }`) |
| `DELETE` | `/api/registrations/:id` | Annuler une inscription |

Le format exact attendu par le backend Events pour la création et la modification d'un événement :

```json
{
  "name": "Conférence IA",
  "eventDate": "2026-09-15",
  "venue": "Dakar",
  "maxCapacity": 100
}
```

Les champs `title`, `description`, `date`, `location` et `capacity` ne sont pas utilisés. Le compte de démonstration du mock backend est `marie.dupont@exemple.com` / `secret123`.

## Historique des phases

| Phase | Contenu | Statut |
| --- | --- | --- |
| 1 | Initialisation Vue 3 + Vite + Pinia + Router + Axios | Terminée |
| 2 | Router complet, layouts, 10 vues | Terminée |
| 3 | 15 composants réutilisables + design system (responsive, accessible) | Terminée |
| 4 | Stores Pinia (data/loading/error/success) | Terminée |
| 5 | Services API Events (Axios), format strict des champs | Terminée |
| 6 | Services auth/participants/registrations, JWT, garde de routes | Terminée |
| 7 | Fonctionnalités métier complètes (CRUD, inscriptions, dashboard, UX) | Terminée |
| 8 | Tests unitaires (92) et E2E Playwright (12), gestion des erreurs HTTP | Terminée |
| 9 | Dockerfile multi-stage production, Nginx, .env.example, documentation | Terminée |

## Lancement rapide

```bash
code frontend
cd frontend
npm install
npm run dev          # http://localhost:3000
npm run test         # 92 tests unitaires
npm run test:e2e     # 12 tests E2E
npm run build        # build de production (dist/)
docker build -t eventhub-frontend .
docker run -p 8080:80 -e BACKEND_URL=http://host.docker.internal:8080 --add-host=host.docker.internal:host-gateway eventhub-frontend
```
