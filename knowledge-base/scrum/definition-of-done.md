# Definition of Done

Contrat de qualité de l'Équipe 7. Une issue ne passe en `Termine` que si les quatre
conditions sont remplies. Le Scrum Master est garant de cette règle et refuse toute
fermeture qui ne la respecte pas.

## Les quatre conditions

### 1. Code mergé via une Pull Request approuvée

- La PR cible `develop`.
- Au moins une approbation d'un autre membre.
- Le template de PR est rempli, y compris la case Definition of Done.
- Aucun push direct sur `main` ou `develop`.

### 2. Tests unitaires écrits et verts en CI

- La logique métier introduite est couverte.
- Le job `tests` du workflow GitHub Actions est vert.
- La couverture globale du backend reste au-dessus de 60 pour cent.
- Une fonctionnalité sans test n'est pas terminée, quel que soit son état de marche.

### 3. Le conteneur se construit et démarre en `healthy`

```bash
docker compose build <service>
docker compose up -d <service>
docker compose ps        # la colonne STATUS doit indiquer (healthy)
```

Un service qui démarre mais dont `/health` renvoie `503` n'est pas terminé.

### 4. Documentation à jour

- Les annotations Swagger de la route sont écrites et visibles sur `/docs`.
- Le contrat dans `knowledge-base/api/` reflète la réalité, ou une PR le corrige.
- La section correspondante du `README.md` est à jour si le comportement visible
  a changé.

---

## Checklist opérationnelle

À copier dans chaque Pull Request.

```
- [ ] Branche nommee feature/<service>-<sujet>
- [ ] Commits au format Conventional Commits, en francais
- [ ] Tests unitaires ecrits et verts
- [ ] Couverture backend >= 60 pour cent
- [ ] docker compose build puis up : conteneur (healthy)
- [ ] Annotations Swagger a jour
- [ ] Contrat knowledge-base/api/ conforme
- [ ] README mis a jour si necessaire
- [ ] Aucun secret dans le diff
- [ ] Aucun tiret cadratin, aucun emoji dans les fichiers modifies
- [ ] Une approbation obtenue
- [ ] CI verte
```

---

## Ce qui n'est pas dans la Definition of Done

Pour éviter les débats en cours de sprint, voici ce qui est explicitement hors du
contrat de qualité, et pourquoi.

| Exclu | Raison |
|---|---|
| Couverture à 100 pour cent | Coût disproportionné sur 11 jours. Le seuil est à 60. |
| Tests bout en bout par fonctionnalité | Playwright couvre un parcours global, pas chaque route. |
| Revue de deux personnes | L'équipe fait 5 personnes. Une approbation suffit. |
| Traduction anglaise de la documentation | La documentation est en français, décision actée. |
| Optimisation de performance | Hors périmètre. Notée comme amélioration possible dans le rapport. |

---

## Definition of Ready

Symétrique de la Definition of Done. Une issue ne peut pas entrer dans un sprint si
elle n'y répond pas.

- Le besoin est écrit au format `En tant que ... je veux ... afin de ...`.
- Les critères d'acceptation sont listés et vérifiables.
- Le contrat d'API concerné est figé, ou l'issue consiste précisément à le figer.
- La dépendance vers une autre issue est explicite, via `Bloque par #N`.
- L'estimation en points est posée.
- L'issue est assignée à une paire, pas à une personne isolée.
