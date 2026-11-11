import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/services.js';
import Chargement from '../components/Chargement.jsx';
import { Confirmer } from '../components/FeuilleBas.jsx';
import { useToast } from '../components/Toast.jsx';
import { Onglets, Pagination, TitreAdmin } from './AdminLayout.jsx';
import { LIBELLES_MOTIF, tempsRelatif } from '../utils/format.js';

export default function Moderation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [statut, setStatut] = useState('OUVERT');
  const [page, setPage] = useState(0);
  const [aRetirer, setARetirer] = useState(null);

  const { data, isPending } = useQuery({ queryKey: ['admin', 'signalements', statut, page], queryFn: () => adminApi.signalements(statut, page) });

  const decision = useMutation({
    mutationFn: ({ type, annonceId }) => (type === 'retablir' ? adminApi.retablir(annonceId) : adminApi.retirer(annonceId)),
    onSuccess: (_r, { type }) => {
      toast(type === 'retablir' ? 'Annonce rétablie' : 'Annonce retirée');
      setARetirer(null);
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['annonces'] });
    },
    onError: (e) => { setARetirer(null); toast(e.message, 'erreur'); }
  });

  return (
    <>
      <TitreAdmin titre="Modération" texte="Une annonce signalée 3 fois est masquée automatiquement en attendant ta décision." />
      <Onglets actif={statut} onChanger={(s) => { setStatut(s); setPage(0); }} valeurs={[['OUVERT', 'À traiter'], ['TRAITE', 'Traités']]} />
      {isPending && <Chargement />}
      {data && data.contenu.length === 0 && <p className="rounded-2xl border border-trait bg-surface px-5 py-10 text-center text-gris">Aucun signalement.</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {data?.contenu.map((s) => (
          <article key={s.id} className="rounded-[20px] border border-trait bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <Link to={`/annonces/${s.annonceId}`} target="_blank" className="font-extrabold text-encre underline">{s.annonceTitre}</Link>
              <span className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-extrabold ${s.annonceStatut === 'SUSPENDUE' ? 'bg-red-100 text-red-800' : 'bg-sable text-texte2'}`}>
                {s.annonceStatut === 'SUSPENDUE' ? 'Masquée' : s.annonceStatut === 'SUPPRIMEE' ? 'Retirée' : 'En ligne'}
              </span>
            </div>
            <p className="mt-2 text-sm"><strong className="text-brand-fonce">{LIBELLES_MOTIF[s.motif]}</strong> · par {s.auteur} · {tempsRelatif(s.dateCreation)}</p>
            {s.commentaire && <p className="mt-2 rounded-xl bg-creme px-3 py-2 text-sm text-texte2">« {s.commentaire} »</p>}
            {statut === 'OUVERT' && s.annonceStatut !== 'SUPPRIMEE' && (
              <div className="mt-4 flex gap-2">
                <button type="button" disabled={decision.isPending} onClick={() => decision.mutate({ type: 'retablir', annonceId: s.annonceId })}
                  className={`h-11 flex-1 rounded-full border-[1.5px] border-bordure text-sm font-extrabold ${s.annonceStatut !== 'SUSPENDUE' ? 'hidden' : ''}`}>
                  Rétablir
                </button>
                <button type="button" onClick={() => setARetirer(s)} className="h-11 flex-1 rounded-full bg-red-700 text-sm font-extrabold text-white">Retirer l'annonce</button>
              </div>
            )}
          </article>
        ))}
      </div>
      <Pagination page={page} totalPages={data?.totalPages} onChanger={setPage} />
      <Confirmer ouvert={!!aRetirer} danger titre="Retirer cette annonce ?" texte={`« ${aRetirer?.annonceTitre} » disparaît de Maketo et tous ses signalements sont clôturés.`}
        libelle="Retirer" enCours={decision.isPending}
        onConfirmer={() => decision.mutate({ type: 'retirer', annonceId: aRetirer.annonceId })} onFermer={() => setARetirer(null)} />
    </>
  );
}
