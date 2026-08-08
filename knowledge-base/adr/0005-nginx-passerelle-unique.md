# ADR 0005 : un seul Nginx servant le frontend et la passerelle

Date : 06/08/2026. Statut : accepté.

## Contexte

Quatre services backend et un frontend. Il faut un point d'entrée unique. Par
ailleurs, Dokploy installe et pilote **son propre Traefik** sur le VPS, qui occupe
les ports 80 et 443 et gère le TLS Let's Encrypt.

## Décision

Un unique conteneur Nginx qui sert le build statique de Vue **et** proxifie les
quatre préfixes `/api/*` vers les services.

```
Internet
  -> Traefik (Dokploy, TLS, venuva.xyz)     couche gérée par la plateforme
  -> nginx (:80)                             notre conteneur, seul exposé
  -> auth / events / participants / registrations   réseau backend privé
```

## Justification

- Traefik et Nginx ne se concurrencent pas : Traefik fait l'entrée TLS et le
  routage par domaine, Nginx fait le routage par chemin à l'intérieur de
  l'application.
- Un seul conteneur exposé. Les 4 services et les 4 bases restent sur le réseau
  Docker privé, sans port publié.
- Le problème CORS disparaît : le frontend et l'API partagent la même origine.
- Une seule application à déclarer dans Dokploy, un seul domaine.

## Alternative écartée

Déclarer 5 domaines dans Dokploy et laisser le frontend appeler chaque service
directement. Cela aurait exposé publiquement les 4 backends et imposé une
configuration CORS sur chacun.

## Conséquences

- La configuration Nginx devient un point de défaillance unique. Elle est versionnée
  dans `gateway/nginx.conf` et testée en local avant tout déploiement.
- Les chemins de l'API sont réécrits : `/api/events/*` vers `events-service:3001/*`.
