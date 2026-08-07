# Base de connaissances, EventHub

Documentation interne de l'Équipe 7. Le `README.md` à la racine s'adresse à
l'extérieur, ce dossier s'adresse à l'équipe.

## Index

### Contrats d'API, à lire avant de coder

| Fichier | Contenu |
|---|---|
| [api/auth-service.md](api/auth-service.md) | Inscription, connexion, JWT, rôles, middleware partagé |
| [api/events-service.md](api/events-service.md) | CRUD événements, filtres, calcul des places restantes |
| [api/participants-service.md](api/participants-service.md) | CRUD participants, recherche par email et par nom |
| [api/registrations-service.md](api/registrations-service.md) | Inscription, annulation, statistiques |

Ces quatre fichiers sont **figés**. Les modifier exige une PR approuvée par le Scrum
Master. Ils permettent à chacun de développer ses écrans sans attendre le service
d'un voisin.

### Architecture

| Fichier | Contenu |
|---|---|
| [architecture/vue-ensemble.md](architecture/vue-ensemble.md) | Diagramme de déploiement, chaîne CI/CD, table des ports |
| [architecture/flux-inscription.md](architecture/flux-inscription.md) | Séquence complète et arbre des cas d'erreur |
| [architecture/modeles-donnees.md](architecture/modeles-donnees.md) | Schémas SQL des 4 bases, diagramme entités |

### Décisions d'architecture

| ADR | Sujet |
|---|---|
| [0001](adr/0001-node-express.md) | Node.js et Express |
| [0002](adr/0002-vue3-vite.md) | Vue 3 et Vite |
| [0003](adr/0003-postgres-une-base-par-service.md) | 4 conteneurs PostgreSQL |
| [0004](adr/0004-auth-service-jwt.md) | Quatrième service dédié à l'authentification |
| [0005](adr/0005-nginx-passerelle-unique.md) | Nginx unique, articulation avec Traefik |
| [0006](adr/0006-monorepo.md) | Monorepo |
| [0007](adr/0007-ghcr-et-tag-latest.md) | GHCR et tag `latest`, risque consigné |
| [0008](adr/0008-dokploy-webhook.md) | Déploiement par webhook |
| [0009](adr/0009-contabo-8go.md) | VPS Contabo et domaine |

### Spécifications techniques

| Fichier | Contenu |
|---|---|
| [specs/dockerfile-type.md](specs/dockerfile-type.md) | Modèles de Dockerfile multi-stage |
| [specs/docker-compose.md](specs/docker-compose.md) | Réseaux, volumes, healthchecks, limites |
| [specs/pipeline-ci-cd.md](specs/pipeline-ci-cd.md) | Les 7 étapes exigées, jobs de sécurité |

### Exploitation

| Runbook | Quand l'ouvrir |
|---|---|
| [lancer-en-local.md](runbooks/lancer-en-local.md) | Premier jour, ou après un `git pull` |
| [installer-vps-dokploy.md](runbooks/installer-vps-dokploy.md) | Une seule fois, mise en place du serveur |
| [deployer.md](runbooks/deployer.md) | À chaque livraison |
| [rollback.md](runbooks/rollback.md) | Quand la production est cassée |
| [depannage.md](runbooks/depannage.md) | Quand un conteneur refuse de démarrer |

### Pilotage

| Fichier | Contenu |
|---|---|
| [scrum/equipe.md](scrum/equipe.md) | Membres, paires, toutes les tâches du Scrum Master |
| [scrum/repartition-taches.md](scrum/repartition-taches.md) | Qui fait quoi, matrice RACI |
| [scrum/charte-equipe.md](scrum/charte-equipe.md) | Règles de fonctionnement |
| [scrum/definition-of-done.md](scrum/definition-of-done.md) | Critères de clôture d'une issue |
| [scrum/product-backlog.md](scrum/product-backlog.md) | 50 user stories estimées |
| [scrum/sprint-1-backlog.md](scrum/sprint-1-backlog.md) | Sprint 1, 06 au 11 août |
| [scrum/sprint-2-backlog.md](scrum/sprint-2-backlog.md) | Sprint 2, 11 au 17 août |
| [scrum/calendrier.md](scrum/calendrier.md) | Plan jour par jour |
| [scrum/risques.md](scrum/risques.md) | 8 risques, parades et plans de repli |
| [scrum/standups/](scrum/standups/) | Standups quotidiens |
| [scrum/retrospectives/](scrum/retrospectives/) | Rétrospectives de fin de sprint |

## Règles de rédaction

Elles sont détaillées dans `../AGENTS.md`. En résumé : français, aucun tiret
cadratin, aucun emoji, des tableaux plutôt que de longues listes.
