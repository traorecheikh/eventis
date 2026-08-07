# Répartition des tâches, Équipe 7

Document de référence du découpage du travail. Les noms des paires se trouvent dans
`equipe.md` et nulle part ailleurs.

## Principe de découpage

Deux paires, un électron libre.

| Entité | Périmètre | Justification |
|---|---|---|
| **Paire A** | Les 4 microservices backend | Le backend est un tout cohérent : les quatre services partagent le même middleware d'authentification, la même enveloppe d'erreur, la même convention de mapping base vers API. Une seule paire garantit cette cohérence. |
| **Paire B** | Frontend Vue 3 et l'ensemble des tests | La paire qui écrit les tests est celle qui consomme les API. Elle détecte les écarts entre le contrat et l'implémentation, ce qui en fait un contre-pouvoir utile face à la Paire A. |
| **Scrum Master** | Infrastructure, CI/CD, documentation, pilotage | La partie la plus lourdement notée dans un examen DevOps reste sous contrôle direct. |

### Le risque de ce découpage, et sa parade

La Paire B est structurellement bloquée tant que la Paire A n'a pas livré. C'est le
défaut principal de ce modèle, et il est assumé.

**Parade appliquée dès le jour 1 :** les quatre contrats d'API sont figés avant
toute ligne de code, dans `knowledge-base/api/`. Ils contiennent les routes, les
codes de retour, les exemples JSON complets de requête et de réponse. La Paire B
développe contre un bouchon alimenté par ces exemples et branche les vraies URL plus
tard. Elle n'attend personne.

Le Scrum Master vérifie chaque jour, au standup, que la Paire B n'est pas en attente.
Si elle l'est, c'est un blocage à traiter le jour même.

---

## Paire A : les 4 microservices backend

### Livrables

| Service | Contenu |
|---|---|
| `events-service` | CRUD complet, filtres par date et lieu, route `/availability` qui appelle registrations-service |
| `participants-service` | CRUD complet, recherche par email et par nom, contrainte d'unicité sur l'email |
| `registrations-service` | Inscription avec la séquence de vérification en 5 étapes, annulation logique, statistiques agrégées |
| `auth-service` | Inscription, connexion, `/me`, hachage bcrypt, émission et vérification JWT |

### Transverse à la Paire A

- Middleware `requireAuth` et `requireRole`, dupliqué à l'identique dans les 4 services.
- Enveloppe d'erreur commune : `{ error, message, details }`.
- Route `GET /health` dans chaque service, avec vérification de la connexion PostgreSQL.
- Annotations `swagger-jsdoc` sur chaque route, exposées sur `/docs`.
- Scripts SQL de création de schéma et de données de démonstration.

### Ordre de travail imposé

L'ordre n'est pas libre : `registrations-service` dépend des deux autres.

1. `auth-service` en premier. Sans lui, aucune route protégée n'est testable.
2. `events-service` et `participants-service` en parallèle au sein de la paire.
3. `registrations-service` en dernier, une fois ses deux dépendances joignables.

### Ce que la Paire A ne fait pas

Elle n'écrit ni les Dockerfiles, ni les tests. Elle fournit un service qui démarre
avec `npm start` et une variable `DATABASE_URL`. Le reste est pris en charge par le
Scrum Master et la Paire B.

---

## Paire B : frontend et tests

### Frontend Vue 3

| Écran | Contenu |
|---|---|
| Connexion et inscription | Formulaires, appel à auth-service, stockage du jeton |
| Liste des événements | Cartes, filtres par date et par lieu, pagination, badge de places restantes |
| Détail d'un événement | Informations complètes, bouton d'inscription, liste des inscrits pour un organisateur |
| Création et édition d'événement | Formulaire réservé au rôle organisateur |
| Liste des participants | Tableau, recherche par nom ou email |
| Mes inscriptions | Événements du participant connecté, bouton d'annulation |
| Tableau de bord | Statistiques globales, exigence du sujet |

Technique : Vue Router avec garde d'authentification, Pinia pour l'état de session,
client axios centralisé avec intercepteur qui injecte le jeton et redirige vers la
page de connexion sur `401`.

### Tests

| Type | Outil | Portée |
|---|---|---|
| Unitaires backend | Jest | Logique métier : calcul de places restantes, validation d'email, séquence de vérification d'inscription, signature et vérification JWT |
| Intégration backend | Supertest | Chaque route de chaque service, tous les codes de retour documentés dans les contrats |
| Unitaires frontend | Vitest | Composants et stores Pinia |
| Bout en bout | Playwright | Parcours complet : inscription d'un compte, connexion, création d'un événement, inscription à cet événement, vérification de la décrémentation des places |

Le seuil de couverture est fixé à 60 pour cent de lignes sur le backend. En dessous,
la CI échoue.

### Ce que la Paire B ne fait pas

Elle n'écrit pas le code métier des services. Si un test révèle un écart avec le
contrat d'API, elle ouvre une issue étiquetée `bug` assignée à la Paire A. Elle ne
corrige pas le backend elle-même : cela masquerait le problème au lieu de le tracer.

---

## Scrum Master : infrastructure et pilotage

### Infrastructure

| Élément | Détail |
|---|---|
| Dockerfiles | 5 fichiers : 4 services Node en multi-stage sur `node:24-alpine`, 1 frontend en build Vite puis nginx |
| `docker-compose.yml` | 10 services, 2 réseaux, 4 volumes nommés, healthcheck partout, limites mémoire |
| Passerelle Nginx | Sert le build Vue, proxifie les 4 préfixes `/api/*`, en-têtes de sécurité |
| VPS | Achat Contabo VPS S, durcissement SSH, pare-feu, installation Dokploy |
| Domaine | Achat de `eventis.xyz`, enregistrements DNS, TLS Let's Encrypt via Traefik |
| Monitoring | Conteneur Uptime Kuma, sondes sur les 5 routes `/health` |

### CI/CD

Sept étapes exigées par le sujet, détaillées dans `../specs/pipeline-ci-cd.md` :
checkout, setup Node, tests, build, build des images Docker, push vers GHCR, deploy
via le webhook Dokploy. S'y ajoutent les jobs lint, Trivy, `npm audit`, CodeQL et
Semgrep.

### Pilotage

Toutes les tâches listées dans `equipe.md`, section "Toutes les tâches du Scrum Master".

### Documentation

`README.md`, base de connaissances complète, rapport LaTeX, diagrammes, vidéo de
démonstration de secours.

---

## Matrice RACI

R = Réalise, A = Approuve, C = Consulté, I = Informé.

| Activité | Paire A | Paire B | Scrum Master |
|---|---|---|---|
| Contrats d'API | C | C | R, A |
| Code des 4 services | R | C | A |
| Frontend Vue | I | R | A |
| Tests unitaires et intégration | C | R | A |
| Tests bout en bout | I | R | A |
| Dockerfiles | C | C | R, A |
| docker-compose | I | I | R, A |
| Pipeline CI/CD | I | C | R, A |
| VPS, Dokploy, domaine | I | I | R, A |
| README et rapport | C | C | R, A |
| Revue de toutes les PR | C | C | R, A |
| Board et cérémonies | I | I | R, A |

---

## Charge estimée

Sur 11 jours, du 06 au 17 août 2026.

| Entité | Estimation | Commentaire |
|---|---|---|
| Paire A | 4 services, environ 25 routes | Le plus gros volume de code |
| Paire B | 7 écrans + 4 suites de tests | Charge comparable, étalée différemment |
| Scrum Master | Infra + docs + pilotage | Charge continue, pics au jour 1, au jour 5 et au jour 10 |

Aucune entité ne peut absorber le retard d'une autre. Un retard se traite en
réduisant le périmètre des bonus, jamais en transférant du travail : voir
`risques.md`.
