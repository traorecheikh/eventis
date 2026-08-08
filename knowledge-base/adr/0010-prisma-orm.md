# ADR 0010 : Prisma comme couche d'accès aux donnees

Date : 08/08/2026. Statut : accepte.

## Contexte

`auth-service` et `event-service` utilisaient `pg` avec des requetes SQL ecrites a
la main. La revue de la PR #53 (CodeRabbit et audit manuel) a releve plusieurs
defauts directement lies a cette approche : logique de requete dupliquee entre
`auth.routes.js` et `auth.controller.js`, couche `user.model.js` non utilisee,
absence de pagination sur `GET /events` (requete non bornee), et aucune validation
de schema avant l'ecriture en base.

## Options examinees

| Option | Avantage | Inconvenient |
|---|---|---|
| `pg` a la main (statu quo) | Aucune dependance supplementaire | Chaque service reimplemente requetes, pagination, gestion d'erreur SQL |
| Sequelize 7 | API mature connue de l'ecosysteme Node | Version 7 encore en beta au 08/08/2026, risque sur une echeance au 17/08/2026 |
| Prisma | Client genere et type meme en JavaScript pur, pagination par curseur native, migrations versionnees dans `prisma/migrations/` | Ajoute une etape `prisma generate` au build Docker, necessite `openssl` sur l'image `alpine` |

## Decision

Prisma pour `auth-service` et `event-service`. Le meme choix s'appliquera a
`participants-service` et `registrations-service` quand ils seront crees.

Cette decision leve l'interdiction de `AGENTS.md` ligne 34 ("Pas de ... Prisma").
`AGENTS.md` est mis a jour en consequence.

## Consequences

- `prisma/schema.prisma` devient la source de verite du modele de donnees par
  service, `knowledge-base/api/<service>.md` reste le contrat d'API.
- Chaque service a besoin d'une seule variable d'environnement `DATABASE_URL` au
  lieu des cinq variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`,
  `DB_PASSWORD` separees.
- Le Dockerfile de chaque service doit installer `openssl` (requis par le moteur
  Prisma sur `node:24-alpine`) et executer `npx prisma generate` avant le
  demarrage.
- Les fichiers `sql/schema.sql` mentionnes dans le README sont remplaces par
  `prisma/migrations/`.
