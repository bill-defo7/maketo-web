/** Icônes au trait (même style que la maquette). Décoratives par défaut : le texte du bouton porte le sens. */
const TRACES = {
  accueil: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  recherche: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  coeur: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  compte: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  retour: <path d="M15 6l-6 6 6 6" />,
  fleche: <path d="M5 12h14M13 6l6 6-6 6" />,
  fermer: <path d="M6 6l12 12M18 6L6 18" />,
  partager: <path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />,
  whatsapp: <path d="M4 20l1.3-4A8 8 0 1 1 8.5 19z" />,
  telephone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  bouclier: <><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  filtres: <path d="M4 6h16M7 12h10M10 18h4" />,
  valide: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  oeil: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  photo: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  message: <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9h8M8 12h5" /></>,
  chemise: <path d="M8 3l-5 3 2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0z" />,
  etincelle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />,
  couverts: <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10" />,
  smartphone: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></>,
  livre: <path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z" />,
  outil: <path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 1.3-1.3a4 4 0 0 0-5-5L5 13l-2-2 8-8 2 2z" />,
  boite: <><path d="M3 7l9-4 9 4v10l-9 4-9-4z" /><path d="M3 7l9 4 9-4M12 11v10" /></>,
  agrandir: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  suivant: <path d="M9 6l6 6-6 6" />,
  soleil: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  lune: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
};

/** Icône associée à chaque catégorie (par son slug). */
export const ICONES_CATEGORIES = {
  'petites-annonces': 'message', vetements: 'chemise', beaute: 'etincelle', nourriture: 'couverts',
  electronique: 'smartphone', livres: 'livre', logement: 'accueil', services: 'outil', divers: 'boite'
};

export default function Icone({ nom, taille = 20, epaisseur = 2, plein = false, className = '' }) {
  return (
    <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 24 24" className={className}
      fill={plein ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={epaisseur}
      strokeLinecap="round" strokeLinejoin="round">
      {TRACES[nom]}
    </svg>
  );
}
