import { Link } from 'react-router-dom';
import Photo from './Photo.jsx';
import BoutonFavori from './BoutonFavori.jsx';
import Icone from './Icone.jsx';
import { useApparition } from './Apparait.jsx';
import { estMessage, formatPrix, LIBELLES_ETAT, tempsRelatif } from '../utils/format.js';

/** Carte en grille (liste principale). Une petite annonce montre son message à la place du prix. */
export function CarteAnnonce({ annonce, ordre = 0 }) {
  const message = estMessage(annonce);
  const ref = useApparition();
  return (
    <Link ref={ref} to={`/annonces/${annonce.id}`} style={ordre ? { transitionDelay: `${(ordre % 5) * 70}ms` } : undefined}
      className="apparition block overflow-hidden rounded-[20px] border border-trait bg-surface text-encre">
      <div className="relative">
        {message && !annonce.photoPrincipale ? (
          <div className="flex h-[150px] flex-col bg-nuit p-3.5 pt-11 text-white">
            <p className="line-clamp-5 text-[13px] leading-snug text-doux">{annonce.extrait}</p>
          </div>
        ) : (
          <Photo src={annonce.photoPrincipale} alt={annonce.titre} className="h-[150px] w-full" />
        )}
        <span className="absolute right-2.5 top-2.5"><BoutonFavori annonceId={annonce.id} /></span>
        {annonce.boostee && <span className="absolute left-2.5 top-2.5 rounded-full bg-brand px-2.5 py-1 text-[11px] font-extrabold text-white">À la une</span>}
        {message && !annonce.boostee && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-brand-vif px-2.5 py-1 text-[11px] font-extrabold text-noir">
            <Icone nom="message" taille={12} epaisseur={2.4} />Petite annonce
          </span>
        )}
      </div>
      <div className="px-3 pb-3 pt-2.5">
        {message ? (
          <>
            <p className="line-clamp-2 text-sm font-bold leading-snug">{annonce.titre}</p>
            <p className="mt-0.5 truncate text-xs text-gris">{tempsRelatif(annonce.dateCreation)}{annonce.lieu ? ` · ${annonce.lieu}` : ''}</p>
          </>
        ) : (
          <>
            <p className="text-[17px] font-extrabold tracking-[-.01em] text-brand">{formatPrix(annonce.prix, annonce.prixADebattre)}</p>
            <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug">{annonce.titre}</p>
            <p className="mt-0.5 truncate text-xs text-gris">{LIBELLES_ETAT[annonce.etat]}{annonce.lieu ? ` · ${annonce.lieu}` : ''}</p>
          </>
        )}
      </div>
    </Link>
  );
}

/** Carte large du carrousel "À la une". */
export function CarteUne({ annonce, ordre = 0 }) {
  const message = estMessage(annonce);
  const ref = useApparition();
  return (
    <Link ref={ref} to={`/annonces/${annonce.id}`} style={ordre ? { transitionDelay: `${(ordre % 5) * 70}ms` } : undefined}
      className="apparition block w-[220px] flex-none snap-start overflow-hidden rounded-[22px] bg-surface text-encre shadow-carte">
      <div className="relative">
        {message && !annonce.photoPrincipale ? (
          <div className="h-[170px] bg-nuit p-4 pt-12"><p className="line-clamp-5 text-sm leading-snug text-doux">{annonce.extrait}</p></div>
        ) : (
          <Photo src={annonce.photoPrincipale} alt={annonce.titre} sombre className="h-[170px] w-full" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-extrabold text-white">À la une</span>
        <span className="absolute right-3 top-3"><BoutonFavori annonceId={annonce.id} /></span>
      </div>
      <div className="px-3.5 pb-3.5 pt-3">
        <p className="text-[19px] font-extrabold tracking-[-.01em] text-brand">{message ? 'Petite annonce' : formatPrix(annonce.prix, annonce.prixADebattre)}</p>
        <p className="mt-1 truncate text-[15px] font-bold">{annonce.titre}</p>
        <p className="mt-1 truncate text-[13px] text-gris">{message ? tempsRelatif(annonce.dateCreation) : LIBELLES_ETAT[annonce.etat]}{annonce.lieu ? ` · ${annonce.lieu}` : ''}</p>
      </div>
    </Link>
  );
}

/** Carte compacte du fil "Petites annonces" de l'accueil. */
export function CarteMessage({ annonce, ordre = 0 }) {
  const ref = useApparition();
  return (
    <Link ref={ref} to={`/annonces/${annonce.id}`} style={ordre ? { transitionDelay: `${(ordre % 5) * 70}ms` } : undefined}
      className="apparition flex w-[270px] flex-none snap-start flex-col rounded-[22px] border border-trait bg-surface p-4 text-encre">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-clair px-2.5 py-1 text-[11px] font-extrabold text-brand-fonce">
        <Icone nom="message" taille={12} epaisseur={2.4} />Petite annonce
      </span>
      <p className="mt-3 line-clamp-4 flex-1 text-[15px] leading-snug">{annonce.extrait}</p>
      <p className="mt-3 text-xs text-gris">{tempsRelatif(annonce.dateCreation)}{annonce.lieu ? ` · ${annonce.lieu}` : ''}</p>
    </Link>
  );
}

export function SqueletteCarte() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-trait bg-surface">
      <div className="squelette h-[150px] rounded-none" />
      <div className="space-y-2 p-3"><div className="squelette h-4 w-16" /><div className="squelette h-3.5 w-full" /><div className="squelette h-3 w-20" /></div>
    </div>
  );
}
