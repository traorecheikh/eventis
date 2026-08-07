# Sprint 2 Backlog

| Champ | Valeur |
|---|---|
| Période | 11 au 17 août 2026, 6 jours |
| Objectif | Solidité, sécurité, documentation, livraison |
| Capacité engagée | 62 points, plus les reports du Sprint 1 |

## Objectif de sprint

> À la fin du Sprint 2, les 3 livrables notés sont remis : un dépôt GitHub propre
> avec un pipeline CI/CD complet et vert, un rapport PDF couvrant les 8 sections
> exigées, et un README couvrant les 9 points exigés. L'application tourne en
> production, supervisée, avec une vidéo de secours enregistrée.

---

## Contenu engagé

### Alpha Abdoulaye LANSAR

Périmètre : auth-service, socle frontend, ecrans de connexion.

| ID | Story | Points | Priorité |
|---|---|---|---|
| US-03 | Consulter son profil | 1 | P1 |
| US-05 | Rediriger a l expiration de session | 2 | P1 |
| US-43 | Tests Vitest sur les composants Vue | 5 | P2 |
| US-44 | Test Playwright du parcours complet | 5 | P2 |
| | **Sous-total** | **13** | |

### BAH Thierno Madjou

Périmètre : registrations-service et les ecrans Inscriptions.

| ID | Story | Points | Priorité |
|---|---|---|---|
| US-29 | Tableau de bord des statistiques | 5 | P1 |
| | **Sous-total** | **5** | |

### Cheikh Ahmed Tijani Traoré, Scrum Master

Périmètre : conteneurisation, CI/CD, infrastructure, documentation.

| ID | Story | Points | Priorité |
|---|---|---|---|
| US-33 | Healthchecks sur chaque conteneur | 3 | P0 |
| US-34 | Ne pas exposer les bases publiquement | 2 | P1 |
| US-36 | Bloquer une PR non conforme au lint | 2 | P1 |
| US-39 | Scanner les images avec Trivy | 3 | P2 |
| US-40 | Analyser le code avec CodeQL et Semgrep | 3 | P2 |
| US-45 | Couverture au dessus de 60 pour cent avec badge | 3 | P1 |
| US-46 | README complet | 5 | P0 |
| US-47 | Rapport PDF | 8 | P0 |
| US-48 | Diagramme d architecture detaille | 3 | P0 |
| US-49 | Supervision par Uptime Kuma | 2 | P2 |
| US-50 | Video de demonstration de secours | 2 | P1 |
| | **Sous-total** | **36** | |

### Travail commun

Périmètre : chacun sur son propre service.

| ID | Story | Points | Priorité |
|---|---|---|---|
| US-42 | Tests d integration Supertest | 8 | P1 |
| | **Sous-total** | **8** | |

## Ordre de sacrifice

Si le sprint dérape, on abandonne dans cet ordre exact, sans discussion :

1. US-49, Uptime Kuma
2. US-44, Playwright
3. US-43, Vitest
4. US-40, CodeQL et Semgrep
5. US-39, Trivy
6. US-29, tableau de bord

On n'abandonne **jamais** US-46, US-47 et US-48 : ce sont les livrables notés.

---

## Gel du code

À partir du **15 août au soir**, plus aucune nouvelle fonctionnalité. Seules les
corrections de bugs bloquants sont mergées, et chacune exige l'accord explicite du
Scrum Master.

Raison : un bug introduit le 16 août à 23 heures ne sera pas détecté avant la remise.

---

## Bilan de fin de sprint

> À remplir le 16 août par le Scrum Master.

| Indicateur | Valeur |
|---|---|
| Points engagés | 62 |
| Points réalisés | |
| Vélocité Sprint 1 | |
| Vélocité Sprint 2 | |
| Objectif de sprint atteint | oui / non |

### Livrables remis

- [ ] Dépôt GitHub public, `main` à jour, CI verte
- [ ] Rapport PDF, 8 sections
- [ ] README, 9 points
- [ ] Application joignable en HTTPS
- [ ] Vidéo de secours enregistrée
