# ADR 0009 : VPS Contabo 8 Go et domaine venuva.xyz

Date : 06/08/2026. Statut : accepté, achat en cours.

## Besoin

Dix conteneurs simultanés : 4 services Node, 4 PostgreSQL, 1 Nginx, 1 Uptime Kuma,
auxquels s'ajoutent Dokploy et son Traefik.

## Décision infrastructure

Contabo VPS S : 4 vCPU, 8 Go de mémoire, environ 5 euros par mois.

Comparaison au moment du choix :

| Offre | Mémoire | Prix | Verdict |
|---|---|---|---|
| Hetzner CX22 | 4 Go | 4 euros | Juste avec 4 PostgreSQL |
| Contabo VPS S | 8 Go | 5 euros | Retenu, meilleure mémoire par euro |
| Hetzner CX32 | 8 Go | 7 euros | Meilleurs disques, 2 euros de plus |
| Oracle Always Free | 24 Go | 0 euro | Écarté : capacité souvent indisponible, architecture ARM |

Le choix de 4 conteneurs PostgreSQL (ADR 0003) rend 4 Go trop juste. 8 Go laisse de
la marge pour Playwright et Uptime Kuma.

## Décision nom de domaine

`venuva.xyz`, vérifié disponible par requête RDAP le 06/08/2026, environ 2 euros la
première année.

Le sujet impose le nom **EventHub**. Celui-ci est conservé dans le rapport, le README
et le code. `Eventis` sert uniquement de nom de dépôt GitHub. `venuva.xyz` est le
domaine de déploiement, distinct du nom du dépôt. Le correcteur retrouve le nom du
sujet partout dans les livrables.

## Conséquences

- Durcissement SSH à faire dès la mise à disposition : authentification par clé,
  désactivation du mot de passe, pare-feu limité aux ports 22, 80 et 443.
- Le certificat TLS est émis automatiquement par Traefik via Let's Encrypt une fois
  le DNS propagé.
