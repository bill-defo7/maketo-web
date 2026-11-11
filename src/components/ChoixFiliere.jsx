import { useId } from 'react';
import { NIVEAUX, filieresDuNiveau } from '../utils/filieres.js';

/** Niveau puis filière : la liste des filières dépend du niveau (troncs communs ou spécialisations). */
export default function ChoixFiliere({ niveau, filiere, onChange, erreurs = {} }) {
  const idNiveau = useId();
  const idFiliere = useId();
  const filieres = filieresDuNiveau(niveau);

  const changerNiveau = (nouveau) => {
    const garder = filieresDuNiveau(nouveau).includes(filiere) ? filiere : '';
    onChange({ niveau: nouveau, filiere: garder });
  };

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div>
        <label htmlFor={idNiveau} className="etiquette">Niveau</label>
        <select id={idNiveau} value={niveau} onChange={(e) => changerNiveau(e.target.value)}
          className={`champ appearance-none bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10 ${erreurs.niveau ? 'border-red-600' : ''}`}
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B5F57' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")" }}>
          <option value="">Choisir</option>
          {NIVEAUX.map((n) => <option key={n} value={n}>Niveau {n}</option>)}
        </select>
        {erreurs.niveau && <p className="mt-1.5 text-sm font-semibold text-red-700">{erreurs.niveau}</p>}
      </div>
      <div>
        <label htmlFor={idFiliere} className="etiquette">Filière</label>
        <select id={idFiliere} value={filiere} disabled={!niveau} onChange={(e) => onChange({ niveau, filiere: e.target.value })}
          className={`champ appearance-none bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10 disabled:opacity-50 ${erreurs.filiere ? 'border-red-600' : ''}`}
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B5F57' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")" }}>
          <option value="">{niveau ? 'Choisir' : "D'abord le niveau"}</option>
          {filieres.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        {erreurs.filiere && <p className="mt-1.5 text-sm font-semibold text-red-700">{erreurs.filiere}</p>}
      </div>
    </div>
  );
}
