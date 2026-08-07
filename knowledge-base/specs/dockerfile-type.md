# Spécification des Dockerfiles

Cinq Dockerfiles à produire. Le sujet en exige un par microservice et un pour le
frontend, et liste explicitement les bonnes pratiques attendues.

## Exigences du sujet et leur mise en oeuvre

| Exigence | Mise en oeuvre |
|---|---|
| Images de base légères (Alpine, Slim) | `node:24-alpine` et `nginx:alpine` |
| Exposer les bons ports | `EXPOSE 3001` à `3004`, `EXPOSE 80` pour nginx |
| Variables d'environnement pour la configuration | Aucune valeur en dur, tout par `ENV` ou par le compose |
| Volumes pour les données persistantes | Déclarés dans le `docker-compose.yml`, un par base |

## Modèle pour les 4 services Node

```dockerfile
# étape 1 : dépendances de production uniquement
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# étape 2 : image d'exécution
FROM node:24-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN apk add --no-cache curl

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD curl -fsS http://localhost:3001/health || exit 1

CMD ["node", "src/server.js"]
```

Points à respecter :

- `npm ci` et non `npm install` : respecte le `package-lock.json`, build reproductible.
- `--omit=dev` : les dépendances de test ne partent pas en production.
- `USER node` : le conteneur ne tourne pas en root. L'image `node` fournit déjà cet
  utilisateur.
- `COPY package*.json` avant le reste du code : le cache Docker n'est invalidé que si
  les dépendances changent.
- `curl` est ajouté explicitement, il n'est pas présent dans Alpine par défaut.
- Seul le port du service change entre les quatre fichiers.

## Modèle pour le frontend

```dockerfile
# étape 1 : construction du bundle Vue
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# étape 2 : service des fichiers statiques et passerelle
FROM nginx:alpine AS runtime
RUN apk add --no-cache curl
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -fsS http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

L'image finale ne contient ni Node, ni `node_modules`, ni le code source : seulement
les fichiers statiques compilés et Nginx. C'est l'argument principal du multi-stage,
à expliquer dans le rapport.

## .dockerignore

Un fichier par service, contenu identique :

```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
coverage
tests
*.md
Dockerfile
.dockerignore
```

Sans lui, le contexte de build envoie `node_modules` au démon Docker, ce qui
multiplie la durée du build.

## Vérification

```bash
docker build -t eventhub-events ./events-service
docker run --rm eventhub-events whoami        # doit afficher "node", pas "root"
docker images eventhub-events                 # cible : moins de 200 Mo
```
