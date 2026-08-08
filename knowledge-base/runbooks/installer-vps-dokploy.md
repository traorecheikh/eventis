# Runbook : préparer le VPS et installer Dokploy

À exécuter une seule fois, le 06 ou le 07 août.

## 1. Commander le VPS

Contabo VPS S : 4 vCPU, 8 Go de mémoire, environ 5 euros par mois.
Système : **Ubuntu 24.04 LTS**, sans panneau de contrôle préinstallé.

Contabo peut demander une vérification d'identité. Compter jusqu'à 48 heures de
délai. C'est le risque R-02 : commander dès le premier jour.

## 2. Premier accès et durcissement

```bash
ssh root@<IP_DU_VPS>

apt update && apt upgrade -y
adduser deploy
usermod -aG sudo deploy

# depuis la machine locale
ssh-copy-id deploy@<IP_DU_VPS>
```

Désactiver l'accès par mot de passe :

```bash
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
sudo systemctl restart ssh
```

**Avertissement.** Ne pas fermer la session en cours avant d'avoir vérifié, depuis un
second terminal, que la connexion par clé fonctionne pour l'utilisateur `deploy`.
Une erreur ici verrouille l'accès au serveur.

Pare-feu :

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

## 3. Installer Dokploy

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Le script installe Docker, Docker Swarm, Traefik et l'interface Dokploy.
Durée : cinq à dix minutes.

Interface disponible sur `http://<IP_DU_VPS>:3000`. Créer le compte administrateur
immédiatement : le premier visiteur devient administrateur.

## 4. Configurer le domaine

Chez le registrar de `venuva.xyz`, créer :

| Type | Nom | Valeur |
|---|---|---|
| A | `@` | IP du VPS |
| A | `www` | IP du VPS |

Vérifier la propagation :

```bash
dig +short venuva.xyz
```

Compter de quelques minutes à quelques heures.

## 5. Créer l'application dans Dokploy

1. Nouveau projet, nom `eventhub`.
2. Type **Docker Compose**.
3. Source : dépôt GitHub `traorecheikh/eventis`, branche `main`.
4. Chemin du fichier compose : `docker-compose.yml`.
5. Onglet Domains : ajouter `venuva.xyz`, service `nginx`, port `80`,
   activer **HTTPS** et le certificat Let's Encrypt.
6. Onglet Environment : renseigner les variables listées dans `.env.example`.
   Générer chaque mot de passe avec `openssl rand -base64 24` et le `JWT_SECRET`
   avec `openssl rand -base64 48`.
7. Onglet Deployments : copier l'**URL de webhook** et l'enregistrer dans les secrets
   GitHub du dépôt sous le nom `DOKPLOY_WEBHOOK`.

## 6. Rendre les images GHCR accessibles

Par défaut, les paquets publiés sur GHCR sont privés. Le VPS ne pourra pas les
télécharger.

Dans GitHub, onglet Packages du dépôt, pour chacune des cinq images :
Package settings, Change visibility, Public.

Alternative : créer un jeton de lecture et l'ajouter comme registry privé dans
Dokploy.

## 7. Vérifier

```bash
curl -fsSI https://venuva.xyz                # 200, certificat valide
curl -fsS https://venuva.xyz/api/events     # réponse JSON
```

Dans Dokploy, l'onglet Logs de chaque service doit être exempt d'erreur, et les dix
conteneurs doivent apparaître en état sain.
