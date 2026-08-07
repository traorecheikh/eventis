# Runbook : dépannage

## Un conteneur reste en `unhealthy`

```bash
docker compose ps
docker compose logs --tail=50 <service>
docker inspect <conteneur> --format '{{json .State.Health}}' | jq
```

| Cause fréquente | Vérification |
|---|---|
| La base n'est pas prête | `docker compose logs events-db` puis `pg_isready` |
| `DATABASE_URL` erronée | `docker compose exec events-service env \| grep DATABASE` |
| `curl` absent de l'image | La directive `HEALTHCHECK` échoue toujours. Ajouter `apk add --no-cache curl`. |
| `start_period` trop court | Le service met plus de 15 secondes à démarrer. Augmenter à 30 s. |

## Un service ne joint pas un autre

Depuis le conteneur :

```bash
docker compose exec registrations-service sh
wget -qO- http://events-service:3001/health
```

| Cause | Correction |
|---|---|
| Mauvais nom de service | Le nom DNS est celui du service dans le compose, pas le nom du conteneur. |
| Réseaux différents | Les deux services doivent être sur `backend`. |
| Port erroné | Utiliser le port **interne** (3001), pas un port publié. |
| URL en dur dans le code | Doit venir de `EVENTS_SERVICE_URL`. |

## `ECONNREFUSED` vers PostgreSQL au démarrage

Le service démarre avant que la base accepte les connexions. Vérifier que le
`depends_on` porte bien `condition: service_healthy` et non la forme courte.

## Erreur 502 depuis Nginx

```bash
docker compose logs nginx
```

Le service cible est arrêté ou n'écoute pas sur le port attendu. Vérifier que
`proxy_pass` pointe vers le bon nom de service et le bon port interne.

## Certificat TLS non émis

```bash
dig +short eventis.xyz
```

Let's Encrypt exige que le domaine résolve vers l'IP du VPS **avant** la demande de
certificat. Si le DNS n'était pas propagé lors de la première tentative, relancer
l'émission depuis l'onglet Domains de Dokploy.

Vérifier également que le port 80 est ouvert : la validation HTTP-01 en dépend.

## Le VPS manque de mémoire

```bash
free -h
docker stats --no-stream
```

Actions, dans l'ordre :

1. Vérifier qu'aucun build ne tourne sur le VPS. Les images doivent venir de GHCR.
2. Abaisser `shared_buffers` à 32 Mo sur les quatre bases.
3. Arrêter `uptime-kuma`, c'est le service le moins critique.
4. `docker system prune -a` pour récupérer l'espace des images orphelines.

## La CI échoue mais tout fonctionne en local

| Cause | Correction |
|---|---|
| `package-lock.json` non committé | `npm ci` échoue sans lui. |
| Version de Node différente | La CI utilise Node 24. Aligner en local. |
| Test dépendant de l'ordre d'exécution | La CI parallélise. Isoler l'état entre tests. |
| Base de test absente | Le job doit déclarer un service `postgres`. |

## Une image GHCR ne se télécharge pas sur le VPS

```
Error response from daemon: denied
```

Le paquet est privé. Le rendre public dans les paramètres du package GitHub, ou
configurer un registry privé dans Dokploy avec un jeton de lecture.

## Aucune de ces pistes ne fonctionne

1. Reproduire en local avec `docker compose up` et le même `.env`.
2. Isoler : lancer un seul service et sa base.
3. Comparer les variables d'environnement entre local et production.
4. Ouvrir une issue avec la sortie exacte des logs, sans reformulation.
