import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/services.js';
import Chargement from '../components/Chargement.jsx';
import { Onglets, Pagination, TitreAdmin } from './AdminLayout.jsx';
import { formatDate, formatPrix } from '../utils/format.js';

const STYLES = { EN_ATTENTE: 'bg-sable text-texte2', REUSSI: 'bg-succes text-succes-texte', ECHOUE: 'bg-red-100 text-red-800' };
const LIBELLES = { EN_ATTENTE: 'En attente', REUSSI: 'Réussi', ECHOUE: 'Échoué' };

export default function Paiements() {
  const [statut, setStatut] = useState('');
  const [page, setPage] = useState(0);
  const { data, isPending } = useQuery({ queryKey: ['admin', 'paiements', statut, page], queryFn: () => adminApi.paiements(statut || undefined, page) });

  return (
    <>
      <TitreAdmin titre="Paiements" texte="Recharges Mobile Money. Les paiements en attente sont revérifiés automatiquement toutes les 2 minutes." />
      <Onglets actif={statut} onChanger={(s) => { setStatut(s); setPage(0); }}
        valeurs={[['', 'Tous'], ['REUSSI', 'Réussis'], ['EN_ATTENTE', 'En attente'], ['ECHOUE', 'Échoués']]} />
      {isPending && <Chargement />}
      {data && data.contenu.length === 0 && <p className="rounded-2xl border border-trait bg-surface px-5 py-10 text-center text-gris">Aucun paiement.</p>}
      {data && data.contenu.length > 0 && (
        <div className="overflow-x-auto rounded-[20px] border border-trait bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-trait bg-creme text-xs uppercase tracking-wider text-gris">
              <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Étudiant</th><th className="px-4 py-3">Opérateur</th><th className="px-4 py-3 text-right">Montant</th><th className="px-4 py-3 text-right">Frais</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Référence</th></tr>
            </thead>
            <tbody>
              {data.contenu.map((p) => (
                <tr key={p.id} className="border-b border-trait last:border-b-0">
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(p.dateCreation, true)}</td>
                  <td className="px-4 py-3"><span className="font-bold">{p.utilisateur}</span><br /><span className="text-xs text-gris">{p.telephone}</span></td>
                  <td className="px-4 py-3">{p.operateur}</td>
                  <td className="px-4 py-3 text-right font-extrabold">{formatPrix(p.montant)}</td>
                  <td className="px-4 py-3 text-right text-gris">{p.frais != null ? formatPrix(p.frais) : '—'}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${STYLES[p.statut]}`}>{LIBELLES[p.statut]}</span>
                    {p.messageErreur && <p className="mt-1 max-w-[200px] text-xs text-gris">{p.messageErreur}</p>}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gris">{p.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={data?.totalPages} onChanger={setPage} />
    </>
  );
}
