import { Link } from 'react-router-dom';

/** Logo Maketo : "ma" orange, "ke" blanc (ou encre sur fond clair), "to" pêche. */
export default function Logo({ taille = 28, surFondClair = false, lien = true }) {
  const contenu = (
    <span className="font-logo font-bold italic leading-none tracking-[-.01em]" style={{ fontSize: taille }}>
      <span className="text-brand-logo">ma</span>
      <span className={surFondClair ? 'text-encre' : 'text-white'}>ke</span>
      <span className="text-brand-peche">to</span>
    </span>
  );
  return lien ? <Link to="/" aria-label="Maketo, accueil">{contenu}</Link> : contenu;
}
