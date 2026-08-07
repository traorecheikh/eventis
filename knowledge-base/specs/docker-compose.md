# Spécification du docker-compose.yml

Le `docker-compose.yml` est marqué "bonus" dans le sujet. Il est traité ici comme un
livrable de plein droit : c'est lui qui rend le projet démontrable en une commande.

## Inventaire des services

| Service | Image | Réseau | Volume |
|---|---|---|---|
| `nginx` | construite depuis `frontend/` | frontend, backend | aucun |
| `auth-service` | `ghcr.io/traorecheikh/eventis-auth:latest` | backend | aucun |
| `events-service` | `ghcr.io/traorecheikh/eventis-events:latest` | backend | aucun |
| `participants-service` | `ghcr.io/traorecheikh/eventis-participants:latest` | backend | aucun |
| `registrations-service` | `ghcr.io/traorecheikh/eventis-registrations:latest` | backend | aucun |
| `auth-db` | `postgres:16-alpine` | backend | `auth_data` |
| `events-db` | `postgres:16-alpine` | backend | `events_data` |
| `participants-db` | `postgres:16-alpine` | backend | `participants_data` |
| `registrations-db` | `postgres:16-alpine` | backend | `registrations_data` |
| `uptime-kuma` | `louislam/uptime-kuma:1` | backend | `kuma_data` |

## Deux réseaux

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: false
```

Seul `nginx` appartient aux deux réseaux. Les 4 services et les 4 bases ne sont que
sur `backend` et **ne publient aucun port sur l'hôte**. C'est le point de sécurité
principal à mettre en avant dans le rapport.

## Healthchecks

Sur chaque base :

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 20s
```

Sur chaque service Node : la directive `HEALTHCHECK` est déjà dans l'image, le
compose n'a rien à redéfinir.

## Ordre de démarrage

```yaml
depends_on:
  events-db:
    condition: service_healthy
```

Un service ne démarre qu'une fois sa base réellement prête à accepter des
connexions, et non simplement une fois le conteneur lancé. Sans cette condition, le
service se réveille avant PostgreSQL et échoue au premier `connect`.

`registrations-service` déclare en plus `depends_on` vers `events-service` et
`participants-service`, en condition `service_started` et non `service_healthy` :
attendre la santé complète créerait un blocage mutuel, `events-service` interrogeant
lui-même `registrations-service`.

## Limites de ressources

```yaml
deploy:
  resources:
    limits:
      memory: 256M     # services Node
      # memory: 384M   # bases PostgreSQL
```

Sur un VPS de 8 Go, ces limites évitent qu'un seul conteneur emballé fasse tomber
l'ensemble.

## Réglage PostgreSQL

Quatre instances en parallèle demandent une configuration sobre :

```yaml
command: >
  postgres
  -c shared_buffers=64MB
  -c max_connections=25
  -c work_mem=4MB
```

## Politique de redémarrage

```yaml
restart: unless-stopped
```

Sur tous les services. La plateforme se relève seule après un redémarrage du VPS.

## Variables d'environnement

Aucune valeur secrète dans le fichier. Tout passe par substitution :

```yaml
environment:
  DATABASE_URL: postgres://events_user:${EVENTS_DB_PASSWORD}@events-db:5432/events
  JWT_SECRET: ${JWT_SECRET}
```

En local, les valeurs viennent du `.env`. En production, des variables
d'environnement définies dans l'interface Dokploy.

## Vérification

```bash
docker compose config          # valide la syntaxe et la substitution
docker compose up -d
docker compose ps              # les 10 conteneurs doivent afficher (healthy)
curl -fsS http://localhost/api/events
docker compose down            # les volumes survivent
docker compose down -v         # les volumes sont detruits, a n'utiliser qu'en dev
```
