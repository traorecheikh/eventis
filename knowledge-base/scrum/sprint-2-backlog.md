# Sprint 2 Backlog

| Champ | Valeur |
|---|---|
| Période | 11 au 17 août 2026, 6 jours |
| Objectif | Solidité, sécurité, documentation, livraison |
| Capacité engagée | 54 points, plus les reports du Sprint 1 |

## Objectif de sprint

> À la fin du Sprint 2, les 3 livrables notés sont remis : un dépôt GitHub propre
> avec un pipeline CI/CD complet et vert, un rapport PDF couvrant les 8 sections
> exigées, et un README couvrant les 9 points exigés. L'application tourne en
> production, supervisée, avec une vidéo de secours enregistrée.

---

## Contenu engagé

### Paire A

| ID | Story | Points |
|---|---|---|
| US-03 | Consulter son profil | 1 |
| | Fiabilisation des appels inter-services : timeouts, réessai unique, journalisation | 5 |
| | Swagger complet et vérifié sur les 4 services | 5 |
| | Correction des bugs remontés par la Paire B | 8 |
| | **Sous-total** | **19** |

### Paire B

| ID | Story | Points |
|---|---|---|
| US-05 | Redirection à l'expiration de session | 2 |
| US-29 | Tableau de bord de statistiques | 5 |
| US-42 | Tests d'intégration Supertest | 8 |
| US-43 | Tests Vitest sur les composants | 5 |
| US-44 | Test Playwright du parcours complet | 5 |
| US-45 | Couverture au-dessus de 60 pour cent avec badge | 3 |
| | Finition visuelle des 7 écrans | 5 |
| | **Sous-total** | **33** |

### Scrum Master

| ID | Story | Points |
|---|---|---|
| US-33 | Healthchecks affinés sur chaque conteneur | 3 |
| US-34 | Bases non exposées publiquement, 2 réseaux | 2 |
| US-36 | Lint bloquant en CI | 2 |
| US-39 | Scan Trivy des images | 3 |
| US-40 | CodeQL et Semgrep | 3 |
| US-46 | README complet | 5 |
| US-47 | Rapport PDF | 8 |
| US-48 | Diagramme d'architecture détaillé | 3 |
| US-49 | Uptime Kuma | 2 |
| US-50 | Vidéo de démonstration | 2 |
| | **Sous-total** | **33** |

---

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
| Points engagés | 85 |
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
