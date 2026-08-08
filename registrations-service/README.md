# registrations-service

Squelette seulement. Pas encore implemente.

Contrat d'API a respecter avant d'ecrire le code :
[knowledge-base/api/registrations-service.md](../knowledge-base/api/registrations-service.md).

A faire, dans l'ordre, en suivant le patron etabli par `auth-service/` et
`event-service/` (Prisma, ES modules, meme structure de dossiers) :

1. `prisma/schema.prisma` a partir du modele de donnees du contrat.
2. `src/config/prisma.js`, singleton `PrismaClient`.
3. `src/middleware/auth.js`, copie de celui de `event-service`.
4. `src/routes/`, `src/services/` selon les points d'entree du contrat.
5. `src/server.js`, meme validation de variables d'environnement au demarrage
   que les deux autres services.
6. `Dockerfile`, copie adaptee de `auth-service/Dockerfile`.
7. Tests unitaires (Prisma mocke) et d'integration (Postgres ephemere).
8. Ajouter le service a `docker-compose.yml` et a `gateway/nginx.conf`
   (decommenter la section prevue).
9. Ajouter un job dans `.github/workflows/ci.yml`.
