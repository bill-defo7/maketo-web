import Icone from './Icone.jsx';
import { useFavoris } from '../hooks/useFavoris.js';

export default function BoutonFavori({ annonceId, taille = 'petit' }) {
  const { estFavori, basculer } = useFavoris();
  const actif = estFavori(annonceId);
  const dimension = taille === 'petit' ? 'h-9 w-9' : 'h-11 w-11';
  return (
    <button type="button" aria-pressed={actif} aria-label={actif ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); basculer(annonceId); }}
      className={`${dimension} flex items-center justify-center rounded-full bg-white/95 ${actif ? 'text-[#C2410C]' : 'text-noir'}`}>
      <Icone nom="coeur" taille={taille === 'petit' ? 17 : 20} plein={actif} />
    </button>
  );
}
