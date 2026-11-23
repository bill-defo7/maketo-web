import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Logo from './Logo.jsx';
import Icone from './Icone.jsx';
import { initiales } from '../utils/format.js';
import { BoutonTheme } from './Theme.jsx';
import { BoutonLangue } from '../i18n/Langue.jsx';

const lien = ({ isActive }) =>
  `whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-bold lg:px-4 ${isActive ? 'bg-brand-clair text-brand-fonce' : 'text-texte2 hover:bg-sable'}`;

/** Sur tablette et ordinateur, la barre du bas est remplacée par cette barre en haut. */
export default function EnTeteBureau() {
  const { utilisateur, pret } = useAuth();
  return (
    <header className="sticky top-0 z-40 hidden border-b border-trait bg-surface/95 backdrop-blur md:block">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3 lg:gap-6">
        <Logo surFondClair />
        <nav aria-label="Navigation principale" className="flex gap-0.5 lg:gap-1">
          <NavLink to="/" end className={lien}>Accueil</NavLink>
          <NavLink to="/recherche" className={lien}>Rechercher</NavLink>
          <NavLink to="/favoris" className={lien}>Favoris</NavLink>
          <NavLink to="/mes-annonces" className={lien}>Mes annonces</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:gap-3">
          <BoutonLangue />
          <BoutonTheme />
          <Link to="/vendre" className="btn-primaire h-11 px-5 text-sm"><Icone nom="plus" taille={18} epaisseur={2.6} />Publier</Link>
          {!pret ? (
            <span aria-label="Chargement" className="h-11 w-11 animate-pulse rounded-full bg-sable" />
          ) : utilisateur ? (
            <Link to="/compte" aria-label="Mon compte" className="flex h-11 w-11 items-center justify-center rounded-full bg-nuit font-display text-sm font-extrabold text-brand-peche">
              {initiales(utilisateur.prenom, utilisateur.nom)}
            </Link>
          ) : (
            <Link to="/connexion" className="btn-contour h-11 px-5 text-sm">Se connecter</Link>
          )}
        </div>
      </div>
    </header>
  );
}
