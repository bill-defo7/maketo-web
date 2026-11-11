# Maketo — front (React + Vite + Tailwind, PWA)

## Lancer en développement

```bash
npm install
npm run dev
```

Ouvre http://localhost:5173. L'API Spring Boot doit tourner sur le port 8081 (profil `dev`) : Vite relaie `/api` et `/fichiers` vers elle.

Pour tester sur ton téléphone (même wifi) : `npm run dev -- --host`, puis ouvre l'adresse « Network » affichée.

## Construire pour la production

```bash
npm run build      # crée dist/
npm run preview    # teste la version construite (PWA installable)
```

## Organisation

- `src/api/` : client HTTP (jeton en mémoire, rafraîchissement automatique) et routes de l'API
- `src/auth/` : session de l'utilisateur, routes protégées
- `src/components/` : composants réutilisables (cartes, barre du bas, champs…)
- `src/pages/` : un fichier par écran de l'appli étudiante
- `src/admin/` : l'espace administrateur (`/admin`, réservé au rôle ADMIN)
- `src/hooks/` : favoris, portefeuille
- `tailwind.config.js` : couleurs et polices Maketo
