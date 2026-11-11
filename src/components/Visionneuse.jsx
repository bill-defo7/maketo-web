import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icone from './Icone.jsx';

/**
 * Photos en plein écran, ENTIÈRES (jamais recadrées) : on glisse pour passer à la suivante,
 * on zoome avec deux doigts, on ferme avec ×, Échap ou le bouton retour du téléphone.
 */
export default function Visionneuse({ photos, indexDepart = 0, onFermer }) {
  const rail = useRef(null);
  const [index, setIndex] = useState(indexDepart);

  useEffect(() => {
    rail.current?.scrollTo({ left: indexDepart * rail.current.clientWidth, behavior: 'instant' });
    document.body.style.overflow = 'hidden';
    // Le bouton "retour" d'Android ferme la visionneuse au lieu de quitter la page
    window.history.pushState({ ...window.history.state, visionneuse: true }, '');
    const surRetour = () => onFermer();
    const surTouche = (e) => {
      if (e.key === 'Escape') window.history.back();
      if (e.key === 'ArrowRight') aller(1);
      if (e.key === 'ArrowLeft') aller(-1);
    };
    window.addEventListener('popstate', surRetour);
    document.addEventListener('keydown', surTouche);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('popstate', surRetour);
      document.removeEventListener('keydown', surTouche);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const aller = (pas) => {
    const r = rail.current;
    if (r) r.scrollBy({ left: pas * r.clientWidth, behavior: 'smooth' });
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Photos en plein écran" className="fixed inset-0 z-[70] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 pb-2 pt-[max(16px,env(safe-area-inset-top))] text-white">
        <span className="text-sm font-bold" aria-live="polite">{index + 1} / {photos.length}</span>
        <button type="button" onClick={() => window.history.back()} aria-label="Fermer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15"><Icone nom="fermer" epaisseur={2.4} /></button>
      </div>
      <div ref={rail} onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="defilement flex flex-1 snap-x snap-mandatory overflow-x-auto">
        {photos.map((p, i) => (
          <div key={p.id} className="flex h-full w-full flex-none snap-center items-center justify-center p-2" style={{ touchAction: 'pan-x pinch-zoom' }}>
            <img src={p.url} alt={`Photo ${i + 1} sur ${photos.length}`} className="max-h-full max-w-full object-contain" />
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <>
          <button type="button" onClick={() => aller(-1)} aria-label="Photo précédente" disabled={index === 0}
            className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white disabled:opacity-30 md:flex"><Icone nom="retour" epaisseur={2.4} /></button>
          <button type="button" onClick={() => aller(1)} aria-label="Photo suivante" disabled={index === photos.length - 1}
            className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white disabled:opacity-30 md:flex"><Icone nom="suivant" epaisseur={2.4} /></button>
        </>
      )}
      <p className="pb-[max(14px,env(safe-area-inset-bottom))] text-center text-xs text-white/60">Glisse pour changer de photo · pince pour zoomer</p>
    </div>,
    document.body
  );
}
