# frontend-ci — InternatAdmin

Frontend Angular de l'application InternatAdmin : gestion d'un Daara
(internat) — eleves, personnel, paiements et comptabilite.

## Presentation

- Angular, build de production via `ng build --configuration production`.
- Tests unitaires avec Vitest (environnement jsdom, pas de navigateur reel
  necessaire).
- Image Docker en deux etapes : build Node puis service par nginx
  (`nginxinc/nginx-unprivileged:1.30-alpine`), configuration dans
  `nginx.conf`.

## Prerequis

- Node.js (voir l'image utilisee en CI : `node:24-alpine`)
- Docker Desktop (pour builder et scanner l'image en local si besoin)

## Lancement local

```bash
npm ci
npx ng serve
```

L'application est servie sur `http://localhost:4200` (serveur de
developpement Angular) et appelle l'API backend — verifie que l'URL de l'API
dans la configuration d'environnement (`src/environments/`) pointe vers ton
instance locale de `backend-ci` (par defaut `http://localhost:8080`).

## Tests

```bash
npx ng test --watch=false
```

## Image Docker et nginx

L'image finale ne contient pas Node : seul le resultat du build
(`dist/InternatAdmin/browser/`) est copie dans l'image nginx. `nginx.conf`
sert les fichiers statiques et route les requetes API vers le backend.
L'image tourne avec un utilisateur non root (`nginx-unprivileged`).

Build local de l'image :

```bash
docker build -t daara-frontend:local .
docker run --rm -p 8080:8080 daara-frontend:local
```

## Pipeline Jenkins (`Jenkinsfile`)

Le pipeline CI s'execute automatiquement a chaque push sur ce depot (webhook
GitHub ou scrutation toutes les minutes en secours) et enchaine :

1. Installation des dependances (`npm ci`).
2. Build Angular de production.
3. Tests unitaires.
4. Analyse des dependances `npm audit` (bloque a partir de la severite
   `high`).
5. Build de l'image Docker (multi-etapes, utilisateur non root).
6. Scan de l'image avec Trivy (bloque sur toute vulnerabilite CRITICAL).
7. Publication de l'image sur Docker Hub (uniquement sur la branche `main`).
8. Declenchement automatique du job `deployment-cd` pour mettre a jour
   l'application deployee.
9. Notification du resultat du build dans Slack.

Voir `docs/securite.md` dans le depot `deployment-cd` pour le detail des
resultats de scan.

## Image Docker Hub

Image publiee : [`abdoulaye940/daara-frontend`](https://hub.docker.com/r/abdoulaye940/daara-frontend)
— tags `latest` (dernier build reussi sur `main`) et `1.<numero de build>`
(version figee de chaque publication).
