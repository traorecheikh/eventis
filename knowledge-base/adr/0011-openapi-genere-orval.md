# ADR 0011 : OpenAPI genere depuis le code, client frontend genere par Orval

Date : 09/08/2026. Statut : accepte.

## Contexte

Le README annoncait des routes Swagger (`/api/auth/docs`, `/api/events/docs`)
qui n'ont jamais ete implementees : aucune dependance `swagger-jsdoc` ou
`swagger-ui-express` dans les `package.json`, aucune route de documentation
dans le code. Corrige dans le README (voir PR de correction du README), mais
la documentation d'API manquait reellement.

## Decision

1. **Le contrat OpenAPI est genere, jamais ecrit a la main.** Chaque route
   backend porte une annotation JSDoc `@openapi` juste au-dessus de sa
   definition. `swagger-jsdoc` compile ces annotations en un objet OpenAPI
   3.0.3 au demarrage du service (`src/config/swagger.js`), servi en direct
   sur `/api/<service>/docs` (interface Swagger UI) et
   `/api/<service>/docs.json` (JSON brut, pour un outil de generation
   externe).
2. **Le client frontend est genere, jamais ecrit a la main.** Orval lit le
   JSON expose par chaque service et genere un client Axios type dans
   `frontend/src/api/generated/<service>/`.
3. Ni `openapi.json` ni `frontend/src/api/generated/` ne sont committes (voir
   `.gitignore`). Ce sont des artefacts reconstructibles a l'identique depuis
   les annotations JSDoc, comme un `dist/` de build.

## Pourquoi Orval plutot que openapi-typescript

`openapi-typescript` ne genere que des types, il faut ensuite ecrire soi-meme
chaque appel `fetch`. Orval genere directement les fonctions appelables
(`postRegister(body)`, `getAuth()`, etc.) avec les types en plus, ce qui
correspond a l'objectif : qu'un developpeur frontend recupere un client pret
a l'emploi, pas seulement des types.

## Workflow

```bash
cd auth-service && npm run docs:generate    # ecrit auth-service/openapi.json
cd event-service && npm run docs:generate   # ecrit event-service/openapi.json
cd frontend && npm run generate:api         # lit les deux, ecrit src/api/generated/
```

Le fichier `.ts` genere n'implique pas une migration TypeScript du frontend :
Vite transpile les fichiers `.ts` sans verification de types, ils sont
importables tels quels depuis du JavaScript (`<script setup>` sans
`lang="ts"`). Aucune configuration TypeScript supplementaire necessaire.

## Consequences

- Toute modification d'une route (nouveau champ, nouveau code de statut)
  passe par l'annotation JSDoc de cette route, jamais par une edition
  manuelle d'un fichier genere.
- La documentation d'API ne peut pas diverger du code : elle est produite
  par le code.
- `participants-service` et `registrations-service` devront suivre le meme
  patron (`src/config/swagger.js`, annotations `@openapi`,
  `scripts/generate-openapi.js`, script `docs:generate`) des qu'ils auront
  du code reel.
- Voir [AGENTS.md](../../AGENTS.md) section 1 pour la regle verifiable
  associee.
