# ADR 0002 : Vue 3 avec Vite pour le frontend

Date : 06/08/2026. Statut : accepté.

## Contexte

Le sujet autorise React, Angular, Vue.js ou du HTML/CSS/JS. Le critère noté est une
interface intuitive.

## Décision

Vue 3, composition API, avec Vite, Vue Router et Pinia.

## Justification

- Courbe d'apprentissage plus douce que React pour une équipe qui n'a pas de
  spécialiste frontend dédié.
- Vite produit un build statique que Nginx sert directement : le Dockerfile frontend
  est un simple multi-stage build puis copie vers `nginx:alpine`.
- Angular a été écarté : trop lourd à configurer et trop lent à construire en CI
  pour le gain attendu.
- Le HTML/CSS/JS sans framework a été écarté : il aurait fait perdre des points sur
  le critère d'interface.

## Conséquences

- Le rendu est côté client uniquement. Aucun besoin de serveur Node pour le
  frontend en production.
- Les tests de composants passent par Vitest, cohérent avec Vite.
