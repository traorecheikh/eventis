# registrations-service

Microservice Express de gestion des inscriptions et de leurs statistiques. Le
contrat complet est décrit dans
[registrations-service.md](../knowledge-base/api/registrations-service.md).

## Commandes

```bash
npm ci
npx prisma migrate deploy
npm test
npm run dev
```

Le service écoute sur le port `3003`. Il utilise uniquement les API REST de
`participants-service` et `event-service`. Chaque inscription est vérifiée avant
écriture et les annulations restent dans l'historique.
