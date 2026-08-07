# Calendrier, du 06 au 17 août 2026

Fenêtre officielle de l'examen : 05 au 19 août 2026.
**Deadline interne de l'Équipe 7 : 17 août 2026**, soit deux jours de marge
volontaire avant la date officielle.

Onze jours ouvrés à partir d'aujourd'hui.

---

## Vue d'ensemble

| Sprint | Période | Objectif |
|---|---|---|
| Sprint 1 | 06 au 11 août | Application fonctionnelle en local, conteneurisée, déployée une première fois |
| Sprint 2 | 11 au 17 août | Bonus, sécurisation, documentation, livraison |

---

## Sprint 1

### Jeudi 06 août : fondations

| Qui | Tâches |
|---|---|
| Scrum Master | Sprint Planning 1. Créer le dépôt GitHub, les branches `main` et `develop`, les protections, les templates. Figer les 4 contrats d'API. Créer le board GitHub Projects et les issues du sprint. Commander le VPS Contabo et le domaine `eventis.xyz`. |
| Paire A | Prendre connaissance des contrats. Initialiser les 4 projets Node, structure de dossiers, `package.json`, connexion PostgreSQL, route `/health`. |
| Paire B | Initialiser le projet Vue 3 + Vite, Vue Router, Pinia, client axios. Monter le bouchon d'API à partir des exemples JSON des contrats. |

Fin de journée : chaque paire a poussé au moins une PR sur `develop`.

### Vendredi 07 août : squelettes qui tournent

| Qui | Tâches |
|---|---|
| Scrum Master | Installer Dokploy sur le VPS. Pointer le DNS de `eventis.xyz`. Écrire les 5 Dockerfiles et le premier `docker-compose.yml`. Objectif : `docker compose up` démarre les 10 conteneurs en local. |
| Paire A | `auth-service` complet : register, login, `/me`, bcrypt, JWT. C'est le prérequis de tout le reste. |
| Paire B | Pages de connexion et d'inscription branchées sur le bouchon. Garde de route. Store de session Pinia. |

### Samedi 08 et dimanche 09 août : le coeur métier

| Qui | Tâches |
|---|---|
| Scrum Master | Premier workflow GitHub Actions : lint, tests, build. Configuration Nginx. Revue continue des PR. |
| Paire A | `events-service` et `participants-service` complets : CRUD, filtres, recherche, Swagger. |
| Paire B | Liste et détail des événements, formulaire de création, liste des participants. Premiers tests Jest et Supertest sur ce que la Paire A a livré. |

### Lundi 10 août : premier déploiement

| Qui | Tâches |
|---|---|
| Scrum Master | Compléter le pipeline : build des images, push vers GHCR, appel du webhook Dokploy. **Objectif du jour : `https://eventis.xyz` répond.** |
| Paire A | `registrations-service` : séquence de vérification en 5 étapes, annulation logique, statistiques. Route `/events/:id/availability` côté events-service. |
| Paire B | Écran d'inscription à un événement, mes inscriptions, tableau de bord. Tests d'intégration sur les routes livrées. |

### Mardi 11 août : clôture du Sprint 1

| Horaire | Activité |
|---|---|
| Matin | Finalisation, stabilisation, correction des tests rouges |
| Après-midi | Démo interne sur l'environnement déployé. Captures d'écran pour le rapport. |
| Après-midi | **Rétrospective 1** au format Start / Stop / Continue |
| Fin de journée | **Sprint Planning 2** |

Critère de succès du Sprint 1 : les 4 services répondent, le frontend affiche des
données réelles, l'application est joignable en HTTPS sur `eventis.xyz`.

---

## Sprint 2

### Mercredi 12 au vendredi 14 août : bonus et solidité

| Qui | Tâches |
|---|---|
| Scrum Master | Jobs Trivy, `npm audit`, CodeQL, Semgrep. Conteneur Uptime Kuma. Limites mémoire et healthchecks affinés. Rédaction du README. Diagrammes Mermaid et export PNG. |
| Paire A | Appels inter-services fiabilisés : timeouts, réessai unique, journalisation. Swagger complet sur les 4 services. Correction des bugs remontés par la Paire B. |
| Paire B | Playwright bout en bout sur le parcours complet. Vitest sur les composants. Montée de la couverture au-dessus de 60 pour cent. Finition visuelle des écrans. |

### Samedi 15 août : gel du code

Aucune nouvelle fonctionnalité après ce jour. Uniquement des corrections de bugs
bloquants.

| Qui | Tâches |
|---|---|
| Tous | Chasse aux bugs sur l'environnement déployé |
| Scrum Master | Rédaction du rapport LaTeX, sections 1 à 8. Intégration des captures d'écran et des diagrammes. |

### Dimanche 16 août : filet de sécurité

| Qui | Tâches |
|---|---|
| Scrum Master | Enregistrement de la vidéo de démonstration de secours. Compilation du PDF. Vérification finale du dépôt : `grep -rn "—"`, absence de secrets, README complet. |
| Tous | Relecture croisée du rapport. Répétition de la soutenance. |
| Tous | **Rétrospective 2** |

### Lundi 17 août : livraison

| Horaire | Activité |
|---|---|
| Matin | Merge final de `develop` vers `main`, déploiement de production vérifié |
| Matin | Dernière vérification des 3 livrables : dépôt GitHub, rapport PDF, README |
| Journée | **Remise** |

---

## Jalons critiques

Un retard sur l'un de ces jalons déclenche une réduction de périmètre décidée par le
Scrum Master le jour même.

| Date | Jalon | Si non tenu |
|---|---|---|
| 06 août | Contrats d'API figés | La Paire B est bloquée. Priorité absolue. |
| 07 août | `docker compose up` fonctionne en local | Repousser les bonus, se concentrer sur la conteneurisation. |
| 10 août | Application joignable en HTTPS | Abandonner Uptime Kuma et CodeQL, garder Trivy. |
| 15 août | Gel du code | Abandonner Playwright, garder Jest et Supertest. |
| 16 août | Rapport PDF compilé | Passer une nuit dessus. Ce livrable est noté. |

---

## Cérémonies

| Cérémonie | Quand | Durée | Trace |
|---|---|---|---|
| Daily standup | Chaque matin, asynchrone sur WhatsApp | 15 min | `standups/AAAA-MM-JJ.md` |
| Sprint Planning 1 | 06 août | 1 h | `sprint-1-backlog.md` |
| Sprint Planning 2 | 11 août | 45 min | `sprint-2-backlog.md` |
| Rétrospective 1 | 11 août | 30 min | `retrospectives/sprint-1.md` |
| Rétrospective 2 | 16 août | 30 min | `retrospectives/sprint-2.md` |

L'équipe a décidé de ne pas tenir de Sprint Review formelle distincte : la démo
interne du 11 août en tient lieu, et la soutenance joue le rôle de revue finale.
