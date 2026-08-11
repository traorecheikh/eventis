# participants-service

Microservice Express de gestion des profils participants. Le contrat complet est
décrit dans [participants-service.md](../knowledge-base/api/participants-service.md).

## Commandes

```bash
npm ci
npx prisma migrate deploy
npm test
npm run dev
```

Le service écoute sur le port `3002`. Il expose `/health` et les routes métier sous
`/api/participants`. La création est publique. La consultation, la recherche, la
modification et la suppression exigent un JWT valide.
