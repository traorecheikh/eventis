# Runbook : revenir en arrière

## Contrainte à connaître avant de commencer

Les images sont publiées avec le seul tag `latest` (ADR 0007). **Il n'existe pas
d'image antérieure sur GHCR.** Le retour arrière passe obligatoirement par une
reconstruction. Compter cinq à huit minutes d'indisponibilité.

C'est le risque R-03. Si cette procédure doit être utilisée, ouvrir immédiatement
une issue pour ajouter le tag `${{ github.sha }}` au workflow.

## Procédure

### 1. Identifier le commit fautif

```bash
git log --oneline main -10
```

### 2. Annuler le merge

```bash
git checkout main
git pull
git revert -m 1 <SHA_DU_MERGE>
git push origin main
```

`-m 1` indique que l'on conserve le premier parent, c'est-à-dire l'état de `main`
avant le merge.

Si `main` est protégée contre les push directs, passer par une PR de revert. C'est
plus lent mais cela respecte le processus.

### 3. Attendre la reconstruction

Le push sur `main` relance `cd.yml`. Suivre l'avancement dans l'onglet Actions.

### 4. Vérifier

```bash
curl -fsS https://venuva.xyz/api/events
```

## Retour arrière d'urgence, sans reconstruction

Si l'application est totalement inaccessible et que l'on ne peut pas attendre :

```bash
ssh deploy@<IP_DU_VPS>
docker images | grep eventis        # chercher une image encore en cache local
```

Si une image antérieure est encore présente dans le cache Docker du VPS, la retaguer
et relancer :

```bash
docker tag <ID_IMAGE_ANCIENNE> ghcr.io/traorecheikh/eventis-events:latest
cd /etc/dokploy/compose/eventhub
docker compose up -d --no-pull events-service
```

Cette méthode dépend entièrement de la présence fortuite de l'ancienne image dans le
cache. Elle n'est pas fiable et ne doit pas être considérée comme une stratégie.

## Restauration d'une base

Les quatre volumes survivent à un `docker compose down`. Ils ne survivent pas à un
`docker compose down -v`.

Sauvegarde avant toute opération risquée :

```bash
docker compose exec events-db pg_dump -U events_user events > events_$(date +%F).sql
```

Restauration :

```bash
cat events_2026-08-15.sql | docker compose exec -T events-db psql -U events_user -d events
```

À faire avant chaque démonstration importante.
