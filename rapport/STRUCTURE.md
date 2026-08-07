# Structure du rapport PDF

Le sujet impose huit sections, page 5. Ce document en fixe le plan, la source de
chaque contenu et le responsable.

Production : LaTeX, compilé avec `latexmk -pdf rapport-eventhub.tex`.
Rendu final : `rapport/rapport-eventhub.pdf`.

**Règles de rédaction : français, aucun tiret cadratin, aucun emoji.**

---

## Plan

### Page de garde

Titre, sous-titre, logo DIT, noms des cinq membres, mention du rôle de Scrum Master,
date, mention de l'examen.

### Table des matières

Générée automatiquement.

---

### 1. Introduction, présentation du projet EventHub

| Élément | Source |
|---|---|
| Contexte du DIT et problèmes actuels | Sujet, page 1 |
| Objectifs de la plateforme | Sujet, page 1 |
| Périmètre retenu par l'équipe | `knowledge-base/scrum/product-backlog.md` |
| Composition de l'équipe et organisation | `knowledge-base/scrum/equipe.md` |

Longueur visée : 1 à 2 pages.

---

### 2. Architecture, diagramme d'architecture détaillé

| Élément | Source |
|---|---|
| Diagramme de déploiement | `knowledge-base/architecture/vue-ensemble.md`, exporté en PNG |
| Justification du découpage en 4 services | ADR 0004 |
| Justification de 4 bases distinctes | ADR 0003 |
| Rôle de Nginx et articulation avec Traefik | ADR 0005 |
| Table des ports et exposition réseau | `vue-ensemble.md` |
| Diagramme de séquence de l'inscription | `flux-inscription.md`, exporté en PNG |

Point à mettre en avant : un seul conteneur exposé, quatre bases isolées, aucune clé
étrangère traversant une frontière de service.

Longueur visée : 3 à 4 pages, diagrammes compris.

---

### 3. Description des microservices, endpoints et modèles de données

Une sous-section par service. Pour chacun : responsabilité, tableau des routes avec
verbe, chemin, codes de retour, et schéma SQL de la table.

| Sous-section | Source |
|---|---|
| 3.1 auth-service | `knowledge-base/api/auth-service.md` |
| 3.2 events-service | `knowledge-base/api/events-service.md` |
| 3.3 participants-service | `knowledge-base/api/participants-service.md` |
| 3.4 registrations-service | `knowledge-base/api/registrations-service.md` |
| 3.5 Modèle de données global | `architecture/modeles-donnees.md`, diagramme entités |
| 3.6 Communication inter-services | `flux-inscription.md` |

Longueur visée : 5 à 6 pages.

---

### 4. Dockerisation, explication des Dockerfile et choix effectués

| Élément | Source |
|---|---|
| Modèle de Dockerfile des services Node, commenté ligne à ligne | `specs/dockerfile-type.md` |
| Dockerfile du frontend et intérêt du multi-étapes | `specs/dockerfile-type.md` |
| Tableau des bonnes pratiques du sujet et de leur mise en oeuvre | `specs/dockerfile-type.md` |
| Comparaison de taille d'image avec et sans multi-étapes | à mesurer avec `docker images` |
| Orchestration : réseaux, volumes, sondes, limites | `specs/docker-compose.md` |
| Capture de `docker compose ps` montrant les 10 conteneurs sains | à produire |

Longueur visée : 3 à 4 pages.

---

### 5. CI/CD avec GitHub Actions, description du pipeline et actions utilisées

| Élément | Source |
|---|---|
| Tableau des 7 étapes exigées et de leur mise en oeuvre | `specs/pipeline-ci-cd.md` |
| Schéma de la chaîne CI/CD | `vue-ensemble.md`, exporté en PNG |
| Liste des actions tierces utilisées et de leur rôle | `specs/pipeline-ci-cd.md` |
| Stratégie de branches et protections | `AGENTS.md` |
| Choix de GHCR plutôt que Docker Hub | ADR 0007 |
| Choix du webhook Dokploy | ADR 0008 |
| Capture d'une exécution verte du workflow | à produire |
| Capture des 5 images publiées sur GHCR | à produire |

Longueur visée : 3 à 4 pages.

---

### 6. Interface frontend, captures d'écran et fonctionnalités

Une capture par écran, accompagnée d'une description de deux ou trois lignes.

| Écran | Capture |
|---|---|
| Connexion et inscription | à produire |
| Liste des événements avec filtres | à produire |
| Détail d'un événement, places restantes | à produire |
| Formulaire de création d'événement | à produire |
| Liste et recherche de participants | à produire |
| Mes inscriptions | à produire |
| Tableau de bord des statistiques | à produire |
| Swagger UI d'un service | à produire |

**Captures à prendre le 11 août, lors de la démonstration de fin de Sprint 1.**
Ne pas attendre le 16 août.

Longueur visée : 4 à 5 pages.

---

### 7. Difficultés rencontrées et solutions apportées

Cette section se remplit à partir des rétrospectives, pas de mémoire.

| Source | Contenu |
|---|---|
| `scrum/retrospectives/sprint-1.md` | Section "Difficultés rencontrées" |
| `scrum/retrospectives/sprint-2.md` | Section "Difficultés rencontrées" |
| `scrum/risques.md` | Risques qui se sont matérialisés et parades appliquées |

Format retenu, un tableau puis un paragraphe par difficulté majeure :

| Difficulté | Symptôme observé | Solution appliquée | Temps perdu |
|---|---|---|---|

Difficultés déjà prévisibles à documenter le cas échéant : dépendance de la Paire B
au backend, délai de mise à disposition du VPS, absence de tag versionné empêchant
un retour arrière rapide, concurrence sur la dernière place d'un événement.

Longueur visée : 2 à 3 pages.

---

### 8. Améliorations possibles

| Piste | Justification de son absence |
|---|---|
| Tag d'image versionné par SHA | Retour arrière immédiat, une ligne de YAML. Voir R-03. |
| Verrou transactionnel sur la capacité | Empêcherait le dépassement en forte concurrence. Voir R-06. |
| Jeton de rafraîchissement | Sessions plus longues sans réduire la sécurité. |
| Messagerie asynchrone, RabbitMQ | Notifications par courriel, découplage des services. |
| TypeScript sur le backend | Sûreté de typage sur 4 services. Coût de configuration non absorbable en 11 jours. |
| Prometheus et Grafana | Observabilité réelle au-delà d'Uptime Kuma. |
| Passage à Kubernetes | Mise à l'échelle horizontale, hors périmètre d'un examen. |
| Suppression en cascade entre services | Événement supprimé laissant des inscriptions orphelines. |

Longueur visée : 1 à 2 pages.

---

### Conclusion

Bilan de l'atteinte des objectifs pédagogiques du sujet, apports individuels,
enseignements retenus.

### Annexes

- Lien du dépôt GitHub
- URL de l'application déployée
- Extraits des fichiers de workflow
- Liste complète des points d'entrée de l'API

---

## Répartition de la rédaction

| Section | Responsable | Échéance |
|---|---|---|
| 1, 2 | Scrum Master | 15 août |
| 3 | Scrum Master, à partir des contrats d'API | 15 août |
| 4, 5 | Scrum Master | 15 août |
| 6 | Paire B fournit les captures, Scrum Master rédige | captures le 11 août |
| 7 | Scrum Master, à partir des rétrospectives | 16 août |
| 8 | Toute l'équipe en rétrospective 2 | 16 août |
| Relecture croisée | Les 5 membres | 16 août |
| Compilation finale | Scrum Master | 16 août |

## Squelette LaTeX à créer

```
rapport/
├── rapport-eventhub.tex        document maître
├── preambule.tex               paquets, mise en page, style des tableaux
├── sections/
│   ├── 01-introduction.tex
│   ├── 02-architecture.tex
│   ├── 03-microservices.tex
│   ├── 04-dockerisation.tex
│   ├── 05-cicd.tex
│   ├── 06-frontend.tex
│   ├── 07-difficultes.tex
│   ├── 08-ameliorations.tex
│   └── 09-conclusion.tex
├── images/                     captures et diagrammes exportés en PNG
└── Makefile                    cible: latexmk -pdf
```

## Contrôle avant remise

- [ ] Les 8 sections exigées sont présentes et dans l'ordre
- [ ] Le diagramme d'architecture est détaillé et lisible en pleine page
- [ ] Chaque capture d'écran est légendée et numérotée
- [ ] Aucun tiret cadratin, aucun emoji
- [ ] Les cinq auteurs sont cités sur la page de garde
- [ ] Le lien du dépôt et l'URL de l'application figurent en annexe
- [ ] Le PDF est compilé et ouvert une dernière fois pour vérification
