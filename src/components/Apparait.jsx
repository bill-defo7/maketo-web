import { useEffect, useRef } from 'react';

/**
 * Animation d'apparition au défilement : l'élément glisse et apparaît quand il entre à l'écran.
 * Un seul IntersectionObserver pour toute l'appli (léger, même avec 100 cartes).
 * Sans JavaScript, sur un vieux navigateur ou avec « réduire les animations », tout reste visible.
 */
let observateur = null;
function obtenirObservateur() {
  if (observateur || typeof IntersectionObserver === 'undefined') return observateur;
  observateur = new IntersectionObserver((entrees) => {
    for (const e of entrees) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observateur.unobserve(e.target);
      }
    }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  return observateur;
}

export function useApparition() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const obs = obtenirObservateur();
    if (!obs) { el.classList.add('visible'); return undefined; }
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  return ref;
}

/** `ordre` décale légèrement chaque élément d'une même rangée (effet cascade). */
export default function Apparait({ as: Balise = 'div', ordre = 0, className = '', style, children, ...reste }) {
  const ref = useApparition();
  return (
    <Balise ref={ref} className={`apparition ${className}`} style={ordre ? { transitionDelay: `${(ordre % 5) * 70}ms`, ...style } : style} {...reste}>
      {children}
    </Balise>
  );
}
