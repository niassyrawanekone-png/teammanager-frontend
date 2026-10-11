# Team Manager — interface web

Application React 19 servie par Vite 8. Le frontend communique avec l’API FastAPI du dossier `backend`.

## Configuration locale

Node.js 20.19+ ou 22.12+ est requis par Vite 8. Installer les dépendances verrouillées puis lancer le serveur de développement :

```sh
npm ci
npm run dev
```

L’API par défaut est `https://teammanager-fl0y.onrender.com`. Pour utiliser une autre API en développement, créer un fichier `.env.local` non versionné :

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Ne placer aucun secret dans une variable `VITE_*` : ces valeurs sont intégrées au code public du navigateur.

## Vérifications

```sh
npm run lint
npm run build
```

Le build est produit dans `dist/`. La configuration Vercel utilise `vercel.json` pour rediriger les routes de l’application vers `index.html`.

## Fonctionnalités

Les écrans de connexion, inscription, équipe, projets, tâches, discussions, notifications et assistant sont dans `src/pages`. L’espace d’administration globale est disponible aux comptes super administrateur via `/administration`; les autorisations effectives sont contrôlées par le backend.
