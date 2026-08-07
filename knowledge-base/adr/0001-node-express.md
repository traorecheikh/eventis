# ADR 0001 : Node.js et Express pour les microservices

Date : 06/08/2026. Statut : accepté.

## Contexte

Le sujet autorise Spring Boot, Node.js/Express, Django, Flask et FastAPI. Il faut
livrer 4 services en 11 jours avec une équipe de 5 personnes.

## Options examinées

| Option | Avantage | Inconvénient |
|---|---|---|
| Spring Boot | Impression solide sur un jury | Images lourdes, builds lents, verbosité, risque sur 11 jours |
| FastAPI | Swagger automatique, images légères | Toute l'équipe n'est pas à l'aise en Python |
| Express | Maîtrisé par les 5 membres, écosystème large, JWT trivial | Swagger à câbler manuellement |

## Décision

Node.js 24 avec Express, en JavaScript, sur `node:24-alpine`.

Raison déterminante : les quatre développeurs sont déjà à l'aise avec Node et Git.
Le temps est la ressource rare, pas la sophistication du framework. Le même langage
sur le backend et le frontend supprime aussi les changements de contexte.

## Conséquences

- Swagger doit être câblé manuellement via `swagger-jsdoc` et `swagger-ui-express`.
- La validation d'entrée n'est pas automatique : chaque route valide explicitement.
- Pas de TypeScript : le gain de sûreté ne compense pas le coût de configuration sur
  4 services en 11 jours. Consigné comme amélioration possible dans le rapport.
