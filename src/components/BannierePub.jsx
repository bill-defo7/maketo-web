import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { publicitesApi } from '../api/services.js';

/**
 * Bannières des boutiques d'Ambam. Si la publicité pointe vers une annonce Maketo,
 * le clic ouvre l'annonce dans l'appli (galerie de photos, description, bouton WhatsApp).
 */
export default function BannierePub() {
  const navigate = useNavigate();
  const { data: pubs = [] } = useQuery({ queryKey: ['publicites'], queryFn: publicitesApi.actives, staleTime: 600_000 });
  if (pubs.length === 0) return null;

  const ouvrir = (pub) => {
    publicitesApi.clic(pub.id).catch(() => {});
    if (!pub.lien) return;
    if (pub.lien.startsWith(window.location.origin)) navigate(pub.lien.slice(window.location.origin.length));
    else window.open(pub.lien, '_blank', 'noopener');
  };

  return (
    <section aria-label="Publicités" className="defilement flex snap-x gap-3 overflow-x-auto px-4 pt-6 md:px-6">
      {pubs.map((pub) => (
        <button key={pub.id} type="button" onClick={() => ouvrir(pub)}
          className="relative w-[85%] flex-none snap-center overflow-hidden rounded-[22px] bg-sable text-left md:w-[48%]">
          <img src={pub.imageUrl} alt={pub.titre || pub.annonceur} loading="lazy" className="h-36 w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-extrabold text-noir">Sponsorisé · {pub.annonceur}</span>
          {pub.titre && (
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 text-sm font-extrabold text-white">{pub.titre}</span>
          )}
        </button>
      ))}
    </section>
  );
}
