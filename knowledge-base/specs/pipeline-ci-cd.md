# Spécification du pipeline CI/CD

Le sujet énumère sept étapes. Cette spécification les couvre une par une, dans
l'ordre, et ajoute les jobs de qualité et de sécurité.

## Correspondance avec les exigences du sujet

| # | Étape exigée | Job GitHub Actions |
|---|---|---|
| 1 | Checkout, récupération du code | `actions/checkout@v4` |
| 2 | Setup, configuration de l'environnement | `actions/setup-node@v4`, Node 24, cache npm |
| 3 | Tests unitaires | `npm test` par service, matrice |
| 4 | Build, construction de chaque microservice | `npm ci` puis `npm run build` pour le frontend |
| 5 | Docker Build, construction des images | `docker/build-push-action@v5` |
| 6 | Docker Push, publication des images | Vers `ghcr.io` |
| 7 | Deploy, déploiement automatique | `curl -X POST ${{ secrets.DOKPLOY_WEBHOOK }}` |

## Fichiers de workflow

| Fichier | Déclenchement | Rôle |
|---|---|---|
| `.github/workflows/ci.yml` | push et PR sur `develop` et `feature/*` | lint, tests, build. Pas de publication. |
| `.github/workflows/cd.yml` | push sur `main` | Toute la chaîne, jusqu'au déploiement. |
| `.github/workflows/security.yml` | PR et hebdomadaire | CodeQL, Semgrep, `npm audit` |

## Structure du workflow d'intégration

```yaml
jobs:
  lint:
    # ESLint et Prettier sur tout le dépôt

  test:
    strategy:
      matrix:
        service: [auth-service, events-service, participants-service, registrations-service]
    services:
      postgres:
        image: postgres:16-alpine
        # base éphémère pour les tests d'intégration Supertest
    # npm ci puis npm test avec couverture

  test-frontend:
    # npm ci puis npm run test:unit avec Vitest

  build:
    needs: [lint, test, test-frontend]
    # npm run build sur le frontend, vérifie que le bundle sort
```

## Structure du workflow de livraison

```yaml
jobs:
  test:
    # identique au workflow d'intégration

  docker:
    needs: test
    permissions:
      contents: read
      packages: write
    strategy:
      matrix:
        include:
          - { service: auth-service,          image: eventis-auth }
          - { service: events-service,        image: eventis-events }
          - { service: participants-service,  image: eventis-participants }
          - { service: registrations-service, image: eventis-registrations }
          - { service: frontend,              image: eventis-frontend }
    steps:
      - docker/login-action vers ghcr.io avec GITHUB_TOKEN
      - docker/build-push-action, tag latest
      - aquasecurity/trivy-action sur l'image produite

  deploy:
    needs: docker
    steps:
      - curl -X POST "${{ secrets.DOKPLOY_WEBHOOK }}"
      - attente de 60 secondes puis vérification de https://eventis.xyz/api/events
```

## Filtres de chemin

Le dépôt est un monorepo. Sans filtre, une correction de faute dans le README
reconstruirait les cinq images.

```yaml
on:
  push:
    paths-ignore:
      - '**.md'
      - 'knowledge-base/**'
      - 'rapport/**'
```

## Secrets requis

| Secret | Où | Usage |
|---|---|---|
| `GITHUB_TOKEN` | fourni automatiquement | Authentification GHCR |
| `DOKPLOY_WEBHOOK` | GitHub Secrets, à créer | Déclenchement du déploiement |

Aucun autre secret n'est nécessaire. Les mots de passe de base et le `JWT_SECRET`
vivent uniquement dans Dokploy, jamais dans la CI.

## Seuil de couverture

Configuré dans le `jest.config.js` de chaque service :

```js
coverageThreshold: {
  global: { lines: 60, statements: 60, branches: 50, functions: 60 }
}
```

En dessous, `npm test` sort en erreur et la CI échoue.

## Badges du README

```markdown
![CI](https://github.com/traorecheikh/eventis/actions/workflows/ci.yml/badge.svg)
![CD](https://github.com/traorecheikh/eventis/actions/workflows/cd.yml/badge.svg)
```

## Vérification

1. Ouvrir une PR sur `develop` : `ci.yml` se déclenche, `cd.yml` non.
2. Casser volontairement un test : la PR devient non mergeable.
3. Merger vers `main` : `cd.yml` publie 5 images sur GHCR et appelle le webhook.
4. Vérifier dans l'onglet Packages du dépôt que les 5 images sont présentes.
5. Vérifier que `https://eventis.xyz` sert la nouvelle version.
