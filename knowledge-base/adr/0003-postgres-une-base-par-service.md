# ADR 0003 : PostgreSQL, une base et un conteneur par service

Date : 06/08/2026. Statut : accepté.

## Contexte

Le sujet impose une base relationnelle, MySQL ou PostgreSQL, et une architecture
microservices. La topologie de base de données est le point où une architecture
microservices se révèle réelle ou cosmétique.

## Options examinées

| Option | Isolation | Coût mémoire |
|---|---|---|
| 1 base partagée, 1 schéma commun | Nulle | Faible |
| 1 base partagée, 1 schéma par service | Logique | Faible |
| 1 conteneur, 4 bases et 4 utilisateurs | Logique forte | Environ 200 Mo |
| 4 conteneurs PostgreSQL | Physique complète | Environ 600 Mo |

## Décision

Quatre conteneurs PostgreSQL 16 distincts : `events-db`, `participants-db`,
`registrations-db`, `auth-db`. Chacun avec son volume nommé.

## Justification

C'est la seule topologie où un service ne peut techniquement pas lire la base d'un
autre. Elle rend la démonstration d'architecture microservices incontestable devant
un jury. Le VPS retenu dispose de 8 Go, la contrainte mémoire n'est pas bloquante.

## Conséquences

- **Aucune clé étrangère entre services.** `registrations.event_id` et
  `registrations.participant_id` sont des entiers sans contrainte référentielle.
  L'intégrité est applicative, vérifiée par appel REST avant écriture.
- La suppression d'un événement laisse des inscriptions orphelines. Compromis assumé.
- Chaque PostgreSQL est configuré avec `shared_buffers=64MB` et `max_connections=25`.
- Quatre volumes nommés à sauvegarder, pas un seul.
