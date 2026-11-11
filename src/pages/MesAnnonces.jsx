import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { annoncesApi, offresApi } from '../api/services.js';
import EnTetePage from '../components/EnTetePage.jsx';
import Photo from '../components/Photo.jsx';
import Icone from '../components/Icone.jsx';
import Vide from '../components/Vide.jsx';
import FeuilleBas, { Confirmer } from '../components/FeuilleBas.jsx';
import { useToast } from '../components/Toast.jsx';
import { usePortefeuille } from '../hooks/usePortefeuille.js';
import { formatPrix, joursRestants } from '../utils/format.js';

const ONGLETS = [
  { cle: 'ligne', libelle: 'En ligne', filtre: (a) => a.visible },
  { cle: 'expiree', libelle: 'Expirées', filtre: (a) => a.statut === 'EXPIREE' },
  { cle: 'vendue', libelle: 'Vendues', filtre: (a) => a.statut === 'VENDUE' },
  { cle: 'suspendue', libelle: 'Masquées', filtre: (a) => a.statut === 'SUSPENDUE', siNonVide: true }
];

const STATUTS = {
  ACTIVE: ['En ligne', 'bg-succes text-succes-texte'],
  EXPIREE: ['Expirée', 'bg-brand-clair text-brand-fonce'],
  VENDUE: ['Vendue', 'bg-nuit text-white'],
  SUSPENDUE: ['Masquée', 'bg-red-100 text-red-800']
};

export default function MesAnnonces() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { paiementsActifs, data: portefeuille } = usePortefeuille();
  const [onglet, setOnglet] = useState('ligne');
  const [confirmation, setConfirmation] = useState(null); // { type: 'vendue' | 'supprimer', annonce }
  const [aBooster, setABooster] = useState(null);

  const { data, isPending, isError, error, refetch } = useQuery({ queryKey: ['mes-annonces'], queryFn: annoncesApi.mesAnnonces });
  const annonces = data?.contenu ?? [];

  const rafraichir = () => {
    queryClient.invalidateQueries({ queryKey: ['mes-annonces'] });
    queryClient.invalidateQueries({ queryKey: ['annonces'] });
    queryClient.invalidateQueries({ queryKey: ['annonce'] });
  };

  const action = useMutation({
    mutationFn: ({ type, id }) => ({
      vendue: annoncesApi.marquerVendue, supprimer: annoncesApi.supprimer, renouveler: annoncesApi.renouveler
    })[type](id),
    onSuccess: (_r, { type }) => {
      toast({ vendue: 'Bravo pour la vente !', supprimer: 'Annonce supprimée', renouveler: 'Annonce de nouveau en ligne' }[type]);
      setConfirmation(null);
      rafraichir();
    },
    onError: (err) => toast(err.message, 'erreur')
  });

  if (isPending) return <><EnTetePage titre="Mes annonces" repli="/compte" /><div className="space-y-3 px-4 pt-4">{[1, 2].map((i) => <div key={i} className="squelette h-36" />)}</div></>;
  if (isError) return <><EnTetePage titre="Mes annonces" repli="/compte" /><Vide titre="Oups" texte={error.message} action="Réessayer" onAction={refetch} /></>;

  const totalVues = annonces.reduce((s, a) => s + a.nbVues, 0);
  const totalContacts = annonces.reduce((s, a) => s + a.nbContacts, 0);
  const vendues = annonces.filter((a) => a.statut === 'VENDUE').length;
  const ongletsVisibles = ONGLETS.filter((o) => !o.siNonVide || annonces.some(o.filtre));
  const liste = annonces.filter(ONGLETS.find((o) => o.cle === onglet).filtre);

  return (
    <main className="pb-28 md:pb-16 md:mx-auto md:max-w-4xl">
      <EnTetePage titre="Mes annonces" repli="/compte"
        action={<Link to="/vendre" aria-label="Nouvelle annonce" className="btn-rond flex-none bg-brand text-white"><Icone nom="plus" epaisseur={2.6} /></Link>} />

      {annonces.length === 0 ? (
        <Vide titre="Tu n'as encore rien publié" texte="Un lit, un téléphone, des habits… Publie ta première annonce en 2 minutes." action="Vendre un article" lien="/vendre" />
      ) : (
        <>
          <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
            <Statistique valeur={totalVues} libelle="vues au total" sombre />
            <Statistique valeur={totalContacts} libelle="contacts WhatsApp" accent />
            <Statistique valeur={vendues} libelle={vendues > 1 ? 'articles vendus' : 'article vendu'} />
          </div>

          <div role="tablist" aria-label="Filtrer mes annonces" className="defilement mx-4 mt-5 flex gap-1 overflow-x-auto rounded-full bg-sable p-1">
            {ongletsVisibles.map((o) => {
              const n = annonces.filter(o.filtre).length;
              return (
                <button key={o.cle} type="button" role="tab" aria-selected={onglet === o.cle} onClick={() => setOnglet(o.cle)}
                  className={`h-11 flex-1 whitespace-nowrap rounded-full px-3 text-sm ${onglet === o.cle ? 'bg-surface font-extrabold shadow-[0_4px_12px_-6px_rgba(120,52,10,.35)]' : 'font-bold text-gris'}`}>
                  {o.libelle} ({n})
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 px-4 pt-4 md:grid-cols-2">
            {liste.length === 0 && <p className="py-10 text-center text-sm text-gris">Rien ici pour l'instant.</p>}
            {liste.map((a) => (
              <CarteGestion key={a.id} annonce={a} paiementsActifs={paiementsActifs}
                onVendue={() => setConfirmation({ type: 'vendue', annonce: a })}
                onSupprimer={() => setConfirmation({ type: 'supprimer', annonce: a })}
                onRenouveler={() => action.mutate({ type: 'renouveler', id: a.id })}
                onBooster={() => setABooster(a)}
                enCours={action.isPending} />
            ))}
          </div>
        </>
      )}

      <Confirmer ouvert={confirmation?.type === 'vendue'} titre="Article vendu ?"
        texte={`« ${confirmation?.annonce.titre} » ne sera plus visible. Les acheteurs arrêteront de t'écrire.`}
        libelle="Oui, c'est vendu" enCours={action.isPending}
        onConfirmer={() => action.mutate({ type: 'vendue', id: confirmation.annonce.id })} onFermer={() => setConfirmation(null)} />
      <Confirmer ouvert={confirmation?.type === 'supprimer'} titre="Supprimer l'annonce ?" danger
        texte="Elle disparaît définitivement de Maketo." libelle="Supprimer" enCours={action.isPending}
        onConfirmer={() => action.mutate({ type: 'supprimer', id: confirmation.annonce.id })} onFermer={() => setConfirmation(null)} />
      <FeuilleBoost annonce={aBooster} solde={portefeuille?.solde ?? 0} onFermer={() => setABooster(null)}
        onSucces={() => { setABooster(null); rafraichir(); queryClient.invalidateQueries({ queryKey: ['portefeuille'] }); }} />
    </main>
  );
}

function Statistique({ valeur, libelle, sombre, accent }) {
  return (
    <div className={`rounded-[18px] px-3 py-3.5 ${sombre ? 'bg-nuit text-white' : 'border border-trait bg-surface'}`}>
      <p className={`font-display text-2xl font-extrabold ${accent ? 'text-brand' : ''}`}>{valeur}</p>
      <p className={`mt-0.5 text-xs ${sombre ? 'text-[#CDBFB4]' : 'text-gris'}`}>{libelle}</p>
    </div>
  );
}

function CarteGestion({ annonce: a, paiementsActifs, onVendue, onSupprimer, onRenouveler, onBooster, enCours }) {
  const [libelle, classes] = STATUTS[a.statut] || STATUTS.ACTIVE;
  const duree = a.formule === 'PRO' ? 30 : 7;
  const jours = Math.max(0, joursRestants(a.dateExpiration));
  const reste = Math.min(100, Math.round((jours / duree) * 100));
  const modifiable = a.statut !== 'VENDUE' && a.statut !== 'SUSPENDUE';

  return (
    <article className="rounded-[22px] border border-trait bg-surface p-3">
      <Link to={`/annonces/${a.id}`} className="flex gap-3 text-encre">
        <Photo src={a.photoPrincipale} alt="" className="h-[88px] w-[88px] flex-none rounded-2xl" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="line-clamp-2 text-[15px] font-extrabold leading-snug">{a.titre}</h2>
            <span className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-extrabold ${classes}`}>{a.boostee ? 'À la une' : libelle}</span>
          </div>
          <p className="mt-1 text-[17px] font-extrabold text-brand">{a.type === 'MESSAGE' ? 'Petite annonce' : formatPrix(a.prix, a.prixADebattre)}</p>
          <p className="mt-1 flex gap-3.5 text-[13px] text-gris">
            <span className="inline-flex items-center gap-1"><Icone nom="oeil" taille={15} />{a.nbVues} vues</span>
            <span className="inline-flex items-center gap-1"><Icone nom="whatsapp" taille={15} />{a.nbContacts} contacts</span>
          </p>
        </div>
      </Link>

      {a.visible && (
        <div className="mt-3">
          <div className="flex justify-between text-xs font-bold text-gris">
            <span>{jours <= 1 ? 'Expire aujourd\'hui ou demain' : `Expire dans ${jours} jours`}</span>
            <span>{a.formule === 'PRO' ? 'Pro · 30 jours' : 'Gratuite · 7 jours'}</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-sable"><div className={`h-1.5 rounded-full ${reste < 25 ? 'bg-brand-vif' : 'bg-brand'}`} style={{ width: `${reste}%` }} /></div>
        </div>
      )}

      {a.renouvelable && (
        <div className="mt-3 flex items-center justify-between gap-2.5 rounded-2xl bg-brand-clair px-3 py-2.5">
          <p className="text-[13px] leading-snug text-alerte">Plus visible par les étudiants. Remets-la en ligne en un clic.</p>
          <button type="button" onClick={onRenouveler} disabled={enCours} className="h-11 flex-none rounded-full bg-brand px-4 text-[13px] font-extrabold text-white">Renouveler</button>
        </div>
      )}

      {a.statut === 'SUSPENDUE' && (
        <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2.5 text-[13px] text-red-800">Masquée après plusieurs signalements. L'administrateur va la vérifier.</p>
      )}

      {modifiable && (
        <div className={`mt-3 grid gap-2 ${a.visible && paiementsActifs ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <Link to={`/annonces/${a.id}/modifier`} className="flex h-11 items-center justify-center rounded-full border-[1.5px] border-bordure text-[13px] font-extrabold text-encre">Modifier</Link>
          {a.visible ? (
            <button type="button" onClick={onVendue} className="h-11 rounded-full border-[1.5px] border-bordure bg-surface text-[13px] font-extrabold">Vendu</button>
          ) : (
            <button type="button" onClick={onSupprimer} className="h-11 rounded-full border-[1.5px] border-bordure bg-surface text-[13px] font-extrabold text-red-800">Supprimer</button>
          )}
          {a.visible && paiementsActifs && (
            <button type="button" onClick={onBooster} className="h-11 rounded-full bg-nuit text-[13px] font-extrabold text-brand-peche">Booster</button>
          )}
        </div>
      )}
    </article>
  );
}

function FeuilleBoost({ annonce, solde, onFermer, onSucces }) {
  const toast = useToast();
  const { data: offres = [] } = useQuery({ queryKey: ['offres'], queryFn: offresApi.lister, enabled: !!annonce, staleTime: 3600_000 });
  const boosts = offres.filter((o) => o.type === 'BOOST');
  const [choix, setChoix] = useState(null);
  const offre = boosts.find((o) => o.code === choix) || boosts[0];

  const booster = useMutation({
    mutationFn: () => annoncesApi.booster(annonce.id, offre.code),
    onSuccess: () => { toast('Ton annonce est à la une !'); onSucces(); },
    onError: (err) => toast(err.message, 'erreur')
  });

  const insuffisant = offre && solde < offre.prix;
  return (
    <FeuilleBas ouvert={!!annonce} titre="Mettre à la une" onFermer={onFermer}>
      <p className="mt-2 text-[15px] text-texte2">Ton annonce passe en tête de l'accueil, avec le badge « À la une ».</p>
      <div className="mt-4 flex flex-col gap-2">
        {boosts.map((o) => (
          <button key={o.code} type="button" aria-pressed={offre?.code === o.code} onClick={() => setChoix(o.code)}
            className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-left ${offre?.code === o.code ? 'border-brand bg-brand-clair' : 'border-bordure bg-surface'}`}>
            <span className="font-bold">{o.libelle}</span>
            <span className="font-extrabold text-brand">{formatPrix(o.prix)}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-gris">Ton solde : <strong className="text-encre">{formatPrix(solde)}</strong></p>
      {insuffisant ? (
        <Link to="/compte/recharger" className="btn-primaire mt-4 w-full">Recharger mon portefeuille</Link>
      ) : (
        <button type="button" onClick={() => booster.mutate()} disabled={!offre || booster.isPending} className="btn-primaire mt-4 w-full">
          {booster.isPending ? 'Un instant…' : `Booster pour ${formatPrix(offre?.prix ?? 0)}`}
        </button>
      )}
    </FeuilleBas>
  );
}
