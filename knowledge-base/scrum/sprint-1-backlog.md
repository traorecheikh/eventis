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

### Alpha Abdoulaye LANSAR

Périmètre : auth-service, socle frontend, ecrans de connexion.

| ID | Story | Points | Priorité |
|---|---|---|---|
| US-01 | Creer un compte | 3 | P0 |
| US-02 | Se connecter | 3 | P0 |
| US-04 | Verifier les jetons dans les 4 services | 3 | P0 |
| | **Sous-total** | **9** | |

### Kassem Dehou Modeste

Périmètre : events-service et les ecrans Evenements.

| ID | Story | Points | Priorité |
|---|---|---|---|
| US-06 | Creer un evenement | 3 | P0 |
| US-07 | Modifier un evenement | 2 | P0 |
| US-08 | Supprimer un evenement | 1 | P0 |
| US-09 | Lister les evenements | 3 | P0 |
| US-10 | Filtrer les evenements par date et par lieu | 3 | P0 |
| US-11 | Voir le detail d un evenement | 2 | P0 |
| US-12 | Connaitre les places restantes | 5 | P0 |
| US-13 | Formulaire de creation d evenement | 3 | P0 |
| US-14 | Liste d evenements avec filtres | 5 | P0 |
| | **Sous-total** | **27** | |

### Mamadou Seydou Soumountera

Périmètre : participants-service et les ecrans Participants.

| ID | Story | Points | Priorité |
|---|---|---|---|
| US-15 | Creer un profil participant | 3 | P0 |
| US-16 | Modifier un profil participant | 2 | P0 |
| US-17 | Supprimer un participant | 1 | P0 |
| US-18 | Lister les participants | 2 | P0 |
| US-19 | Rechercher un participant par email ou par nom | 3 | P0 |
| US-20 | Ecran de gestion des participants | 3 | P0 |
| | **Sous-total** | **14** | |

### BAH Thierno Madjou

Périmètre : registrations-service et les ecrans Inscriptions.

| ID | Story | Points | Priorité |
|---|---|---|---|
| US-21 | S inscrire a un evenement | 8 | P0 |
| US-22 | Refuser l inscription si l evenement est complet | 5 | P0 |
| US-23 | Refuser une double inscription | 3 | P0 |
| US-24 | Annuler une inscription | 3 | P0 |
| US-25 | Lister les inscrits d un evenement | 3 | P0 |
| US-26 | Voir mes inscriptions | 2 | P0 |
| US-27 | Statistiques d inscription | 3 | P0 |
| US-28 | S inscrire en un clic depuis le detail | 3 | P0 |
| | **Sous-total** | **30** | |

### Cheikh Ahmed Tijani Traoré, Scrum Master

Périmètre : conteneurisation, CI/CD, infrastructure, documentation.

| ID | Story | Points | Priorité |
|---|---|---|---|
| US-30 | Un Dockerfile par service | 5 | P0 |
| US-31 | Lancer la plateforme avec docker compose up | 8 | P0 |
| US-32 | Volumes persistants pour les 4 bases | 2 | P0 |
| US-35 | Lancer les tests a chaque push | 3 | P0 |
| US-37 | Publier les images sur GHCR | 5 | P0 |
| US-38 | Deployer automatiquement sur merge vers main | 5 | P0 |
| | **Sous-total** | **28** | |

### Travail commun

Périmètre : chacun sur son propre service.

| ID | Story | Points | Priorité |
|---|---|---|---|
| US-41 | Tests unitaires Jest sur les 4 services | 8 | P0 |
| | **Sous-total** | **8** | |

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

Personne ne dépend du service d'un autre pour démarrer, grâce aux contrats figés et aux bouchons locaux.

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
