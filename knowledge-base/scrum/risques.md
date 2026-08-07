# Registre des risques

Tenu à jour par le Scrum Master. Gravité et probabilité de 1 (faible) à 5 (élevée).
Criticité = gravité multipliée par probabilité.

---

## R-01 : le socle frontend n'est pas livré, trois développeurs bloqués

| Champ | Valeur |
|---|---|
| Gravité | 5 |
| Probabilité | 4 |
| Criticité | **20** |
| Origine | Alpha porte seul le socle frontend (Vite, router, Pinia, client axios) dont dépendent les écrans des trois autres |

**Parade appliquée.** Le socle frontend est la toute première tâche du projet,
planifiée le 06 août au matin, avant même `auth-service`. En parallèle, les quatre
contrats d'API sont figés dans `knowledge-base/api/` avec des exemples JSON complets,
ce qui permet à chacun de développer ses écrans contre un bouchon local sans attendre
le service d'un voisin.

**Détection.** Question posée à chaque standup : "quelqu'un attend-il une livraison
d'un autre ?" Toute réponse positive est un blocage traité le jour même. Le socle est
vérifié explicitement au standup du 07 août.

**Plan de repli.** Si le socle n'est pas livré le 07 août, le Scrum Master le termine
lui-même. Si un service est en retard, son propriétaire livre d'abord les routes dont
dépendent les autres, le reste ensuite.

---

## R-02 : Le VPS n'est pas livré à temps ou Dokploy ne s'installe pas

| Champ | Valeur |
|---|---|
| Gravité | 5 |
| Probabilité | 3 |
| Criticité | **15** |
| Origine | Contabo peut demander une vérification d'identité qui retarde la mise à disposition de 24 à 48 heures |

**Parade.** Commande passée dès le 06 août, premier jour. Une marge de 4 jours
existe avant le jalon du 10 août.

**Plan de repli.** Si le VPS n'est pas disponible le 09 août, bascule vers un autre
fournisseur avec activation immédiate, ou vers l'offre étudiante DigitalOcean.
En dernier recours, la démonstration se fait via `docker compose up` en local et le
rapport documente le déploiement tel qu'il aurait été configuré.

---

## R-03 : Le tag d'image `latest` seul empêche tout retour arrière

| Champ | Valeur |
|---|---|
| Gravité | 4 |
| Probabilité | 3 |
| Criticité | **12** |
| Origine | Décision d'équipe actée dans l'ADR 0007 |

Avec un seul tag `latest`, la version précédente d'une image est écrasée à chaque
build. Si un déploiement casse la production la veille de la remise, il n'existe pas
d'image antérieure à redéployer.

**Parade partielle.** Le retour arrière passe par un `git revert` sur `main` suivi
d'un rebuild complet, soit environ 5 à 8 minutes. La procédure est écrite dans
`../runbooks/rollback.md`.

**Levée définitive.** Ajouter `:${{ github.sha }}` en second tag dans le workflow.
Une ligne de YAML. À reconsidérer si le risque se matérialise une première fois.

---

## R-04 : Un membre ne livre pas sa part

| Champ | Valeur |
|---|---|
| Gravité | 4 |
| Probabilité | 3 |
| Criticité | **12** |

**Parade.** Le découpage en tranches verticales isole la perte : un service absent
ne bloque que ses propres écrans, pas le reste de l'application. Le Scrum Master
détient la totalité de l'infrastructure et des trois livrables notés, qui ne
dépendent de personne d'autre. Les contrats d'API figés permettent à quelqu'un
d'autre de reprendre un service sans reverse engineering.

**Détection.** Absence à deux standups consécutifs, ou aucune PR ouverte pendant
48 heures.

**Action.** Conversation directe, puis redistribution. La bascule déjà prévue :
Mamadou, le moins chargé avec 14 points, reprend en priorité. Le périmètre des bonus
P2 est réduit en conséquence.

---

## R-05 : 4 conteneurs PostgreSQL saturent le VPS

| Champ | Valeur |
|---|---|
| Gravité | 3 |
| Probabilité | 2 |
| Criticité | **6** |

Dix conteneurs tournent en parallèle, dont Traefik et Dokploy. Sur 8 Go, l'espace
est confortable, mais un build Vite lancé sur le serveur pourrait déclencher un
manque de mémoire.

**Parade.** Les images sont construites par GitHub Actions, jamais sur le VPS.
Chaque PostgreSQL est configuré avec `shared_buffers=64MB` et `max_connections=25`.
Des limites mémoire sont posées dans le `docker-compose.yml`.

---

## R-06 : Surbooking par requêtes concurrentes

| Champ | Valeur |
|---|---|
| Gravité | 3 |
| Probabilité | 2 |
| Criticité | **6** |

Deux inscriptions simultanées sur la dernière place peuvent toutes deux passer la
vérification applicative de disponibilité.

**Parade.** Un index unique partiel sur `(event_id, participant_id)` filtré sur
`status = 'confirmee'` empêche le doublon au niveau de la base. Le service attrape
l'erreur PostgreSQL `23505` et renvoie `409`.

Note : cet index protège contre la double inscription d'une même personne, pas
contre le dépassement de capacité par deux personnes différentes. Le dépassement
strict de capacité en concurrence est un risque résiduel accepté, documenté dans le
rapport comme amélioration possible (verrou pessimiste ou compteur transactionnel).

---

## R-07 : Fuite de secret dans le dépôt public

| Champ | Valeur |
|---|---|
| Gravité | 5 |
| Probabilité | 2 |
| Criticité | **10** |

Le dépôt est public. Un `.env` committé expose le `JWT_SECRET` et les mots de passe
PostgreSQL.

**Parade.** `.env` figure dans `.gitignore` dès le premier commit. La checklist de PR
contient une case "aucun secret dans le diff". Les secrets de production vivent dans
les variables d'environnement Dokploy.

**Si le risque se matérialise.** Le secret est considéré compromis. On le fait
tourner, on ne se contente pas de réécrire l'historique.

---

## R-08 : Rapport PDF bâclé faute de temps

| Champ | Valeur |
|---|---|
| Gravité | 5 |
| Probabilité | 3 |
| Criticité | **15** |

Le rapport est un des trois livrables notés. Il est systématiquement repoussé à la
fin dans ce type de projet.

**Parade.** La structure LaTeX existe dès le jour 1 dans `rapport/`. Les captures
d'écran sont prises au fil de l'eau, à la démo du 11 août et non le 16. Les
rétrospectives alimentent directement la section "Difficultés rencontrées". Le gel
du code au 15 août libère deux journées entières pour la rédaction.

---

## Synthèse

| Risque | Criticité | Statut |
|---|---|---|
| R-01 Socle frontend non livré | 20 | Parade active |
| R-02 VPS indisponible | 15 | Parade active |
| R-08 Rapport bâclé | 15 | Parade active |
| R-03 Pas de retour arrière | 12 | Accepté, levée documentée |
| R-04 Membre défaillant | 12 | Surveillé |
| R-07 Fuite de secret | 10 | Parade active |
| R-05 Saturation VPS | 6 | Parade active |
| R-06 Surbooking | 6 | Partiellement accepté |
