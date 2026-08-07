# Répartition des tâches, Équipe 7

Document de référence du découpage du travail. Toute issue GitHub porte une
étiquette `resp:<personne>` qui renvoie à ce document.

## Principe de découpage : tranches verticales

Chaque développeur possède **un service backend et les écrans qui le consomment**.
Personne ne fait uniquement du backend ou uniquement du frontend.

| Qui | Service backend | Écrans frontend | Étiquette |
|---|---|---|---|
| **Alpha Abdoulaye LANSAR** | `auth-service` | Socle frontend, Connexion, Inscription | `resp:alpha` |
| **Kassem Dehou Modeste** | `events-service` | Liste, détail et création d'événement | `resp:kassem` |
| **Mamadou Seydou Soumountera** | `participants-service` | Gestion et recherche de participants | `resp:mamadou` |
| **BAH Thierno Madjou** | `registrations-service` | Inscription en un clic, mes inscriptions, tableau de bord | `resp:thierno` |
| **Cheikh Ahmed Tijani Traoré** | Aucun | Aucun | `resp:sm` |

### Pourquoi ce découpage

- Chaque membre traverse toute la chaîne : base de données, API REST, conteneur,
  interface. Devant un jury, personne ne se retrouve incapable d'expliquer une
  partie du système.
- Les frontières entre personnes coïncident avec les frontières entre
  microservices. Deux personnes se marchent rarement dessus dans le même fichier.
- Un retard sur un service ne bloque que ses propres écrans, pas toute l'interface.

### Le risque de ce découpage, et sa parade

Alpha porte le **socle frontend** dont dépendent les trois autres : configuration
Vite, Vue Router, store Pinia de session, client axios avec intercepteur, mise en
page commune. Tant que ce socle n'existe pas, les trois autres ne peuvent pas
brancher leurs pages.

**Parade.** Le socle est la toute première tâche du projet, planifiée le 06 août au
matin, avant même `auth-service`. Le Scrum Master vérifie sa livraison au standup du
07 août. En cas de retard, il le termine lui-même.

Second point : les contrats d'API sont figés dans `knowledge-base/api/` avant toute
ligne de code. Chacun développe ses écrans contre le contrat et un bouchon local,
sans attendre l'implémentation d'un voisin.

---

## Alpha Abdoulaye LANSAR

| Bloc | Contenu |
|---|---|
| Backend | `auth-service` : inscription, connexion, `/me`, `/verify`, hachage bcrypt, émission et vérification JWT |
| Transverse backend | Middleware `requireAuth` et `requireRole`, à fournir aux trois autres pour duplication dans leurs services |
| Socle frontend | Projet Vite, Vue Router avec garde d'authentification, store Pinia de session, client axios avec intercepteur `401`, mise en page commune |
| Écrans | Connexion, création de compte |
| Tests | Vitest sur les composants et les stores, Playwright sur le parcours de bout en bout |

Issues : US-01 à US-05, US-43, US-44.

**Priorité absolue du 06 août : le socle frontend.** Les trois autres en dépendent.

---

## Kassem Dehou Modeste

| Bloc | Contenu |
|---|---|
| Backend | `events-service` : CRUD, filtres par date et par lieu, pagination, route `/availability` appelant `registrations-service` |
| Base | Table `events`, index sur `date` et sur `location` |
| Écrans | Liste des événements avec filtres, détail d'un événement, formulaire de création et d'édition |
| Tests | Jest et Supertest sur `events-service` |

Issues : US-06 à US-14.

Point délicat : `/availability` interroge `registrations-service`, qui interroge
lui-même `events-service`. Timeout strict de 3 secondes, et `503` si le service
amont ne répond pas. Jamais de valeur optimiste par défaut.

---

## Mamadou Seydou Soumountera

| Bloc | Contenu |
|---|---|
| Backend | `participants-service` : CRUD, recherche par email et par nom, unicité de l'email |
| Base | Table `participants`, contrainte `CHECK` sur `type`, index sur `LOWER(name)` |
| Écrans | Tableau de gestion des participants, champ de recherche |
| Tests | Jest et Supertest sur `participants-service` |

Issues : US-15 à US-20.

Point délicat : `GET /participants/:id` est appelé par `registrations-service` avant
chaque inscription. Ce point d'entrée doit rester rapide et stable.

---

## BAH Thierno Madjou

| Bloc | Contenu |
|---|---|
| Backend | `registrations-service` : inscription avec la séquence de vérification en 5 étapes, annulation logique, statistiques agrégées |
| Base | Table `registrations`, index unique partiel sur `(event_id, participant_id)` filtré sur `status = 'confirmee'` |
| Écrans | Bouton d'inscription sur le détail d'un événement, mes inscriptions, tableau de bord des statistiques |
| Tests | Jest et Supertest sur `registrations-service` |

Issues : US-21 à US-29.

C'est le service le plus complexe du projet : le seul qui appelle deux autres
services avant d'écrire en base. Il est planifié en dernier, une fois
`events-service` et `participants-service` joignables.

---

## Cheikh Ahmed Tijani Traoré, Scrum Master

| Bloc | Contenu |
|---|---|
| Conteneurisation | 5 Dockerfiles multi-étapes, `docker-compose.yml`, 2 réseaux, 4 volumes, healthchecks, limites mémoire |
| Passerelle | Configuration Nginx : service du build Vue et proxy des 4 préfixes `/api/*` |
| CI/CD | `ci.yml`, `cd.yml`, `security.yml`, publication sur GHCR, webhook Dokploy |
| Infrastructure | Achat et durcissement du VPS Contabo, installation de Dokploy, domaine `eventis.xyz`, TLS, Uptime Kuma |
| Documentation | `README.md`, base de connaissances, rapport LaTeX, diagrammes, vidéo de secours |
| Pilotage | Toutes les tâches listées dans `equipe.md`, section "Toutes les tâches du Scrum Master" |
| Revue | Relecture et approbation de **toutes** les Pull Requests |

Issues : US-30 à US-40, US-45 à US-50.

---

## Travail commun

| Issue | Contenu |
|---|---|
| US-41 | Tests unitaires Jest : chaque développeur couvre son propre service |
| US-42 | Tests d'intégration Supertest : chaque développeur couvre ses propres routes |

Règle : si un test révèle un écart entre le code et le contrat d'API, on ouvre une
issue étiquetée `bug` assignée au propriétaire du service. On ne corrige pas le
service d'un autre en silence, cela masquerait le problème au lieu de le tracer.

---

## Matrice RACI

R = Réalise, A = Approuve, C = Consulté, I = Informé.

| Activité | Alpha | Kassem | Mamadou | Thierno | Scrum Master |
|---|---|---|---|---|---|
| Contrats d'API | C | C | C | C | R, A |
| auth-service | R | I | I | I | A |
| events-service | I | R | I | C | A |
| participants-service | I | I | R | C | A |
| registrations-service | I | C | C | R | A |
| Socle frontend | R | C | C | C | A |
| Écrans métier | I | R | R | R | A |
| Tests unitaires et intégration | R | R | R | R | A |
| Tests Vitest et Playwright | R | I | I | I | A |
| Dockerfiles et compose | C | C | C | C | R, A |
| Pipeline CI/CD | I | I | I | I | R, A |
| VPS, Dokploy, domaine | I | I | I | I | R, A |
| README et rapport | C | C | C | C | R, A |
| Revue des PR | C | C | C | C | R, A |
| Board et cérémonies | I | I | I | I | R, A |

---

## Charge estimée

Sur 11 jours, du 06 au 17 août 2026.

| Qui | Points engagés | Commentaire |
|---|---|---|
| Alpha LANSAR | 22 | `auth-service` est petit, mais le socle frontend est structurant et bloquant |
| Kassem Modeste | 25 | Volume le plus régulier, sans dépendance forte |
| Mamadou Soumountera | 12 | Le plus léger. Renfort attendu sur les tests d'intégration. |
| Thierno BAH | 32 | Le service le plus complexe et trois écrans |
| Scrum Master | 62 | Infrastructure, CI/CD, documentation et pilotage |

L'écart entre Mamadou et Thierno est assumé : `registrations-service` concentre la
complexité métier. Si Thierno prend du retard au jour 5, Mamadou reprend les écrans
US-28 et US-29. Cette bascule est prévue et n'a pas à être renégociée en cours de
sprint.

Aucune personne ne peut absorber le retard d'une autre sur son propre service. Un
retard se traite en réduisant le périmètre des bonus P2, jamais en transférant du
travail vers quelqu'un qui ne connaît pas le contexte. Voir `risques.md`.
