import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/services.js';
import Chargement from '../components/Chargement.jsx';
import { Confirmer } from '../components/FeuilleBas.jsx';
import { useToast } from '../components/Toast.jsx';
import { TitreAdmin } from './AdminLayout.jsx';

const LIBELLES = {
  paiements_actifs: 'Paiements ouverts (recharges, boosts, Pro)',
  date_fin_periode_gratuite: 'Fin de la période de lancement (pas de quota avant cette date)',
  quota_gratuit_mensuel: 'Publications gratuites par mois',
  duree_annonce_gratuite_jours: "Durée d'une annonce gratuite (jours)",
  duree_annonce_pro_jours: "Durée d'une annonce Pro (jours)",
  nb_max_photos: 'Photos maximum par annonce',
  seuil_suspension_signalements: 'Signalements avant masquage automatique',
  montants_recharge: 'Montants de recharge proposés (F, séparés par des virgules)'
};

export default function Parametres() {
  const { data, isPending } = useQuery({ queryKey: ['admin', 'parametres'], queryFn: adminApi.parametres });
  if (isPending) return <Chargement />;
  const ordre = Object.keys(LIBELLES);
  const tries = [...data].sort((a, b) => ordre.indexOf(a.cle) - ordre.indexOf(b.cle));
  return (
    <>
      <TitreAdmin titre="Paramètres" texte="Les changements s'appliquent dans les 5 minutes, sans redéployer l'appli." />
      <div className="flex flex-col gap-3">{tries.map((p) => <LigneParametre key={p.cle} parametre={p} />)}</div>
    </>
  );
}

function LigneParametre({ parametre }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [valeur, setValeur] = useState(parametre.valeur);
  const [confirmer, setConfirmer] = useState(false);
  const modifie = valeur !== parametre.valeur;

  const enregistrer = useMutation({
    mutationFn: (v) => adminApi.modifierParametre(parametre.cle, v),
    onSuccess: (p) => { setValeur(p.valeur); setConfirmer(false); toast('Paramètre enregistré'); queryClient.invalidateQueries({ queryKey: ['admin'] }); queryClient.invalidateQueries({ queryKey: ['portefeuille'] }); },
    onError: (e) => { setConfirmer(false); toast(e.message, 'erreur'); }
  });

  if (parametre.type === 'BOOLEEN') {
    const actif = parametre.valeur === 'true';
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-trait bg-surface p-4">
        <div><p className="font-extrabold">{LIBELLES[parametre.cle] || parametre.cle}</p><p className="mt-0.5 text-sm text-gris">{actif ? 'Activé' : 'Désactivé'}</p></div>
        <button type="button" role="switch" aria-checked={actif} onClick={() => setConfirmer(true)}
          className={`flex h-[34px] w-[58px] rounded-full p-1 ${actif ? 'justify-end bg-brand' : 'justify-start bg-bordure'}`}>
          <span className="h-[26px] w-[26px] rounded-full bg-white shadow" />
        </button>
        <Confirmer ouvert={confirmer} titre={actif ? 'Fermer les paiements ?' : 'Ouvrir les paiements ?'}
          texte={actif ? 'Les recharges, boosts et abonnements Pro seront cachés aux étudiants.' : 'Les étudiants pourront recharger, booster et passer Pro. Vérifie que CT Pay est bien configuré.'}
          libelle={actif ? 'Fermer' : 'Ouvrir'} enCours={enregistrer.isPending}
          onConfirmer={() => enregistrer.mutate(actif ? 'false' : 'true')} onFermer={() => setConfirmer(false)} />
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); enregistrer.mutate(valeur); }}
      className="flex flex-wrap items-end justify-between gap-3 rounded-[20px] border border-trait bg-surface p-4">
      <label className="min-w-[220px] flex-1">
        <span className="block font-extrabold">{LIBELLES[parametre.cle] || parametre.cle}</span>
        <input type={parametre.type === 'DATE' ? 'date' : 'text'} inputMode={parametre.type === 'ENTIER' ? 'numeric' : undefined}
          value={valeur} onChange={(e) => setValeur(e.target.value)} className="champ mt-2 h-12" />
      </label>
      <button type="submit" disabled={!modifie || enregistrer.isPending} className="btn-primaire h-12 px-5 text-sm">Enregistrer</button>
    </form>
  );
}
