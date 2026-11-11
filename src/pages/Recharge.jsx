import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { paiementsApi } from '../api/services.js';
import { useAuth } from '../auth/AuthContext.jsx';
import EnTetePage from '../components/EnTetePage.jsx';
import Champ from '../components/Champ.jsx';
import Icone from '../components/Icone.jsx';
import Chargement from '../components/Chargement.jsx';
import Vide from '../components/Vide.jsx';
import { formatPrix } from '../utils/format.js';
import { stockage } from '../utils/stockage.js';

const CLE_EN_COURS = 'maketo:recharge';
const DUREE_MAX_ATTENTE = 3 * 60 * 1000;
const COULEURS = { MOMO: '#FFCB05', OM: '#FF7900' };

export default function Recharge() {
  const { utilisateur } = useAuth();
  const queryClient = useQueryClient();
  const options = useQuery({ queryKey: ['paiements', 'options'], queryFn: paiementsApi.options });
  const [montant, setMontant] = useState(null);
  const [operateur, setOperateur] = useState(null);
  const [telephone, setTelephone] = useState(utilisateur.telephone);
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  // Recharge en cours : reprise automatique si l'étudiant a fermé l'appli pour taper son code PIN
  const [enCours, setEnCours] = useState(() => stockage.lire(CLE_EN_COURS));

  const suivi = useQuery({
    queryKey: ['recharge', enCours?.reference],
    queryFn: () => paiementsApi.suivre(enCours.reference),
    enabled: !!enCours,
    refetchInterval: (q) => (q.state.data?.statut === 'EN_ATTENTE' && Date.now() - enCours.debut < DUREE_MAX_ATTENTE ? 4000 : false)
  });
  const statut = suivi.data?.statut;

  useEffect(() => {
    if (statut === 'REUSSI' || statut === 'ECHOUE') {
      stockage.effacer(CLE_EN_COURS);
      if (statut === 'REUSSI') queryClient.invalidateQueries({ queryKey: ['portefeuille'] });
    }
  }, [statut, queryClient]);

  if (options.isPending) return <Chargement />;
  if (options.isError) return <><EnTetePage titre="Recharger" repli="/compte" /><Vide titre="Oups" texte={options.error.message} action="Réessayer" onAction={options.refetch} /></>;
  if (!options.data.paiementsActifs && !enCours) {
    return <><EnTetePage titre="Recharger" repli="/compte" /><Vide titre="Pas encore ouvert" texte="Pendant la période de lancement, tout est gratuit : les recharges ouvriront bientôt." action="Retour au compte" lien="/compte" /></>;
  }

  const montantChoisi = montant ?? options.data.montants[1] ?? options.data.montants[0];
  const operateurChoisi = operateur ?? options.data.operateurs[0]?.cle;
  const nomOperateur = options.data.operateurs.find((o) => o.cle === (enCours?.operateur || operateurChoisi))?.nom || 'Mobile Money';

  const payer = async (e) => {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      const paiement = await paiementsApi.recharger({ montant: montantChoisi, operateur: operateurChoisi, telephone });
      const suivant = { reference: paiement.reference, montant: paiement.montant, operateur: operateurChoisi, telephone, debut: Date.now() };
      stockage.ecrire(CLE_EN_COURS, suivant);
      queryClient.setQueryData(['recharge', paiement.reference], paiement);
      setEnCours(suivant);
    } catch (err) {
      setErreur(err);
    } finally {
      setEnvoi(false);
    }
  };

  const recommencer = () => {
    stockage.effacer(CLE_EN_COURS);
    setEnCours(null);
  };

  // ----- Attente de validation -----
  if (enCours && (!statut || statut === 'EN_ATTENTE')) {
    const tropLong = Date.now() - enCours.debut > DUREE_MAX_ATTENTE;
    return (
      <main className="pb-10 md:pb-16 md:mx-auto md:max-w-xl">
        <EnTetePage titre="Recharger" repli="/compte" />
        <div className="flex flex-col items-center px-5 pt-10 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-nuit text-brand-peche shadow-[0_0_0_12px_#FFEBDD]">
            <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>
          </span>
          <h1 className="mt-8 font-display text-2xl font-extrabold tracking-[-.03em]">Valide sur ton téléphone</h1>
          <p role="status" className="mt-2.5 text-[15px] leading-relaxed text-texte2">
            Une demande de <strong>{formatPrix(enCours.montant)}</strong> a été envoyée au <strong>{enCours.telephone}</strong>. Tape ton code PIN {nomOperateur} pour confirmer.
          </p>
          <ol className="mt-6 w-full space-y-3 rounded-[18px] border border-trait bg-surface p-4 text-left text-sm">
            <li className="flex items-center gap-2.5"><Pastille n={1} />Ouvre le message de ton opérateur</li>
            <li className="flex items-center gap-2.5"><Pastille n={2} />Tape ton code PIN</li>
            <li className="flex items-center gap-2.5"><Pastille n={3} attente />Tes crédits arrivent ici automatiquement</li>
          </ol>
          <span className="mt-6 h-8 w-8 animate-spin rounded-full border-4 border-sable border-t-brand" aria-hidden="true" />
          {tropLong ? (
            <>
              <p className="mt-4 text-sm text-gris">Toujours rien ? Si tu as bien validé, tes crédits arriveront dans quelques minutes.</p>
              <div className="mt-4 flex w-full flex-col gap-2.5">
                <button type="button" onClick={() => suivi.refetch()} className="btn-primaire w-full">Vérifier à nouveau</button>
                <button type="button" onClick={recommencer} className="btn-contour w-full">Faire une nouvelle demande</button>
              </div>
            </>
          ) : (
            <p className="mt-4 text-[13px] text-gris">Pas reçu de demande ? Vérifie ton numéro et ton solde Mobile Money.</p>
          )}
        </div>
      </main>
    );
  }

  // ----- Résultat -----
  if (enCours && statut) {
    const reussi = statut === 'REUSSI';
    return (
      <main className="pb-10 md:pb-16 md:mx-auto md:max-w-xl">
        <EnTetePage titre="Recharger" repli="/compte" />
        <div className="flex flex-col items-center px-5 pt-12 text-center">
          <span className={`flex h-24 w-24 items-center justify-center rounded-full shadow-[0_0_0_12px_#FFEBDD] ${reussi ? 'bg-brand text-white' : 'bg-sable text-brand-fonce'}`}>
            <Icone nom={reussi ? 'valide' : 'fermer'} taille={44} epaisseur={2.6} />
          </span>
          <h1 className="mt-8 font-display text-[26px] font-extrabold tracking-[-.03em]">{reussi ? `+ ${enCours.montant.toLocaleString('fr-FR')} crédits` : 'Paiement non abouti'}</h1>
          <p className="mt-2.5 text-[15px] text-texte2">{suivi.data.message}</p>
          <div className="mt-7 flex w-full flex-col gap-2.5">
            {reussi
              ? <Link to="/mes-annonces" className="btn-primaire w-full">Booster une annonce</Link>
              : <button type="button" onClick={recommencer} className="btn-primaire w-full">Réessayer</button>}
            <Link to="/compte" onClick={recommencer} className="btn-contour w-full">Retour au compte</Link>
          </div>
        </div>
      </main>
    );
  }

  // ----- Choix -----
  return (
    <main className="pb-10 md:pb-16 md:mx-auto md:max-w-xl">
      <EnTetePage titre="Recharger" repli="/compte" />
      <form onSubmit={payer} noValidate className="flex flex-col gap-6 px-4 pt-3">
        <fieldset>
          <legend className="text-base font-extrabold">Montant</legend>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            {options.data.montants.map((m) => (
              <button key={m} type="button" aria-pressed={montantChoisi === m} onClick={() => setMontant(m)}
                className={`rounded-[20px] border-2 p-4 text-left ${montantChoisi === m ? 'border-brand bg-brand-clair text-brand-fonce' : 'border-bordure bg-surface'}`}>
                <span className="block font-display text-2xl font-extrabold">{m.toLocaleString('fr-FR')} F</span>
                <span className="mt-0.5 block text-xs font-bold opacity-80">{m.toLocaleString('fr-FR')} crédits</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-base font-extrabold">Payer avec</legend>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            {options.data.operateurs.map((o) => (
              <button key={o.cle} type="button" aria-pressed={operateurChoisi === o.cle} onClick={() => setOperateur(o.cle)}
                className={`flex h-14 items-center justify-center gap-2.5 rounded-[18px] border-2 text-[15px] font-extrabold ${operateurChoisi === o.cle ? 'border-brand bg-brand-clair' : 'border-bordure bg-surface'}`}>
                <span className="h-3.5 w-3.5 rounded-full" style={{ background: COULEURS[o.cle] || '#C2410C' }} />{o.nom}
              </button>
            ))}
          </div>
        </fieldset>

        <Champ label="Numéro Mobile Money" prefixe="+237" type="tel" inputMode="numeric" value={telephone}
          onChange={(e) => setTelephone(e.target.value)} erreur={erreur?.erreurs?.telephone} />

        <div className="space-y-1.5 rounded-[18px] border border-trait bg-surface px-4 py-3.5 text-sm">
          <div className="flex justify-between"><span className="text-gris">Tu paies</span><strong>{formatPrix(montantChoisi)}</strong></div>
          <div className="flex justify-between"><span className="text-gris">Tu reçois</span><strong className="text-brand">{montantChoisi.toLocaleString('fr-FR')} crédits</strong></div>
        </div>

        {erreur && !erreur.erreurs?.telephone && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{erreur.message}</p>}
        <button type="submit" disabled={envoi || !operateurChoisi} className="btn-primaire w-full">{envoi ? 'Envoi de la demande…' : `Payer ${formatPrix(montantChoisi)}`}</button>
      </form>
    </main>
  );
}

function Pastille({ n, attente }) {
  return <span className={`flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full text-[13px] font-extrabold ${attente ? 'bg-sable text-brand-fonce' : 'bg-brand text-white'}`}>{n}</span>;
}
