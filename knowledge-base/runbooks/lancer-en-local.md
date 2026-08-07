# Runbook : lancer EventHub en local

## Prérequis

| Outil | Version minimale | Vérification |
|---|---|---|
| Docker Engine | 24 | `docker --version` |
| Docker Compose | v2 | `docker compose version` |
| Node.js | 24 | `node --version` |
| Git | 2.40 | `git --version` |

## Méthode 1 : tout en conteneurs, recommandée

```bash
git clone https://github.com/traorecheikh/eventis.git
cd eventis
cp .env.example .env
# éditer .env : renseigner les mots de passe et JWT_SECRET
docker compose up -d
docker compose ps
```

Les dix conteneurs doivent afficher `(healthy)`. Le premier démarrage prend deux à
trois minutes, le temps que les bases s'initialisent.

Accès :

| URL | Contenu |
|---|---|
| `http://localhost` | Interface Vue |
| `http://localhost/api/events` | API événements |
| `http://localhost/api/events/docs` | Swagger events-service |
| `http://localhost/api/auth/docs` | Swagger auth-service |

Génération d'un `JWT_SECRET` :

```bash
openssl rand -base64 48
```

## Méthode 2 : services en local, bases en conteneurs

Pour développer avec rechargement à chaud.

```bash
docker compose up -d auth-db events-db participants-db registrations-db

cd events-service && npm install && npm run dev     # port 3001
cd participants-service && npm install && npm run dev  # port 3002
cd registrations-service && npm install && npm run dev # port 3003
cd auth-service && npm install && npm run dev       # port 3004
cd frontend && npm install && npm run dev           # port 5173
```

Dans ce mode, les quatre bases publient leurs ports sur l'hôte via le fichier
`docker-compose.override.yml`, absent en production.

## Jeu de données de démonstration

```bash
docker compose exec events-db psql -U events_user -d events -f /seed/events.sql
```

Les scripts vivent dans `seed/`. Ils créent trois événements, dix participants et
quinze inscriptions, de quoi remplir les écrans pour une démonstration.

## Arrêt

```bash
docker compose down       # arrête, conserve les données
docker compose down -v    # arrête et détruit les volumes
```

`down -v` efface les quatre bases. À n'utiliser que pour repartir de zéro.

## Contrôles rapides

```bash
curl -fsS http://localhost/api/events         | head
curl -fsS http://localhost:3001/health        # si lancé hors conteneur
docker compose logs -f registrations-service
```
