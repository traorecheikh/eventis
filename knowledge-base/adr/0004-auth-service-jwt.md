# ADR 0004 : un quatrième service dédié à l'authentification

Date : 06/08/2026. Statut : accepté.

## Contexte

Le sujet exige "au moins 3 services backend" et ne demande pas d'authentification.
Trois services suffiraient à satisfaire l'énoncé.

## Décision

Ajouter `auth-service`, quatrième microservice, portant l'inscription, la connexion
et l'émission de jetons JWT.

## Justification

- Le sujet dit "3 microservices ou plus". Un quatrième service démontre que
  l'architecture est extensible et pas calquée mécaniquement sur l'énoncé.
- Sans authentification, l'API expose des données personnelles (emails, téléphones)
  en accès libre. Un jury le relève.
- Le service reste petit : une table, quatre routes. Le coût est d'environ une
  journée de travail.

## Décisions internes

- Vérification du jeton **locale** dans chaque service, avec un `JWT_SECRET` partagé,
  plutôt qu'un appel réseau vers auth-service à chaque requête. Le point d'entrée
  `POST /auth/verify` existe mais n'est pas sur le chemin critique.
- Le middleware `requireAuth` est **dupliqué** dans chaque service plutôt que
  packagé. Un paquet partagé recréerait un couplage de build entre microservices,
  ce qui contredirait l'architecture.
- Deux rôles seulement : `organisateur` et `participant`.
- Pas de jeton de rafraîchissement. Hors périmètre, documenté comme amélioration.

## Conséquences

- Le `JWT_SECRET` est un secret partagé par les quatre services. Sa compromission
  affecte tout le système.
- Le frontend doit gérer l'expiration à 24 heures et rediriger vers la connexion.
