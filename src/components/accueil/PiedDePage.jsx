import { Link } from 'react-router-dom';
import Logo from '../Logo.jsx';
import Icone from '../Icone.jsx';
import { ChoixTheme } from '../Theme.jsx';

const CONTACT = import.meta.env.VITE_CONTACT_WHATSAPP; // ex. 6XXXXXXXX (laisser vide pour masquer)

export default function PiedDePage() {
  return (
    <footer className="mt-14 rounded-t-[32px] bg-nuit px-5 pb-28 pt-10 md:mb-8 md:pb-10 text-white md:mx-6 md:rounded-[32px] md:px-12">
      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo taille={34} />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-doux">Le marché des étudiants de l'ESTLC. Vends, achète et échange entre étudiants vérifiés.</p>
          {CONTACT && (
            <a href={`https://wa.me/237${CONTACT}`} target="_blank" rel="noopener noreferrer"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-sm font-bold text-white">
              <Icone nom="whatsapp" taille={18} />Contacter l'équipe
            </a>
          )}
        </div>
        <nav aria-label="Liens utiles">
          <p className="text-xs font-extrabold uppercase tracking-[.14em] text-brand-peche">Maketo</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li><Link to="/vendre" className="text-doux hover:text-white">Publier une annonce</Link></li>
            <li><Link to="/?type=MESSAGE" className="text-doux hover:text-white">Petites annonces</Link></li>
            <li><Link to="/regles" className="text-doux hover:text-white">Règles du campus</Link></li>
            <li><Link to="/confidentialite" className="text-doux hover:text-white">Confidentialité</Link></li>
          </ul>
        </nav>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.14em] text-brand-peche">Apparence</p>
          <ChoixTheme className="mt-3 max-w-[260px] bg-white/10 [&_button]:text-doux [&_button[aria-checked=true]]:bg-white [&_button[aria-checked=true]]:text-noir" />
        </div>
      </div>
      <p className="mt-10 border-t border-white/10 pt-5 text-xs text-[#CDBFB4]">© {new Date().getFullYear()} Maketo · Campus ESTLC, Ambam</p>
    </footer>
  );
}
