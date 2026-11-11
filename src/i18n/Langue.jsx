import { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';
import { stockage } from '../utils/stockage.js';
import { creerTraducteur } from './traducteur.js';

const CLE = 'maketo:langue';
const LangueContext = createContext({ langue: 'fr', setLangue: () => {} });

/** Langue de l'interface : français par défaut, anglais au choix (mémorisé sur le téléphone). */
export function LangueProvider({ children }) {
  const [langue, setLangueEtat] = useState(() => (stockage.lire(CLE) === 'en' ? 'en' : 'fr'));
  const traducteur = useRef(null);

  useLayoutEffect(() => {
    traducteur.current ??= creerTraducteur(document.body);
    document.documentElement.lang = langue;
    if (langue === 'en') traducteur.current.demarrer();
    else traducteur.current.arreter();
  }, [langue]);

  const setLangue = (nouvelle) => {
    stockage.ecrire(CLE, nouvelle);
    setLangueEtat(nouvelle);
  };

  return <LangueContext.Provider value={{ langue, setLangue }}>{children}</LangueContext.Provider>;
}

export function useLangue() {
  return useContext(LangueContext);
}

/** Bouton FR / EN : affiche la langue vers laquelle on bascule. */
export function BoutonLangue({ surFondSombre = false, className = '' }) {
  const { langue, setLangue } = useLangue();
  const versAnglais = langue === 'fr';
  return (
    <button type="button" translate="no" onClick={() => setLangue(versAnglais ? 'en' : 'fr')}
      aria-label={versAnglais ? 'Read in English' : 'Lire en français'} title={versAnglais ? 'English' : 'Français'}
      className={`flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-[13px] font-extrabold tracking-wide ${surFondSombre ? 'border border-white/30 text-white' : 'border border-bordure bg-surface text-encre'} ${className}`}>
      {versAnglais ? 'EN' : 'FR'}
    </button>
  );
}
