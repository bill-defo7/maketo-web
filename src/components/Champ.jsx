import { useId } from 'react';

/** Champ de formulaire accessible : libellé relié, message d'erreur annoncé aux lecteurs d'écran. */
export default function Champ({ label, erreur, prefixe, aide, className = '', ...props }) {
  const id = useId();
  const idErreur = `${id}-erreur`;
  return (
    <div className={className}>
      <label htmlFor={id} className="etiquette">{label}</label>
      {prefixe ? (
        <div className={`flex h-14 items-center gap-3 rounded-2xl border-[1.5px] bg-surface px-4 focus-within:border-brand ${erreur ? 'border-red-600' : 'border-bordure'}`}>
          <span className="font-extrabold text-gris">{prefixe}</span>
          <input id={id} aria-invalid={!!erreur} aria-describedby={erreur ? idErreur : undefined}
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none" {...props} />
        </div>
      ) : (
        <input id={id} aria-invalid={!!erreur} aria-describedby={erreur ? idErreur : undefined}
          className={`champ ${erreur ? 'border-red-600' : ''}`} {...props} />
      )}
      {aide && !erreur && <p className="mt-1.5 text-xs text-gris">{aide}</p>}
      {erreur && <p id={idErreur} className="mt-1.5 text-sm font-semibold text-red-700">{erreur}</p>}
    </div>
  );
}
