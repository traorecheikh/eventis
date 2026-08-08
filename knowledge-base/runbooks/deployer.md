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
curl -I    https://venuva.xyz
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

## Ce qu'il ne faut pas faire

- Ne jamais modifier un fichier directement sur le VPS. Le prochain déploiement
  l'écrasera et la modification sera perdue sans trace.
- Ne jamais pousser directement sur `main`. La branche est protégée, mais la règle
  vaut aussi pour les administrateurs.
- Ne jamais déployer après 22 heures la veille de la remise. Voir R-03 : sans tag
  d'image versionné, le retour arrière prend cinq à huit minutes.
