import { useInfiniteQuery } from '@tanstack/react-query';
import { favorisApi } from '../api/services.js';
import EnTetePage from '../components/EnTetePage.jsx';
import Vide from '../components/Vide.jsx';
import { CarteAnnonce, SqueletteCarte } from '../components/CarteAnnonce.jsx';

export default function Favoris() {
  const requete = useInfiniteQuery({
    queryKey: ['favoris', 'liste'],
    queryFn: ({ pageParam }) => favorisApi.lister(pageParam),
    initialPageParam: 0,
    getNextPageParam: (d) => (d.page + 1 < d.totalPages ? d.page + 1 : undefined)
  });
  const favoris = requete.data?.pages.flatMap((p) => p.contenu) ?? [];

  return (
    <main className="pb-28 md:pb-16">
      <EnTetePage titre="Mes favoris" />
      <div className="px-4 pt-3">
        {requete.isPending && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">{[1, 2, 3, 4].map((i) => <SqueletteCarte key={i} />)}</div>}
        {requete.isError && <Vide titre="Oups" texte={requete.error.message} action="Réessayer" onAction={() => requete.refetch()} />}
        {requete.isSuccess && favoris.length === 0 && (
          <Vide titre="Aucun favori" texte="Touche le cœur d'une annonce pour la retrouver ici." action="Parcourir les annonces" lien="/" />
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
          {favoris.map((f) => (
            <div key={f.annonce.id} className={f.disponible ? '' : 'relative opacity-60 grayscale'}>
              <CarteAnnonce annonce={f.annonce} />
              {!f.disponible && <span className="absolute left-2.5 top-2.5 rounded-full bg-nuit px-2.5 py-1 text-[11px] font-extrabold text-white">Plus disponible</span>}
            </div>
          ))}
        </div>
        {requete.hasNextPage && (
          <button type="button" onClick={() => requete.fetchNextPage()} className="btn-contour mt-5 w-full">Voir plus</button>
        )}
      </div>
    </main>
  );
}
