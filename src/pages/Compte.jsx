import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { compteApi, offresApi } from '../api/services.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { usePortefeuille } from '../hooks/usePortefeuille.js';
import Icone from '../components/Icone.jsx';
import { Confirmer } from '../components/FeuilleBas.jsx';
import { BoutonTheme, ChoixTheme } from '../components/Theme.jsx';
import { BoutonLangue } from '../i18n/Langue.jsx';
import { useToast } from '../components/Toast.jsx';
import { formatDate, formatPrix, initiales } from '../utils/format.js';

export default function Compte() {
  const { utilisateur, deconnexion } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: portefeuille, paiementsActifs } = usePortefeuille();
  const [confirmerPro, setConfirmerPro] = useState(false);

  const { data: offres = [] } = useQuery({ queryKey: ['offres'], queryFn: offresApi.lister, staleTime: 3600_000, enabled: paiementsActifs });
  const offrePro = offres.find((o) => o.code === 'PRO_MENSUEL') || offres.find((o) => o.type === 'ABONNEMENT');

  const passerPro = useMutation({
    mutationFn: () => compteApi.passerPro(offrePro.code),
    onSuccess: () => {
      toast('Bienvenue chez les Vendeurs Pro !');
      setConfirmerPro(false);
      queryClient.invalidateQueries({ queryKey: ['portefeuille'] });
    },
    onError: (err) => { setConfirmerPro(false); toast(err.message, 'erreur'); }
  });

  const seDeconnecter = async () => {
    await deconnexion();
    navigate('/', { replace: true });
  };

  const solde = portefeuille?.solde ?? 0;
  const pro = portefeuille?.pro;
  const soldeSuffisant = offrePro && solde >= offrePro.prix;

  return (
    <main className="pb-28 md:pb-16 md:mx-auto md:max-w-2xl">
      <section className="rounded-b-[28px] bg-nuit px-5 pb-16 pt-4 text-white md:mt-6 md:rounded-[28px] md:px-8 md:pt-6">
        <div className="mb-3 flex justify-end gap-1.5 md:hidden">
          <BoutonLangue surFondSombre />
          <BoutonTheme surFondSombre />
        </div>
        <div className="flex items-center gap-3.5">
          <span className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-brand font-display text-[22px] font-extrabold">
            {initiales(utilisateur.prenom, utilisateur.nom)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-extrabold tracking-[-.03em]">{utilisateur.prenom} {utilisateur.nom}</h1>
            <p className="mt-1 text-sm text-doux">{[utilisateur.filiere, utilisateur.niveau && `niveau ${utilisateur.niveau}`].filter(Boolean).join(' · ') || 'Étudiant'}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-extrabold text-brand-peche">
              <Icone nom="valide" taille={13} epaisseur={2.6} />{pro ? 'Vendeur Pro' : 'Étudiant vérifié'}
            </span>
          </div>
        </div>
      </section>

      {/* Portefeuille */}
      <section className="relative mx-4 -mt-11 rounded-3xl bg-surface p-[18px] shadow-[0_18px_34px_-20px_rgba(120,52,10,.45)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold text-gris">Mon portefeuille</p>
            <p className="mt-1 font-display text-[28px] font-extrabold tracking-[-.03em]">{solde.toLocaleString('fr-FR')} <span className="text-base text-gris">crédits</span></p>
          </div>
          {paiementsActifs && (
            <Link to="/compte/recharger" className="inline-flex h-11 flex-none items-center gap-2 rounded-full bg-brand px-4 text-sm font-extrabold text-white">
              <Icone nom="plus" taille={16} epaisseur={2.6} />Recharger
            </Link>
          )}
        </div>
        <p className="mt-2.5 text-[13px] text-gris">
          {paiementsActifs ? '1 crédit = 1 F. Sert à booster tes annonces ou à passer Pro.' : "Période de lancement : tout est gratuit. Les options payantes arrivent bientôt."}
        </p>
      </section>

      {/* Pro */}
      {paiementsActifs && offrePro && (
        <section className="mx-4 mt-3.5 rounded-3xl bg-nuit p-5 text-white">
          <span className="rounded-full bg-brand-vif px-2.5 py-1 text-xs font-extrabold text-noir">Vendeur Pro</span>
          {pro ? (
            <>
              <h2 className="mt-3 font-display text-xl font-extrabold tracking-[-.03em]">Tu es Pro jusqu'au {formatDate(portefeuille.proExpireLe)}</h2>
              <p className="mt-2 text-sm text-doux">Annonces illimitées et 30 jours en ligne. Tu peux prolonger à tout moment : les jours s'ajoutent.</p>
            </>
          ) : (
            <>
              <h2 className="mt-3 font-display text-xl font-extrabold leading-tight tracking-[-.03em]">Tu vends souvent ? Passe Pro.</h2>
              <ul className="mt-3 space-y-2 text-sm text-doux">
                {['Annonces illimitées', '30 jours en ligne au lieu de 7', 'Badge PRO sur ta vitrine'].map((t) => (
                  <li key={t} className="flex gap-2"><Icone nom="valide" taille={18} epaisseur={2.6} className="flex-none text-brand-peche" />{t}</li>
                ))}
              </ul>
            </>
          )}
          {soldeSuffisant ? (
            <button type="button" onClick={() => setConfirmerPro(true)} className="btn mt-4 h-[52px] w-full bg-surface text-encre">
              {pro ? 'Prolonger' : 'Passer Pro'} · {formatPrix(offrePro.prix)} / mois
            </button>
          ) : (
            <Link to="/compte/recharger" className="btn mt-4 h-[52px] w-full bg-surface text-encre">Recharger pour passer Pro</Link>
          )}
        </section>
      )}

      {/* Apparence */}
      <section className="mx-4 mt-3.5 rounded-3xl border border-trait bg-surface p-4">
        <p className="mb-2.5 text-[15px] font-extrabold">Apparence</p>
        <ChoixTheme />
      </section>

      {/* Menu */}
      <nav aria-label="Mon compte" className="mx-4 mt-3.5 overflow-hidden rounded-3xl border border-trait bg-surface">
        <LienMenu vers="/mes-annonces" icone="accueil">Mes annonces</LienMenu>
        <LienMenu vers="/favoris" icone="coeur">Mes favoris</LienMenu>
        {paiementsActifs && <LienMenu vers="/compte/transactions" icone="oeil">Historique des paiements</LienMenu>}
        <LienMenu vers={`/vendeurs/${utilisateur.id}`} icone="partager">Ma vitrine publique</LienMenu>
        <LienMenu vers="/compte/profil" icone="compte">Modifier mon profil</LienMenu>
        <LienMenu vers="/compte/mot-de-passe" icone="bouclier">Mot de passe</LienMenu>
        {utilisateur.role === 'ADMIN' && <LienMenu vers="/admin" icone="filtres">Espace administrateur</LienMenu>}
        <button type="button" onClick={seDeconnecter} className="flex w-full items-center gap-3.5 px-[18px] py-4 text-[15px] font-extrabold text-brand-fonce">
          <Icone nom="retour" />Se déconnecter
        </button>
      </nav>

      <Confirmer ouvert={confirmerPro} titre={pro ? 'Prolonger Vendeur Pro ?' : 'Passer Vendeur Pro ?'}
        texte={`${formatPrix(offrePro?.prix ?? 0)} seront débités de ton portefeuille pour 30 jours.`}
        libelle="Confirmer" enCours={passerPro.isPending}
        onConfirmer={() => passerPro.mutate()} onFermer={() => setConfirmerPro(false)} />
    </main>
  );
}

function LienMenu({ vers, icone, children }) {
  return (
    <Link to={vers} className="flex items-center gap-3.5 border-b border-trait px-[18px] py-4 text-[15px] font-bold text-encre">
      <Icone nom={icone} className="text-brand" /><span className="flex-1">{children}</span>
      <Icone nom="fleche" taille={16} className="text-gris" />
    </Link>
  );
}
