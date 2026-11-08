# T05 — Socle Angular, connexion, eleves, personnel, utilisateurs (Arame)

Depend de T01 et T02 (backend), deja fusionnes dans develop.  tu peux
travailler en parallele, du moment que le backend tourne en local (T01 +
T02 suffisent pour tester eleves/employes/utilisateurs/parametres).

## Avant de commencer

```bash
git checkout develop && git pull
git checkout -b feature/arame-socle-eleves
```

## Integrer ce dossier

Copie tout le contenu de ce zip dans un dossier `frontend-ci` clone depuis
`https://github.com/internatadmin-team/frontend-ci.git` (meme principe
que pour le backend). Ca inclut : la config racine (`angular.json`,
`package.json`, etc.), `src/app/core`, `src/app/shared`, et
`src/app/features/{auth,eleves,employes,users,parametres}`.

## Important : routes temporaires

Les ecrans `dashboard`, `paiements`, `finances` et `audit` n'existent pas
encore (ils arrivent avec ta tache T06). `app.routes.ts` a ete
temporairement adapte : la page par defaut apres connexion est `eleves`
au lieu de `dashboard`. Quand tu feras T06, remets `dashboard` comme page
par defaut et rajoute les routes manquantes (regarde la version finale
`app.routes.ts` qu'on a utilisee pour l'entrainement si besoin de
reference, ou demande a Abdoulaye).

## Tester

Assure-toi que le backend tourne en local (demande a Abdoulaye comment
lancer `backend-ci` avec Docker + PostgreSQL s'il ne l'a pas deja fait
pour toi).

```bash
npm ci
npm start
```

Ouvre `http://localhost:4200`, connecte-toi avec le compte admin, puis
teste la creation d'un eleve et d'un employe depuis l'interface.

## A savoir expliquer

La structure Angular standalone (pas de NgModule), le lazy loading des
routes (`loadComponent`), l'intercepteur JWT (`core/interceptors/jwt.interceptor.ts`)
qui ajoute le token a chaque requete, et les guards (`authGuard`,
`roleGuard`, `changePasswordGuard`).
