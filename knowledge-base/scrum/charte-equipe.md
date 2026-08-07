# Charte d'équipe, Équipe 7

Règles de fonctionnement acceptées par les 5 membres. Le Scrum Master en est garant.

## Engagements

1. Chaque membre poste son standup avant 10 heures, même les jours sans avancée.
2. Un blocage se signale immédiatement sur WhatsApp, pas au standup du lendemain.
3. Une Pull Request est relue sous 12 heures ouvrées.
4. Personne ne pousse directement sur `main` ou `develop`.
5. Une décision technique structurante devient une ADR, sinon elle n'existe pas.
6. On ne corrige pas le code d'une autre paire sans ouvrir une issue d'abord.
7. Le périmètre d'un sprint ne change pas en cours de sprint. Une demande nouvelle
   va au backlog.

## Horaires

| Moment | Engagement |
|---|---|
| Avant 10 h | Standup posté |
| 12 h ouvrées | Délai maximum de relecture d'une PR |
| 15 août au soir | Gel du code |

## Résolution de désaccord

1. Discussion technique entre les personnes concernées, 15 minutes maximum.
2. Sans accord, le Scrum Master tranche et écrit une ADR justifiant le choix.
3. La décision s'applique. Elle pourra être révisée après le sprint, pas pendant.

## Ce que le Scrum Master garantit à l'équipe

- Des contrats d'API figés avant que le code commence.
- Une infrastructure qui fonctionne : personne ne perd de temps sur Docker.
- Une relecture rapide de chaque PR.
- Aucune demande de dernière minute venue de l'extérieur du sprint.
