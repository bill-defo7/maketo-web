import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

/** Panneau qui monte du bas de l'écran (geste naturel sur mobile). Fermeture : Échap, fond ou bouton. */
export default function FeuilleBas({ ouvert, onFermer, titre, children }) {
  const idTitre = useId();
  const panneau = useRef(null);

  useEffect(() => {
    if (!ouvert) return undefined;
    const avant = document.activeElement;
    panneau.current?.focus();
    const touche = (e) => { if (e.key === 'Escape') onFermer(); };
    document.addEventListener('keydown', touche);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', touche);
      document.body.style.overflow = '';
      avant?.focus?.();
    };
  }, [ouvert, onFermer]);

  if (!ouvert) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center md:p-6" onClick={onFermer}>
      <div ref={panneau} role="dialog" aria-modal="true" aria-labelledby={idTitre} tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[28px] md:rounded-[28px] bg-creme px-5 pb-[max(22px,env(safe-area-inset-bottom))] pt-3 outline-none">
        <div aria-hidden="true" className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-bordure" />
        <h2 id={idTitre} className="font-display text-xl font-extrabold tracking-[-.02em]">{titre}</h2>
        {children}
      </div>
    </div>,
    document.body
  );
}

/** Demande de confirmation pour les actions importantes (supprimer, marquer vendu, payer…). */
export function Confirmer({ ouvert, titre, texte, libelle, danger = false, enCours = false, onConfirmer, onFermer }) {
  return (
    <FeuilleBas ouvert={ouvert} titre={titre} onFermer={onFermer}>
      {texte && <p className="mt-2 text-[15px] leading-relaxed text-texte2">{texte}</p>}
      <div className="mt-6 flex flex-col gap-2.5">
        <button type="button" onClick={onConfirmer} disabled={enCours}
          className={danger ? 'btn w-full bg-red-700 text-white' : 'btn-primaire w-full'}>
          {enCours ? 'Un instant…' : libelle}
        </button>
        <button type="button" onClick={onFermer} className="btn-contour w-full">Annuler</button>
      </div>
    </FeuilleBas>
  );
}
