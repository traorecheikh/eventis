# Runbook : déployer

## Déploiement normal, automatique

```
feature/*  ->  PR  ->  develop  ->  PR  ->  main  ->  déploiement automatique
```

1. Ouvrir une PR de `develop` vers `main`.
2. Vérifier que la CI est verte.
3. Merger.
4. Le workflow `cd.yml` se déclenche : tests, build des 5 images, publication sur
   GHCR, appel du webhook Dokploy.
5. Dokploy télécharge les images et relance les conteneurs.

Durée totale : cinq à huit minutes.

## Suivi

| Où | Quoi |
|---|---|
| Onglet Actions du dépôt | Avancement du workflow |
| Onglet Packages du dépôt | Date de publication des 5 images |
| Dokploy, onglet Deployments | Journal du redéploiement |
| `https://venuva.xyz/api/events` | Réponse de l'application |

## Vérification après déploiement

```bash
curl -fsS https://venuva.xyz/api/events        | head
curl -fsS https://venuva.xyz/api/auth/docs     -o /dev/null -w "%{http_code}\n"
curl -fsSIL https://venuva.xyz
```

Dans Dokploy, vérifier que les dix conteneurs sont en état sain et qu'aucun n'est en
boucle de redémarrage.

## Déploiement manuel, si le webhook ne répond pas

Interface Dokploy, projet `eventhub`, bouton **Redeploy**.

Ou en ligne de commande sur le VPS :

```bash
ssh deploy@<IP_DU_VPS>
cd /etc/dokploy/compose/eventhub
docker compose pull
docker compose up -d
docker compose ps
```

## Si la PR develop -> main affiche des conflits alors que le contenu est identique

Symptôme : la PR `develop` -> `main` affiche `mergeable: CONFLICTING` sur des
dizaines de fichiers sans rapport avec un travail en cours. Cause : un sync
précédent a été fait en écrasant l'arbre de `main` avec le contenu de
`develop` dans un commit sans second parent réel (`git merge -s ours` mal
utilisé, ou copie manuelle des fichiers suivie d'un commit simple). Le tip de
`main` n'est alors plus un ancêtre de `develop`, et `git merge-base` retombe
sur un point très ancien à chaque nouvelle comparaison : Git croit voir des
conflits massifs alors que le contenu est strictement identique.

Vérifier la cause avant de corriger :

```bash
git fetch origin
git merge-base --is-ancestor origin/main origin/develop && echo OK || echo CASSE
```

Si `CASSE`, corriger avec un vrai commit de fusion à deux parents (contenu de
`develop`, mais parenté réelle avec l'ancien tip de `main`) :

```bash
git checkout -b sync/main-develop origin/main
git merge -s ours --no-edit origin/develop   # commit de fusion, 2 parents, arbre = ancien main
git checkout origin/develop -- .              # ecrase l'arbre avec celui de develop
git add -A
git commit --amend --no-edit                  # meme commit de fusion, arbre = develop, 2 parents inchanges
git diff HEAD origin/develop                  # doit etre vide : preuve que l'arbre est identique
git log -1 --format='%p'                      # doit lister 2 hash : ancien tip main + tip develop
git push -u origin sync/main-develop
```

Ouvrir une PR de cette branche vers `main`, vérifier `mergeable: MERGEABLE`
avant de merger.

**Ne jamais refaire un sync par écrasement simple** (`rm -rf` puis copier les
fichiers de `develop` dans une branche fraîche suivie d'un commit à un seul
parent) : ça règle le symptôme une fois mais recasse la parenté pour la
prochaine fois. Toujours passer par le patron ci-dessus, qui préserve un vrai
lien d'ancêtre entre `main` et `develop`. Une fois ce lien rétabli, les syncs
suivants (merge normal sans conflit, ou même patron si `develop` a de nouveau
divergé pour une autre raison) restent propres.

## Ce qu'il ne faut pas faire

- Ne jamais modifier un fichier directement sur le VPS. Le prochain déploiement
  l'écrasera et la modification sera perdue sans trace.
- Ne jamais pousser directement sur `main`. La branche est protégée, mais la règle
  vaut aussi pour les administrateurs.
- Ne jamais déployer après 22 heures la veille de la remise. Voir R-03 : sans tag
  d'image versionné, le retour arrière prend cinq à huit minutes.
