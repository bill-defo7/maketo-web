import { createContext, useContext, useEffect, useState } from 'react';
import { stockage } from '../utils/stockage.js';
import Icone from './Icone.jsx';

const CLE = 'maketo:theme';
const ThemeContext = createContext({ mode: 'clair', sombre: false, setMode: () => {} });

/** Thème clair par défaut. "sombre" force le mode nuit ; "auto" suit le réglage du téléphone. */
export function ThemeProvider({ children }) {
  const [mode, setModeEtat] = useState(() => stockage.lire(CLE) || 'clair');
  const [sombre, setSombre] = useState(false);

  useEffect(() => {
    const requete = window.matchMedia('(prefers-color-scheme: dark)');
    const appliquer = () => {
      const sombre = mode === 'sombre' || (mode === 'auto' && requete.matches);
      setSombre(sombre);
      document.documentElement.classList.toggle('dark', sombre);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', sombre ? '#120E0C' : '#1A1411');
    };
    appliquer();
    requete.addEventListener('change', appliquer);
    return () => requete.removeEventListener('change', appliquer);
  }, [mode]);

  const setMode = (nouveau) => {
    stockage.ecrire(CLE, nouveau);
    setModeEtat(nouveau);
  };

  return <ThemeContext.Provider value={{ mode, sombre, setMode }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

/** Sélecteur Clair / Sombre / Auto. */
export function ChoixTheme({ className = '' }) {
  const { mode, setMode } = useTheme();
  const options = [['clair', 'Clair'], ['sombre', 'Sombre'], ['auto', 'Auto']];
  return (
    <div role="radiogroup" aria-label="Apparence" className={`grid grid-cols-3 gap-1 rounded-full bg-sable p-1 ${className}`}>
      {options.map(([cle, libelle]) => (
        <button key={cle} type="button" role="radio" aria-checked={mode === cle} onClick={() => setMode(cle)}
          className={`h-10 rounded-full text-sm ${mode === cle ? 'bg-surface font-extrabold text-encre shadow-sm' : 'font-bold text-gris'}`}>
          {libelle}
        </button>
      ))}
    </div>
  );
}

/** Bouton soleil / lune toujours visible dans l'en-tête : bascule clair <-> sombre. */
export function BoutonTheme({ surFondSombre = false, className = '' }) {
  const { sombre, setMode } = useTheme();
  const libelle = sombre ? 'Passer en mode clair' : 'Passer en mode sombre';
  return (
    <button type="button" onClick={() => setMode(sombre ? 'clair' : 'sombre')} aria-label={libelle} title={libelle}
      className={`flex h-11 w-11 flex-none items-center justify-center rounded-full ${surFondSombre ? 'border border-white/30 text-white' : 'border border-bordure bg-surface text-encre'} ${className}`}>
      <Icone nom={sombre ? 'soleil' : 'lune'} taille={20} />
    </button>
  );
}
