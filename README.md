# MyBusiness — Onze+ (v2, Next.js)

Reecriture propre de l'appli en Next.js 16 / React 19, avec une vraie architecture
(pages, composants, middleware d'auth) au lieu du fichier HTML unique de la v1.
Meme projet Supabase, memes tables (mybusiness_*), aucune donnee perdue.

## Ce qui a ete migre (fonctionnel des maintenant)

- Connexion / inscription (/login) - vraie auth Supabase, creation automatique
  du club a l'inscription, upload de logo
- Session persistante - middleware qui protege toutes les routes et garde la
  session active entre les visites
- Dashboard (/dashboard) - stats, cotisations par categorie, donut, rappels
  (ajout/coche en direct), apercu documents, raccourcis
- Joueurs & Staff (/joueurs) - liste groupee par categorie, recherche, filtre,
  ajout de joueur ou de staff (avec diplome de coach), fiche detail

## Pas encore migre

/horaire, /documents, /club, /parametres, /cotisations affichent un ecran
temporaire "en cours de migration" - la logique existe deja dans la v1
(mybusiness.html), il reste a la porter avec la meme architecture que /joueurs.
Dites-moi quand vous voulez qu'on continue et je les fais un par un.

## Demarrer en local

    npm install
    npm run dev

Ouvre http://localhost:3000 - tu es redirige vers /login automatiquement.

Les cles Supabase sont deja dans .env.local (non versionne, donc jamais pousse
sur GitHub). Si tu changes de projet Supabase un jour, modifie ces deux lignes :

    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...

## Deployer sur Vercel

1. Pousse ce dossier sur un repo GitHub (ne commit jamais .env.local, il est
   deja dans .gitignore)
2. Sur vercel.com -> Add New -> Project -> importe le repo
3. Vercel detecte Next.js automatiquement, rien a configurer cote build
4. Avant de deployer, ajoute les variables d'environnement dans l'onglet
   Environment Variables du projet Vercel :
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
5. Deploy

## Structure du projet

    src/
      app/
        login/page.js            -> connexion / inscription
        (app)/layout.js          -> verifie l'auth cote serveur, charge le club
        (app)/dashboard/page.js
        (app)/joueurs/page.js
        (app)/horaire/...          -> a migrer
        (app)/documents/...        -> a migrer
        (app)/club/...              -> a migrer
        (app)/parametres/...        -> a migrer
        (app)/cotisations/...       -> a migrer
      components/
        AppShell.jsx              -> sidebar + topbar + deconnexion
        AddPersonModal.jsx         -> formulaire joueur/staff
        PersonDrawer.jsx           -> fiche detail
        Donut.jsx                  -> graphique reutilisable
        Modal.jsx                  -> modale generique
      lib/
        supabase/client.js         -> client Supabase (navigateur)
        supabase/server.js         -> client Supabase (composants serveur)
        supabase/middleware.js     -> logique de protection des routes
        domain.js                   -> constantes/helpers metier partages
        club-context.js             -> contexte React pour le club courant
    middleware.js                  -> point d'entree du middleware Next.js

## Pourquoi c'est plus "propre" que la v1

- Plus d'innerHTML - React echappe le texte automatiquement, donc plus de risque
  d'injection si un joueur a un caractere bizarre dans son nom
- Chaque page a sa propre URL (/joueurs, /dashboard...) - navigateur, partage
  de lien, bouton retour, tout fonctionne normalement
- Cles Supabase en variables d'environnement, jamais commitees
- Code decoupe en composants reutilisables plutot qu'un fichier de 1400 lignes
- Le middleware protege automatiquement toute nouvelle page ajoutee sous (app)/
  - pas besoin d'y penser a chaque fois
