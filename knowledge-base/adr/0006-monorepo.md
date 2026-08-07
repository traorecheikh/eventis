# ADR 0006 : monorepo

Date : 06/08/2026. Statut : accepté.

## Décision

Un seul dépôt GitHub contenant les 4 services, le frontend, la passerelle, le
`docker-compose.yml`, les workflows et la documentation.

## Justification

- Cinq personnes sur onze jours. Six dépôts signifieraient six configurations de CI,
  six jeux de protections de branche et une coordination de versions entre services.
- Le sujet demande un dépôt contenant le code des 3 services, le frontend, les
  Dockerfiles, le README et le `docker-compose.yml`. Un monorepo satisfait
  littéralement cette liste.
- Une seule Pull Request peut modifier un contrat d'API et son consommateur en même
  temps, ce qui évite les désynchronisations.

## Conséquences

- La CI doit utiliser des filtres de chemin pour ne pas reconstruire les 5 images à
  chaque commit de documentation.
- Le monorepo n'est pas l'organisation d'usage en microservices en production. Ce
  point est assumé et expliqué dans le rapport.
