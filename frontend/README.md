# EventHub, Frontend

Client web Vue 3 de la plateforme EventHub. Consomme les quatre microservices
backend (`auth-service`, `event-service`, `participants-service`,
`registrations-service`) via la passerelle Nginx. Voir le
[README racine](../README.md) et [AGENTS.md](../AGENTS.md) pour la vue
d'ensemble du depot.

## Fonctionnalites

- **Authentification** : inscription (role organisateur ou participant),
  connexion, deconnexion, session JWT restauree au demarrage, deconnexion
  automatique sur reponse 401.
- **Evenements** : liste paginee, detail, disponibilite en temps reel
  (places restantes), creation (organisateur).
- **Participants** : creation de profil (formulaire public), consultation et
  modification du profil.
- **Inscriptions** : inscription a un evenement (lie a un profil participant
  existant), annulation, liste "Mes inscriptions", refus explicite du
  surbooking (le backend refuse, l'interface l'affiche, jamais de succes
  simule).
- **Tableau de bord** : statistiques globales issues de
  `GET /registrations/stats` (inscriptions confirmees/annulees, evenements,
  participants), graphique des inscriptions par evenement.

Un compte auth-service n'est pas automatiquement lie a un profil
participants-service (deux bases separees, voir AGENTS.md section 2) : un
utilisateur avec le role participant doit creer son profil participant avant
de pouvoir s'inscrire a un evenement.

## Technologies

| Element | Technologie |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Bundler | Vite 8 |
| Etat | Pinia |
| Routage | Vue Router (history mode) |
| HTTP | Axios |
| Style | Tailwind CSS 4 |
| Composants accessibles | Reka UI (dialogues, ...) |
| Icones | lucide-vue-next |
| Notifications | vue-sonner |
| Transitions | @vueuse/motion |
| Tests unitaires | Vitest + @vue/test-utils + happy-dom |
| Tests bout en bout | Playwright |
| Client API genere | Orval, voir [ADR 0011](../knowledge-base/adr/0011-openapi-genere-orval.md) |

## Architecture

```text
View (Vue) -> Component -> Store Pinia (data/loading/error/success)
  -> Service API (auth/event/participant/registration) -> Axios (api.js)
  -> Passerelle Nginx -> microservice backend
```

Aucune donnee de repli locale : si un backend est indisponible ou renvoie une
erreur, le store expose `error` et l'interface l'affiche. Jamais de succes ou
de contenu fabrique pour masquer une panne (voir AGENTS.md : refuser plutot
que risquer une incoherence).

### Garde de routes

`router/index.js` protege `/dashboard` et `/registrations` (jeton JWT
requis). Le jeton est stocke dans `localStorage`, decode au demarrage pour
restaurer la session (`authStore.hydrateFromToken`) et supprime
automatiquement par l'intercepteur Axios sur une reponse 401.

## Structure

```text
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/          AppButton, AppModal (reka-ui Dialog), LoadingSpinner, ErrorMessage
│   │   ├── layout/           Navbar, Footer
│   │   ├── events/           EventCard, EventForm, EventFilter, EventList, EventDetails
│   │   ├── participants/     ParticipantForm, ParticipantCard
│   │   ├── registrations/    RegistrationCard
│   │   └── dashboard/        StatCard, RegistrationChart (SVG), EventStatistics
│   ├── layouts/               DefaultLayout (public), DashboardLayout (espace de gestion)
│   ├── router/index.js
│   ├── stores/                 authStore, eventStore, participantStore, registrationStore
│   ├── services/                api.js (Axios), token.js, authService, eventService,
│   │                              participantService, registrationService
│   ├── utils/registrationStatus.js
│   ├── style.css               point d'entree Tailwind, jetons de couleur (@theme)
│   ├── App.vue
│   └── main.js
├── tests/e2e/                  scenarios Playwright
├── orval.config.js             genere le client API depuis l'OpenAPI des 4 services
├── vite.config.js               Vite + Tailwind + configuration Vitest
└── package.json
```

Le frontend n'a pas de `Dockerfile` propre : il est construit et servi par
`gateway/Dockerfile` (ADR 0005), qui produit l'image Nginx unique contenant
le build Vue et proxifiant `/api/*`.

## Installation et lancement local

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173, proxy /api -> http://localhost:80
```

Le backend complet (les 4 microservices + passerelle) doit tourner en
parallele, voir `knowledge-base/runbooks/lancer-en-local.md` ou
`docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`
a la racine du depot.

## Tests

```bash
npm run lint          # ESLint
npm run test          # Vitest (unitaires)
npm run test:watch
npm run test:e2e       # Playwright, contre l'application reelle (voir tests/e2e)
npm run build
npm run preview
```

| Fichier | Couverture |
|---|---|
| `services/__tests__/token.test.js` | Decodage JWT, expiration |
| `services/__tests__/services.test.js` | authService, eventService, participantService, registrationService (contrats reels) |
| `stores/__tests__/stores.test.js` | Les 4 stores : succes, erreurs propagees, aucun repli local |
| `components/__tests__/components.test.js` | AppModal, LoadingSpinner, ErrorMessage, EventCard, EventForm, ParticipantForm |
| `router/__tests__/router.test.js` | Garde `requiresAuth`, redirection `/login?redirect=` |
| `tests/e2e/*.spec.js` | Parcours reels contre le backend (inscription, connexion, creation d'evenement, inscription a un evenement, annulation) |

## Client API genere (Orval)

Conformement a l'[ADR 0011](../knowledge-base/adr/0011-openapi-genere-orval.md),
`npm run generate:api` regenere l'OpenAPI des 4 services puis le client Orval
dans `src/api/generated/` (gitignore, jamais commite). Les services
`src/services/*.js` de ce frontend restent ecrits a la main : ils encapsulent
la normalisation des payloads (ex. `mapEventPayload`) et l'instance Axios
partagee (intercepteurs JWT/401), un besoin que le client genere seul ne
couvre pas.

## Variables d'environnement

| Variable | Lue | Role |
|---|---|---|
| `VITE_API_BASE_URL` | A la construction (`npm run build`) | URL de l'API vue du navigateur. `/api` en local (proxy Vite) comme en production (passerelle Nginx) |

Voir `.env.example`.
