import { useInfiniteQuery } from '@tanstack/react-query';
import { compteApi } from '../api/services.js';
import EnTetePage from '../components/EnTetePage.jsx';
import Vide from '../components/Vide.jsx';
import { formatDate } from '../utils/format.js';

export default function Transactions() {
  const requete = useInfiniteQuery({
    queryKey: ['transactions'],
    queryFn: ({ pageParam }) => compteApi.transactions(pageParam),
    initialPageParam: 0,
    getNextPageParam: (d) => (d.page + 1 < d.totalPages ? d.page + 1 : undefined)
  });
  const lignes = requete.data?.pages.flatMap((p) => p.contenu) ?? [];

  return (
    <main className="pb-10 md:pb-16 md:mx-auto md:max-w-2xl">
      <EnTetePage titre="Historique" repli="/compte" />
      {requete.isSuccess && lignes.length === 0 && <Vide titre="Aucune opération" texte="Tes recharges et achats apparaîtront ici." />}
      <ul className="mx-4 mt-3 overflow-hidden rounded-3xl border border-trait bg-surface">
        {lignes.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 border-b border-trait px-4 py-3.5 last:border-b-0">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold">{t.libelle}</p>
              <p className="mt-0.5 text-xs text-gris">{formatDate(t.date, true)} · solde {t.soldeApres.toLocaleString('fr-FR')}</p>
            </div>
            <p className={`flex-none text-[15px] font-extrabold ${t.montant > 0 ? 'text-succes-texte' : 'text-encre'}`}>
              {t.montant > 0 ? '+' : ''}{t.montant.toLocaleString('fr-FR')}
            </p>
          </li>
        ))}
      </ul>
      {requete.hasNextPage && <div className="px-4"><button type="button" onClick={() => requete.fetchNextPage()} className="btn-contour mt-4 w-full">Voir plus</button></div>}
    </main>
  );
}
