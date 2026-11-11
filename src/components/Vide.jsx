import { Link } from 'react-router-dom';

/** État vide ou erreur, toujours avec une action pour ne jamais laisser l'étudiant bloqué. */
export default function Vide({ titre, texte, action, lien, onAction }) {
  return (
    <div className="mx-4 my-8 rounded-3xl border border-trait bg-surface px-6 py-10 text-center">
      <p className="font-display text-xl font-extrabold">{titre}</p>
      {texte && <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gris">{texte}</p>}
      {action && lien && <Link to={lien} className="btn-primaire mt-6 h-12 text-sm">{action}</Link>}
      {action && onAction && <button type="button" onClick={onAction} className="btn-primaire mt-6 h-12 text-sm">{action}</button>}
    </div>
  );
}
