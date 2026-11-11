import { Link, Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

const SECTIONS = [
  ['', 'Tableau de bord'], ['inscriptions', 'Inscriptions'], ['utilisateurs', 'Utilisateurs'], ['moderation', 'Modération'],
  ['paiements', 'Paiements'], ['parametres', 'Paramètres'], ['categories', 'Catégories'], ['publicites', 'Publicités']
];

/** Espace admin : large sur ordinateur, utilisable sur téléphone. Réservé au rôle ADMIN (vérifié aussi par l'API). */
export default function AdminLayout() {
  const { utilisateur } = useAuth();
  if (utilisateur?.role !== 'ADMIN') return <Navigate to="/" replace />;

  return (
    <div translate="no" className="min-h-screen bg-creme">
      <header className="bg-nuit text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3"><Logo taille={26} /><span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-extrabold text-brand-peche">Admin</span></div>
          <Link to="/" className="text-sm font-bold text-doux">Retour à l'appli</Link>
        </div>
        <nav aria-label="Sections admin" className="defilement mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-3">
          {SECTIONS.map(([chemin, libelle]) => (
            <NavLink key={chemin} to={`/admin${chemin ? `/${chemin}` : ''}`} end
              className={({ isActive }) => `whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold ${isActive ? 'bg-brand text-white' : 'text-doux hover:bg-white/10'}`}>
              {libelle}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6"><Outlet /></main>
    </div>
  );
}

export function TitreAdmin({ titre, texte, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[26px] font-extrabold tracking-[-.03em]">{titre}</h1>
        {texte && <p className="mt-1 text-sm text-gris">{texte}</p>}
      </div>
      {action}
    </div>
  );
}

export function Pagination({ page, totalPages, onChanger }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <button type="button" disabled={page === 0} onClick={() => onChanger(page - 1)} className="btn-contour h-11 px-5 text-sm">Précédent</button>
      <span className="text-sm font-bold text-gris">Page {page + 1} / {totalPages}</span>
      <button type="button" disabled={page + 1 >= totalPages} onClick={() => onChanger(page + 1)} className="btn-contour h-11 px-5 text-sm">Suivant</button>
    </div>
  );
}

export function Onglets({ valeurs, actif, onChanger }) {
  return (
    <div role="tablist" className="mb-4 inline-flex gap-1 rounded-full bg-sable p-1">
      {valeurs.map(([cle, libelle]) => (
        <button key={cle || 'tous'} type="button" role="tab" aria-selected={actif === cle} onClick={() => onChanger(cle)}
          className={`h-10 whitespace-nowrap rounded-full px-4 text-sm ${actif === cle ? 'bg-surface font-extrabold shadow-sm' : 'font-bold text-gris'}`}>
          {libelle}
        </button>
      ))}
    </div>
  );
}
