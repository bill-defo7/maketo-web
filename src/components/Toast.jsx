import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(() => {});

/** Messages courts de confirmation ("Annonce renouvelée !"), annoncés aux lecteurs d'écran. */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const minuteur = useRef(null);

  const afficher = useCallback((texte, type = 'succes') => {
    clearTimeout(minuteur.current);
    setToast({ texte, type });
    minuteur.current = setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <ToastContext.Provider value={afficher}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
        {toast && (
          <p className={`pointer-events-auto max-w-sm rounded-full px-5 py-3 text-sm font-bold shadow-carte ${toast.type === 'erreur' ? 'bg-red-700 text-white' : 'bg-nuit text-white'}`}>
            {toast.texte}
          </p>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
