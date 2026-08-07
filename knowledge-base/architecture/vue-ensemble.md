# Architecture générale, EventHub

## Diagramme de déploiement

```mermaid
graph TB
    U[Utilisateur navigateur]

    subgraph VPS["VPS Contabo 8 Go, Dokploy"]
        T["Traefik<br/>ports 80 et 443<br/>TLS Let's Encrypt<br/>géré par Dokploy"]

        subgraph NET_FRONT["réseau frontend"]
            NG["nginx<br/>sert le build Vue<br/>proxifie /api/*"]
        end

        subgraph NET_BACK["réseau backend, privé"]
            AU["auth-service<br/>:3004"]
            EV["events-service<br/>:3001"]
            PA["participants-service<br/>:3002"]
            RE["registrations-service<br/>:3003"]

            AUDB[("auth-db<br/>PostgreSQL 16")]
            EVDB[("events-db<br/>PostgreSQL 16")]
            PADB[("participants-db<br/>PostgreSQL 16")]
            REDB[("registrations-db<br/>PostgreSQL 16")]
        end

        UK["Uptime Kuma<br/>supervision"]
    end

    U -->|HTTPS eventis.xyz| T
    T -->|HTTP| NG
    NG -->|/api/auth/*| AU
    NG -->|/api/events/*| EV
    NG -->|/api/participants/*| PA
    NG -->|/api/registrations/*| RE

    AU --> AUDB
    EV --> EVDB
    PA --> PADB
    RE --> REDB

    RE -.->|verifie la capacite| EV
    RE -.->|verifie le participant| PA
    EV -.->|compte les inscrits| RE
    AU -.->|lie l'email| PA

    UK -.->|sonde /health| NG
```

Traits pleins : chemin d'une requête utilisateur.
Traits pointillés : appels entre services, internes au réseau `backend`.

## Chaîne CI/CD

```mermaid
graph LR
    D[Développeur] -->|push feature/*| GH[GitHub]
    GH -->|Pull Request| CI["GitHub Actions"]
    CI --> L[lint]
    CI --> TU[tests unitaires]
    CI --> TI[tests integration]
    L --> B[build]
    TU --> B
    TI --> B
    B --> DI["build images Docker"]
    DI --> TR[scan Trivy]
    TR --> PU["push ghcr.io"]
    PU --> WH["curl webhook Dokploy"]
    WH --> DK[Dokploy]
    DK -->|docker compose pull et up| VPS[VPS]
```

Le déploiement ne se déclenche que sur la branche `main`. Sur `develop` et sur les
branches `feature/*`, le pipeline s'arrête après le build.

## Ports

| Composant | Port interne | Publié sur l'hôte |
|---|---|---|
| nginx | 80 | oui, exposé à Traefik |
| events-service | 3001 | non |
| participants-service | 3002 | non |
| registrations-service | 3003 | non |
| auth-service | 3004 | non |
| events-db | 5432 | non |
| participants-db | 5432 | non |
| registrations-db | 5432 | non |
| auth-db | 5432 | non |
| uptime-kuma | 3001 | non, accès via Dokploy |

Un seul port est publié. C'est un argument de sécurité à faire figurer dans le
rapport.

## Correspondance des chemins

| URL publique | Service cible | Chemin interne |
|---|---|---|
| `https://eventis.xyz/` | nginx | build Vue statique |
| `https://eventis.xyz/api/auth/login` | auth-service:3004 | `/auth/login` |
| `https://eventis.xyz/api/events` | events-service:3001 | `/events` |
| `https://eventis.xyz/api/participants` | participants-service:3002 | `/participants` |
| `https://eventis.xyz/api/registrations` | registrations-service:3003 | `/registrations` |
| `https://eventis.xyz/api/events/docs` | events-service:3001 | `/docs`, Swagger UI |
