# Sprint 1 Backlog

| Champ | Valeur |
|---|---|
| Période | 06 au 11 août 2026, 6 jours |
| Objectif | Une application complète, conteneurisée, joignable en HTTPS sur eventis.xyz |
| Capacité engagée | 116 points |

## Objectif de sprint

> À la fin du Sprint 1, un utilisateur peut se connecter sur `https://eventis.xyz`,
> consulter la liste des événements, s'inscrire à l'un d'eux, et voir le nombre de
> places restantes décrémenté. L'ensemble tourne dans des conteneurs Docker
> déployés automatiquement depuis `main`.

Un objectif de sprint se juge en une phrase : soit c'est vrai le 11 août au soir,
soit ça ne l'est pas.

---

## Contenu engagé

### Paire A, 4 microservices

| ID | Story | Points |
|---|---|---|
| US-01 | Créer un compte | 3 |
| US-02 | Se connecter | 3 |
| US-04 | Vérification des jetons dans les 4 services | 3 |
| US-06 | Créer un événement | 3 |
| US-07 | Modifier un événement | 2 |
| US-08 | Supprimer un événement | 1 |
| US-09 | Lister les événements | 3 |
| US-10 | Filtrer par date et lieu | 3 |
| US-11 | Détail d'un événement | 2 |
| US-12 | Places restantes | 5 |
| US-15 | Créer un participant | 3 |
| US-16 | Modifier un participant | 2 |
| US-17 | Supprimer un participant | 1 |
| US-18 | Lister les participants | 2 |
| US-19 | Recherche par email ou nom | 3 |
| US-21 | S'inscrire à un événement | 8 |
| US-22 | Refus si complet | 5 |
| US-23 | Refus de double inscription | 3 |
| US-24 | Annuler une inscription | 3 |
| US-25 | Lister les inscrits | 3 |
| US-26 | Voir ses inscriptions | 2 |
| US-27 | Statistiques d'inscription | 3 |
| | **Sous-total** | **66** |

### Paire B, frontend et premiers tests

| ID | Story | Points |
|---|---|---|
| US-13 | Formulaire de création d'événement | 3 |
| US-14 | Liste d'événements avec filtres | 5 |
| US-20 | Écran de gestion des participants | 3 |
| US-28 | Inscription en un clic | 3 |
| US-41 | Tests unitaires Jest sur les 4 services | 8 |
| | **Sous-total** | **22** |

### Scrum Master, infrastructure

| ID | Story | Points |
|---|---|---|
| US-30 | Un Dockerfile par service | 5 |
| US-31 | `docker compose up` lance la plateforme | 8 |
| US-32 | Volumes persistants | 2 |
| US-35 | Tests à chaque push | 3 |
| US-37 | Images publiées sur GHCR | 5 |
| US-38 | Déploiement automatique sur merge vers `main` | 5 |
| | **Sous-total** | **28** |

Tâches non estimées mais engagées : création du dépôt et des protections, achat du
VPS et du domaine, installation de Dokploy, configuration Nginx, gel des contrats
d'API, animation des cérémonies.

---

## Hors périmètre de ce sprint

Explicitement reporté au Sprint 2, pour éviter les discussions en cours de route :
Supertest, Vitest, Playwright, Trivy, CodeQL, Semgrep, Uptime Kuma, tableau de bord
de statistiques, rapport LaTeX.

---

## Dépendances

```
US-01, US-02, US-04  (auth-service)
        |
        v
US-06 .. US-11  (events)     US-15 .. US-19  (participants)
        |                             |
        +--------------+--------------+
                       v
              US-21 .. US-27  (registrations)
                       |
                       v
              US-12  (places restantes, boucle vers events)
```

`registrations-service` ne peut pas être terminé avant que `events-service` et
`participants-service` répondent. C'est pourquoi il est planifié au jour 5.

La Paire B ne dépend d'aucune de ces stories grâce aux contrats figés et au bouchon.

---

## Bilan de fin de sprint

> À remplir le 11 août par le Scrum Master.

| Indicateur | Valeur |
|---|---|
| Points engagés | 116 |
| Points réalisés | |
| Vélocité | |
| Objectif de sprint atteint | oui / non |
| Stories reportées au Sprint 2 | |

### Ce qui a été livré

### Ce qui n'a pas été livré, et pourquoi
