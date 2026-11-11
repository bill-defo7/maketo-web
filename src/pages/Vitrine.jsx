import { useParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { vendeursApi } from '../api/services.js';
import EnTetePage from '../components/EnTetePage.jsx';
import Chargement from '../components/Chargement.jsx';
import Vide from '../components/Vide.jsx';
import { CarteAnnonce } from '../components/CarteAnnonce.jsx';
import { formatDate, initiales } from '../utils/format.js';

export default function Vitrine() {
  const { id } = useParams();
  const vitrine = useQuery({ queryKey: ['vitrine', id], queryFn: () => vendeursApi.vitrine(id) });
  const annonces = useInfiniteQuery({
    queryKey: ['vitrine', id, 'annonces'],
    queryFn: ({ pageParam }) => vendeursApi.annonces(id, pageParam),
    initialPageParam: 0,
    getNextPageParam: (d) => (d.page + 1 < d.totalPages ? d.page + 1 : undefined),
    enabled: vitrine.isSuccess
  });

  if (vitrine.isPending) return <Chargement />;
  if (vitrine.isError) return <><EnTetePage titre="Vitrine" /><Vide titre="Vendeur introuvable" action="Retour à l'accueil" lien="/" /></>;

  const { vendeur, membreDepuis, nbAnnoncesEnLigne } = vitrine.data;
  const liste = annonces.data?.pages.flatMap((p) => p.contenu) ?? [];

  return (
    <main className="pb-10 md:pb-16">
      <EnTetePage titre="Vitrine" />
      <section className="mx-4 mt-2 rounded-3xl bg-nuit p-5 text-white">
        <div className="flex items-center gap-3.5">
          <span className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-brand font-display text-[22px] font-extrabold">{initiales(...vendeur.nomAffiche.split(' '))}</span>
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 font-display text-[22px] font-extrabold tracking-[-.03em]">
              {vendeur.nomAffiche}
              {vendeur.pro && <span className="rounded-full bg-brand-vif px-2 py-0.5 font-sans text-[11px] font-extrabold text-noir">PRO</span>}
            </h1>
            <p className="mt-1 text-sm text-doux">{vendeur.filiere ? `${vendeur.filiere} · ` : ''}membre depuis {formatDate(membreDepuis).replace(/^\d+ /, '')}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-doux"><strong className="text-white">{nbAnnoncesEnLigne}</strong> annonce{nbAnnoncesEnLigne > 1 ? 's' : ''} en ligne · étudiant vérifié</p>
      </section>
      <div className="px-4 pt-5">
        {annonces.isSuccess && liste.length === 0 && <p className="py-8 text-center text-sm text-gris">Aucune annonce en ligne pour le moment.</p>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">{liste.map((a, i) => <CarteAnnonce key={a.id} annonce={a} ordre={i} />)}</div>
        {annonces.hasNextPage && <button type="button" onClick={() => annonces.fetchNextPage()} className="btn-contour mt-5 w-full">Voir plus</button>}
      </div>
    </main>
  );
}
