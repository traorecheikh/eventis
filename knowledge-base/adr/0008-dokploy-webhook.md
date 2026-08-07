# ADR 0008 : déploiement déclenché par webhook Dokploy

Date : 06/08/2026. Statut : accepté.

## Contexte

Le sujet exige une étape "Deploy : déploiement automatique" dans le pipeline. Trois
mécanismes possibles avec Dokploy.

| Option | Fonctionnement | Inconvénient |
|---|---|---|
| SSH depuis GitHub Actions | Clé privée en secret, `docker compose pull && up` | Une clé SSH de production stockée chez GitHub |
| Dokploy surveille le dépôt | Dokploy construit lui-même sur le VPS | La CI ne fait plus que tester, l'étape CD disparaît du pipeline |
| Webhook Dokploy | La CI appelle une URL, Dokploy télécharge et redéploie | Aucun |

## Décision

Webhook. Dernière étape du workflow :

```yaml
- name: Deploy
  run: curl -X POST "${{ secrets.DOKPLOY_WEBHOOK }}"
```

## Justification

- Aucune clé SSH n'est confiée à GitHub.
- Les 7 étapes exigées par le sujet restent toutes visibles dans le workflow, y
  compris la dernière.
- Les images sont construites par GitHub Actions, pas sur le VPS : le serveur ne
  télécharge que des images prêtes. Un build Vite sur un VPS peut saturer la mémoire.

## Conséquences

- L'URL du webhook est un secret : quiconque la possède peut déclencher un
  déploiement. Elle vit dans GitHub Secrets sous `DOKPLOY_WEBHOOK`.
- Le déploiement est asynchrone. La CI se termine en succès dès l'appel, sans
  attendre la fin du redéploiement. La vérification se fait sur `/health`.
