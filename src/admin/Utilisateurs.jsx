import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/services.js';
import Chargement from '../components/Chargement.jsx';
import FeuilleBas, { Confirmer } from '../components/FeuilleBas.jsx';
import Champ from '../components/Champ.jsx';
import { useToast } from '../components/Toast.jsx';
import { Onglets, Pagination, TitreAdmin } from './AdminLayout.jsx';
import { formatDate, initiales } from '../utils/format.js';

/** Sert pour "Inscriptions" (statut EN_ATTENTE fixe) et "Utilisateurs" (tous les statuts). */
export default function Utilisateurs({ inscriptions = false }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [statut, setStatut] = useState(inscriptions ? 'EN_ATTENTE' : 'ACTIF');
  const [page, setPage] = useState(0);
  const [aBloquer, setABloquer] = useState(null);
  const [aCrediter, setACrediter] = useState(null);

  const { data, isPending } = useQuery({ queryKey: ['admin', 'utilisateurs', statut, page], queryFn: () => adminApi.utilisateurs(statut, page) });

  const action = useMutation({
    mutationFn: ({ type, id }) => (type === 'activer' ? adminApi.activer(id) : adminApi.bloquer(id)),
    onSuccess: (u, { type }) => {
      toast(type === 'activer' ? `${u.prenom} peut maintenant se connecter` : `${u.prenom} est bloqué`);
      setABloquer(null);
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (e) => { setABloquer(null); toast(e.message, 'erreur'); }
  });

  return (
    <>
      <TitreAdmin titre={inscriptions ? 'Inscriptions à valider' : 'Utilisateurs'}
        texte={inscriptions ? 'Vérifie que le matricule correspond bien à un étudiant de l\'ESTLC avant de valider.' : undefined} />
      {!inscriptions && (
        <Onglets actif={statut} onChanger={(s) => { setStatut(s); setPage(0); }}
          valeurs={[['ACTIF', 'Actifs'], ['EN_ATTENTE', 'En attente'], ['BLOQUE', 'Bloqués']]} />
      )}
      {isPending && <Chargement />}
      {data && data.contenu.length === 0 && <p className="rounded-2xl border border-trait bg-surface px-5 py-10 text-center text-gris">{inscriptions ? 'Aucune inscription en attente.' : 'Personne dans cette liste.'}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {data?.contenu.map((u) => (
          <article key={u.id} className="rounded-[20px] border border-trait bg-surface p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-nuit font-display font-extrabold text-brand-peche">{initiales(u.prenom, u.nom)}</span>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold">{u.prenom} {u.nom} {u.role === 'ADMIN' && <span className="ml-1 rounded-full bg-brand px-2 py-0.5 text-[11px] text-white">ADMIN</span>}</p>
                <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[13px]">
                  <dt className="text-gris">Matricule</dt><dd className="font-bold">{u.matricule}</dd>
                  <dt className="text-gris">Téléphone</dt><dd className="font-bold">{u.telephone}</dd>
                  <dt className="text-gris">Filière</dt><dd className="font-bold">{[u.filiere, u.niveau].filter(Boolean).join(' · ') || '—'}</dd>
                  <dt className="text-gris">Inscrit le</dt><dd className="font-bold">{formatDate(u.dateInscription)}</dd>
                  {!inscriptions && <><dt className="text-gris">Solde</dt><dd className="font-bold">{u.soldeCredits.toLocaleString('fr-FR')} crédits{u.pro ? ' · PRO' : ''}</dd></>}
                </dl>
              </div>
            </div>
            {u.role !== 'ADMIN' && (
              <div className="mt-4 flex flex-wrap gap-2">
                {u.statut !== 'ACTIF' && (
                  <button type="button" onClick={() => action.mutate({ type: 'activer', id: u.id })} disabled={action.isPending}
                    className="h-11 flex-1 rounded-full bg-brand px-4 text-sm font-extrabold text-white">{u.statut === 'BLOQUE' ? 'Débloquer' : 'Valider'}</button>
                )}
                {u.statut !== 'BLOQUE' && (
                  <button type="button" onClick={() => setABloquer(u)} className="h-11 flex-1 rounded-full border-[1.5px] border-bordure px-4 text-sm font-extrabold text-red-800">
                    {u.statut === 'EN_ATTENTE' ? 'Refuser' : 'Bloquer'}
                  </button>
                )}
                {u.statut === 'ACTIF' && (
                  <button type="button" onClick={() => setACrediter(u)} className="h-11 flex-1 rounded-full border-[1.5px] border-bordure px-4 text-sm font-extrabold">Créditer</button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
      <Pagination page={page} totalPages={data?.totalPages} onChanger={setPage} />

      <Confirmer ouvert={!!aBloquer} danger titre={aBloquer?.statut === 'EN_ATTENTE' ? "Refuser l'inscription ?" : 'Bloquer ce compte ?'}
        texte={`${aBloquer?.prenom} ${aBloquer?.nom} ne pourra plus se connecter. Ses sessions en cours sont coupées.`}
        libelle={aBloquer?.statut === 'EN_ATTENTE' ? 'Refuser' : 'Bloquer'} enCours={action.isPending}
        onConfirmer={() => action.mutate({ type: 'bloquer', id: aBloquer.id })} onFermer={() => setABloquer(null)} />
      <FeuilleCredit utilisateur={aCrediter} onFermer={() => setACrediter(null)} />
    </>
  );
}

function FeuilleCredit({ utilisateur, onFermer }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [montant, setMontant] = useState('');
  const [type, setType] = useState('BONUS');
  const crediter = useMutation({
    mutationFn: () => adminApi.crediter(utilisateur.id, { montant: Number(montant), type }),
    onSuccess: () => { toast(`${montant} crédits ajoutés`); setMontant(''); onFermer(); queryClient.invalidateQueries({ queryKey: ['admin'] }); },
    onError: (e) => toast(e.message, 'erreur')
  });
  return (
    <FeuilleBas ouvert={!!utilisateur} titre={`Créditer ${utilisateur?.prenom ?? ''}`} onFermer={onFermer}>
      <div className="mt-4 flex flex-col gap-3.5">
        <Champ label="Montant (crédits)" inputMode="numeric" value={montant} onChange={(e) => setMontant(e.target.value.replace(/\D/g, ''))} />
        <div className="grid grid-cols-2 gap-2">
          {[['BONUS', 'Bonus / geste'], ['REMBOURSEMENT', 'Remboursement']].map(([cle, libelle]) => (
            <button key={cle} type="button" aria-pressed={type === cle} onClick={() => setType(cle)}
              className={`h-12 rounded-2xl border-2 text-sm font-extrabold ${type === cle ? 'border-brand bg-brand-clair' : 'border-bordure bg-surface'}`}>{libelle}</button>
          ))}
        </div>
        <button type="button" disabled={!montant || crediter.isPending} onClick={() => crediter.mutate()} className="btn-primaire w-full">
          {crediter.isPending ? 'Un instant…' : 'Créditer'}
        </button>
      </div>
    </FeuilleBas>
  );
}
