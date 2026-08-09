# participants-service

Squelette seulement. Pas encore implemente.

Contrat d'API a respecter avant d'ecrire le code :
[knowledge-base/api/participants-service.md](../knowledge-base/api/participants-service.md).

A faire, dans l'ordre, en suivant le patron etabli par `auth-service/` et
`event-service/` (Prisma, ES modules, meme structure de dossiers) :

1. `prisma/schema.prisma` a partir du modele de donnees du contrat.
2. `src/config/prisma.js`, singleton `PrismaClient`.
3. `src/middleware/auth.js`, copie de celui de `event-service`.
4. `src/routes/`, `src/services/` selon les points d'entree du contrat.
5. `src/server.js`, meme validation de variables d'environnement au demarrage
   que les deux autres services.
6. `Dockerfile`, copie adaptee de `auth-service/Dockerfile`.
7. `src/config/swagger.js` + annotations JSDoc `@openapi` sur chaque route +
   `scripts/generate-openapi.js` + script npm `docs:generate`, meme patron
   qu'`auth-service`. Voir
   [ADR 0011](../knowledge-base/adr/0011-openapi-genere-orval.md) : le
   contrat OpenAPI est genere depuis le JSDoc, jamais ecrit a la main.
8. Ajouter un projet `participants` dans `frontend/orval.config.js` une fois
   le service expose ses routes, pour que le frontend puisse regenerer son
   client.
9. Tests unitaires (Prisma mocke) et d'integration (Postgres ephemere).
10. Ajouter le service a `docker-compose.yml` et a `gateway/nginx.conf`
    (decommenter la section prevue).
11. Ajouter un job dans `.github/workflows/ci.yml`.
