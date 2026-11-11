import { NavLink } from 'react-router-dom';
import Icone from './Icone.jsx';

const lienClasse = ({ isActive }) =>
  `flex flex-col items-center gap-1 text-xs ${isActive ? 'font-extrabold text-brand' : 'font-bold text-gris'}`;

/** Barre du bas façon Vinted : le bouton "Vendre" au centre est l'action principale de l'appli. */
export default function BarreNavigation() {
  return (
    <nav aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 md:hidden items-end border-t border-trait bg-surface px-1 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
      <NavLink to="/" end className={lienClasse}><Icone nom="accueil" taille={22} />Accueil</NavLink>
      <NavLink to="/recherche" className={lienClasse}><Icone nom="recherche" taille={22} />Chercher</NavLink>
      <NavLink to="/vendre" className="flex flex-col items-center gap-1 text-xs font-extrabold text-encre">
        <span className="-mt-8 flex h-[58px] w-[58px] items-center justify-center rounded-full border-4 border-creme bg-brand text-white shadow-bouton">
          <Icone nom="plus" taille={24} epaisseur={2.6} />
        </span>
        Publier
      </NavLink>
      <NavLink to="/favoris" className={lienClasse}><Icone nom="coeur" taille={22} />Favoris</NavLink>
      <NavLink to="/compte" className={lienClasse}><Icone nom="compte" taille={22} />Compte</NavLink>
    </nav>
  );
}
