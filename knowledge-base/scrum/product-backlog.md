# Product Backlog, EventHub

Chaque ligne devient une issue GitHub étiquetée `user-story`. Estimation en points,
suite de Fibonacci : 1, 2, 3, 5, 8, 13.

Priorité : `P0` indispensable pour la note, `P1` attendu, `P2` bonus.

---

## Épopée 1 : Authentification

| ID | User story | Points | Priorité | Paire |
|---|---|---|---|---|
| US-01 | En tant que visiteur, je veux créer un compte afin d'accéder à la plateforme | 3 | P0 | A |
| US-02 | En tant qu'utilisateur, je veux me connecter afin de retrouver ma session | 3 | P0 | A |
| US-03 | En tant qu'utilisateur connecté, je veux consulter mon profil afin de vérifier mon rôle | 1 | P1 | A |
| US-04 | En tant que système, je veux vérifier les jetons dans les 4 services afin de protéger les routes sensibles | 3 | P0 | A |
| US-05 | En tant qu'utilisateur, je veux être redirigé vers la connexion quand ma session expire | 2 | P1 | B |

## Épopée 2 : Gestion des événements

| ID | User story | Points | Priorité | Paire |
|---|---|---|---|---|
| US-06 | En tant qu'organisateur, je veux créer un événement afin de le publier | 3 | P0 | A |
| US-07 | En tant qu'organisateur, je veux modifier un événement afin de corriger ses informations | 2 | P0 | A |
| US-08 | En tant qu'organisateur, je veux supprimer un événement afin de retirer une annonce | 1 | P0 | A |
| US-09 | En tant que visiteur, je veux lister les événements afin de choisir celui qui m'intéresse | 3 | P0 | A |
| US-10 | En tant que visiteur, je veux filtrer les événements par date et par lieu | 3 | P0 | A |
| US-11 | En tant que visiteur, je veux voir le détail d'un événement | 2 | P0 | A |
| US-12 | En tant que visiteur, je veux voir le nombre de places restantes avant de m'inscrire | 5 | P0 | A |
| US-13 | En tant qu'organisateur, je veux un formulaire de création d'événement | 3 | P0 | B |
| US-14 | En tant que visiteur, je veux une liste d'événements lisible avec les filtres | 5 | P0 | B |

## Épopée 3 : Gestion des participants

| ID | User story | Points | Priorité | Paire |
|---|---|---|---|---|
| US-15 | En tant que visiteur, je veux créer un profil participant | 3 | P0 | A |
| US-16 | En tant qu'organisateur, je veux modifier un profil participant | 2 | P0 | A |
| US-17 | En tant qu'organisateur, je veux supprimer un participant | 1 | P0 | A |
| US-18 | En tant qu'organisateur, je veux lister les participants | 2 | P0 | A |
| US-19 | En tant qu'organisateur, je veux rechercher un participant par email ou par nom | 3 | P0 | A |
| US-20 | En tant qu'organisateur, je veux un écran de gestion des participants | 3 | P0 | B |

## Épopée 4 : Inscriptions

| ID | User story | Points | Priorité | Paire |
|---|---|---|---|---|
| US-21 | En tant que participant, je veux m'inscrire à un événement | 8 | P0 | A |
| US-22 | En tant que système, je veux refuser une inscription si l'événement est complet | 5 | P0 | A |
| US-23 | En tant que système, je veux refuser une double inscription | 3 | P0 | A |
| US-24 | En tant que participant, je veux annuler mon inscription | 3 | P0 | A |
| US-25 | En tant qu'organisateur, je veux lister les inscrits à un événement | 3 | P0 | A |
| US-26 | En tant que participant, je veux voir mes inscriptions | 2 | P0 | A |
| US-27 | En tant qu'organisateur, je veux des statistiques d'inscription | 3 | P0 | A |
| US-28 | En tant que participant, je veux m'inscrire en un clic depuis le détail d'un événement | 3 | P0 | B |
| US-29 | En tant qu'organisateur, je veux un tableau de bord de statistiques | 5 | P1 | B |

## Épopée 5 : Conteneurisation

| ID | User story | Points | Priorité | Qui |
|---|---|---|---|---|
| US-30 | En tant que développeur, je veux un Dockerfile par service | 5 | P0 | SM |
| US-31 | En tant que développeur, je veux lancer toute la plateforme avec `docker compose up` | 8 | P0 | SM |
| US-32 | En tant qu'exploitant, je veux des volumes persistants pour les 4 bases | 2 | P0 | SM |
| US-33 | En tant qu'exploitant, je veux des healthchecks sur chaque conteneur | 3 | P0 | SM |
| US-34 | En tant qu'exploitant, je veux que les bases ne soient pas exposées publiquement | 2 | P1 | SM |

## Épopée 6 : CI/CD

| ID | User story | Points | Priorité | Qui |
|---|---|---|---|---|
| US-35 | En tant que développeur, je veux que les tests tournent à chaque push | 3 | P0 | SM |
| US-36 | En tant que développeur, je veux que le lint bloque une PR non conforme | 2 | P1 | SM |
| US-37 | En tant qu'exploitant, je veux que les images soient publiées sur GHCR | 5 | P0 | SM |
| US-38 | En tant qu'exploitant, je veux un déploiement automatique sur merge vers `main` | 5 | P0 | SM |
| US-39 | En tant qu'exploitant, je veux un scan de vulnérabilités des images | 3 | P2 | SM |
| US-40 | En tant qu'exploitant, je veux une analyse de sécurité du code | 3 | P2 | SM |

## Épopée 7 : Qualité

| ID | User story | Points | Priorité | Paire |
|---|---|---|---|---|
| US-41 | Tests unitaires Jest sur les 4 services | 8 | P0 | B |
| US-42 | Tests d'intégration Supertest sur toutes les routes | 8 | P1 | B |
| US-43 | Tests Vitest sur les composants Vue | 5 | P2 | B |
| US-44 | Test Playwright du parcours complet | 5 | P2 | B |
| US-45 | Couverture backend au-dessus de 60 pour cent avec badge | 3 | P1 | B |

## Épopée 8 : Livrables

| ID | User story | Points | Priorité | Qui |
|---|---|---|---|---|
| US-46 | README complet couvrant les 9 points du sujet | 5 | P0 | SM |
| US-47 | Rapport PDF couvrant les 8 sections du sujet | 8 | P0 | SM |
| US-48 | Diagramme d'architecture détaillé | 3 | P0 | SM |
| US-49 | Supervision par Uptime Kuma | 2 | P2 | SM |
| US-50 | Vidéo de démonstration de secours | 2 | P1 | SM |

---

## Total

| Priorité | Points |
|---|---|
| P0 | 129 |
| P1 | 21 |
| P2 | 20 |
| **Total** | **170** |

Le périmètre P0 est non négociable : il correspond exactement aux exigences du sujet.
Les P2 sautent en premier en cas de retard, dans l'ordre US-49, US-44, US-43, US-40,
US-39.
