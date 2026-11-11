import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { annoncesApi } from '../api/services.js';
import Icone from '../components/Icone.jsx';
import Photo from '../components/Photo.jsx';
import { formatPrix, joursRestants } from '../utils/format.js';

export default function Publiee() {
  const { id } = useParams();
  const { data: annonce } = useQuery({ queryKey: ['annonce', id, true], queryFn: () => annoncesApi.detail(id) });

  const lien = `${window.location.origin}/annonces/${id}`;
  const petite = annonce?.type === 'MESSAGE';
  const texte = !annonce ? lien
    : petite ? `${annonce.titre} — à lire sur Maketo : ${lien}`
    : `${annonce.titre} à ${formatPrix(annonce.prix, annonce.prixADebattre)} sur Maketo : ${lien}`;
  const jours = annonce ? joursRestants(annonce.dateExpiration) : 7;

  return (
    <main className="flex min-h-screen flex-col bg-nuit px-5 text-white md:mx-auto md:my-10 md:min-h-0 md:max-w-md md:rounded-[28px] md:px-8 md:py-6">
      <div className="flex flex-1 flex-col items-center justify-center pt-10 text-center">
        <span className="flex h-[92px] w-[92px] items-center justify-center rounded-full bg-brand shadow-[0_0_0_12px_rgba(252,92,1,.15),0_0_0_26px_rgba(252,92,1,.07)]">
          <Icone nom="valide" taille={44} epaisseur={2.6} />
        </span>
        <h1 className="mt-9 font-display text-[30px] font-extrabold leading-[1.05] tracking-[-.04em]">{petite ? 'Ton message est' : 'Ton annonce est'} <span className="text-brand-vif">en ligne&nbsp;!</span></h1>
        <p className="mt-3 max-w-[300px] text-[15px] leading-relaxed text-doux">Les étudiants peuvent la voir dès maintenant. Elle reste visible {jours} jour{jours > 1 ? 's' : ''}.</p>

        {annonce && (
          <Link to={`/annonces/${id}`} className="mt-6 flex w-full items-center gap-3 rounded-[20px] border border-white/15 bg-white/[.06] p-3 text-left text-white">
            <Photo src={annonce.photos[0]?.url} alt="" sombre className="h-16 w-16 flex-none rounded-[14px]" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-extrabold">{annonce.titre}</span>
              <span className="mt-0.5 block text-[17px] font-extrabold text-brand-peche">{petite ? 'Petite annonce' : formatPrix(annonce.prix, annonce.prixADebattre)}</span>
            </span>
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-2.5 pb-[max(24px,env(safe-area-inset-bottom))] pt-8">
        <a href={`https://wa.me/?text=${encodeURIComponent(texte)}`} target="_blank" rel="noopener noreferrer" className="btn-vif w-full">
          <Icone nom="whatsapp" />Partager dans mes groupes WhatsApp
        </a>
        <Link to="/mes-annonces" className="btn w-full border border-white/35 text-white">Voir mes annonces</Link>
        <Link to="/" className="py-3 text-center text-sm font-bold text-doux">Retour à l'accueil</Link>
      </div>
    </main>
  );
}
