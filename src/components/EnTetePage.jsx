import { useNavigate } from 'react-router-dom';
import Icone from './Icone.jsx';

/** En-tête des pages secondaires : bouton retour (historique ou page de repli) + titre. */
export default function EnTetePage({ titre, repli = '/', action, icone = 'retour' }) {
  const navigate = useNavigate();
  const retour = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate(repli));
  return (
    <header className="flex items-center justify-between gap-3 px-4 pb-2 pt-5">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={retour} aria-label={icone === 'fermer' ? 'Fermer' : 'Retour'}
          className="btn-rond flex-none border border-bordure bg-surface text-encre">
          <Icone nom={icone} epaisseur={2.2} />
        </button>
        <h1 className="truncate font-display text-xl font-extrabold tracking-[-.03em]">{titre}</h1>
      </div>
      {action}
    </header>
  );
}
