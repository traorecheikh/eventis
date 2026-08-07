# Équipe 7 : composition et rôles

Répartition issue du document officiel `RÉPARTITION ALÉATOIRE DES ÉQUIPES EXAMEN
DEVOOPS.docx`.

## Membres

| # | Nom complet | Rôle Scrum |
|---|---|---|
| 1 | Alpha Abdoulaye LANSAR | Développeur |
| 2 | Kassem Dehou Modeste | Développeur |
| 3 | **Cheikh Ahmed Tijani Traoré** | **Scrum Master** |
| 4 | Mamadou Seydou Soumountera | Développeur |
| 5 | BAH Thierno Madjou | Développeur |

## Paires de travail

> **À COMPLÉTER.** Le Scrum Master confirme la composition des paires avec les
> membres, puis remplace les placeholders ci-dessous dans ce seul fichier.
> Aucun autre document ne cite de nom de membre : tous renvoient ici.

| Paire | Membres | Périmètre |
|---|---|---|
| **Paire A** | `PAIRE_A_1`, `PAIRE_A_2` | Les 4 microservices backend |
| **Paire B** | `PAIRE_B_1`, `PAIRE_B_2` | Frontend Vue 3 et l'ensemble des tests |
| Transverse | Cheikh Ahmed Tijani Traoré | Infrastructure, CI/CD, documentation, pilotage |

Les quatre développeurs sont à l'aise avec Node et Git. Aucun accompagnement pas à
pas n'est prévu, seulement des contrats d'API figés et des conventions écrites.

## Toutes les tâches du Scrum Master

Cette section sert de référence pour l'évaluation et pour l'auto-contrôle
quotidien du Scrum Master.

### Avant chaque sprint

| Tâche | Livrable |
|---|---|
| Constituer et affiner le Product Backlog | `product-backlog.md` |
| Écrire les user stories au format standard | issues GitHub étiquetées `user-story` |
| Estimer la charge avec l'équipe (suite de Fibonacci) | champ Points sur chaque issue |
| Animer le Sprint Planning | `sprint-N-backlog.md` rempli et validé |
| Poser et faire valider la Definition of Done | `definition-of-done.md` |
| Créer et alimenter le board GitHub Projects | colonnes A faire / En cours / En revue / Termine |
| Figer les contrats d'API | `knowledge-base/api/*.md` |
| Préparer l'environnement (dépôt, branches, protections, CI) | dépôt opérationnel jour 1 |

### Pendant le sprint

| Tâche | Rythme |
|---|---|
| Animer le daily standup de 15 minutes | quotidien, asynchrone |
| Recopier les standups dans le dépôt | quotidien, dans `standups/` |
| Tenir le board à jour | quotidien |
| Identifier et lever les blocages | en continu |
| Protéger l'équipe des changements de périmètre | en continu |
| Relire et approuver toutes les Pull Requests | sous 12 heures ouvrées |
| Faire respecter la Definition of Done avant toute fermeture d'issue | à chaque merge |
| Suivre l'avancement contre le calendrier | quotidien |
| Tenir à jour le registre des risques | à chaque nouveau risque identifié |
| Maintenir l'infrastructure et le pipeline | en continu |

### En fin de sprint

| Tâche | Livrable |
|---|---|
| Préparer et animer la démo interne | captures d'écran pour le rapport |
| Animer la rétrospective au format Start / Stop / Continue | `retrospectives/sprint-N.md` |
| Consigner les actions d'amélioration et les assigner | issues étiquetées `amelioration` |
| Alimenter la section "Difficultés rencontrées" du rapport | `rapport/` |
| Mesurer la vélocité réalisée | `sprint-N-backlog.md`, section bilan |

### Transverse sur toute la durée

| Tâche |
|---|
| Rédiger le `README.md`, livrable noté |
| Rédiger le rapport LaTeX et le compiler en PDF |
| Maintenir la base de connaissances |
| Acheter et configurer le VPS, installer Dokploy, acheter le domaine |
| Écrire les Dockerfiles, le `docker-compose.yml` et la configuration Nginx |
| Écrire les workflows GitHub Actions |
| Enregistrer la vidéo de démonstration de secours |
| Préparer et mener la soutenance |

## Canaux

| Canal | Usage |
|---|---|
| Groupe WhatsApp | Standups quotidiens, alertes de blocage |
| GitHub Issues | Toute tâche formelle, toute décision tracée |
| GitHub Projects | Vue kanban de l'avancement |
| Pull Requests | Toute revue de code |

Une décision prise sur WhatsApp qui n'est pas reportée dans une issue ou une ADR
n'existe pas.
