# ADR 0007 : GHCR comme registry, tag `latest` uniquement

Date : 06/08/2026. Statut : accepté avec risque consigné.

## Décision registry

Publier les images sur GitHub Container Registry (`ghcr.io`).

Justification : l'authentification se fait avec le `GITHUB_TOKEN` fourni
automatiquement par GitHub Actions. Aucun secret à créer, aucune limite de
téléchargement comme sur Docker Hub, et les images sont rattachées au dépôt.

## Décision de marquage

Un seul tag : `latest`.

## Risque consigné

Un tag unique écrase la version précédente à chaque construction. **Il n'existe donc
aucune image antérieure vers laquelle revenir.** Si un déploiement casse la
production, le retour arrière impose un `git revert` sur `main` puis une
reconstruction complète, soit 5 à 8 minutes d'indisponibilité.

Ce risque est enregistré sous R-03 dans `../scrum/risques.md`.

## Levée possible

Ajouter un second tag `${{ github.sha }}` dans le workflow. Cela représente une
ligne de YAML et permettrait un retour arrière immédiat par simple changement de tag
dans Dokploy. À reconsidérer si le risque se matérialise.

## Conséquences

- La procédure de retour arrière est documentée dans `../runbooks/rollback.md`.
- Les images doivent être rendues publiques dans les paramètres du paquet GitHub,
  sinon le VPS ne peut pas les télécharger sans authentification.
