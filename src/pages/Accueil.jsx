import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { annoncesApi, categoriesApi } from '../api/services.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Logo from '../components/Logo.jsx';
import Icone from '../components/Icone.jsx';
import Vide from '../components/Vide.jsx';
import BannierePub from '../components/BannierePub.jsx';
import { CarteAnnonce, CarteMessage, CarteUne, SqueletteCarte } from '../components/CarteAnnonce.jsx';
import Confiance from '../components/accueil/Confiance.jsx';
import CommentCaMarche from '../components/accueil/CommentCaMarche.jsx';
import TuilesCategories from '../components/accueil/TuilesCategories.jsx';
import QuestionsFrequentes from '../components/accueil/QuestionsFrequentes.jsx';
import PiedDePage from '../components/accueil/PiedDePage.jsx';
import Apparait from '../components/Apparait.jsx';
import { BoutonTheme } from '../components/Theme.jsx';
import { BoutonLangue } from '../i18n/Langue.jsx';
import { initiales } from '../utils/format.js';

export default function Accueil({ modeRecherche = false }) {
  const { utilisateur, pret } = useAuth();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const categorie = params.get('categorie') || '';
  const type = params.get('type') || '';
  const filtre = Boolean(q || categorie || type);
  const [saisie, setSaisie] = useState(q);
  const champRecherche = useRef(null);

  useEffect(() => setSaisie(q), [q]);
  useEffect(() => { if (modeRecherche) champRecherche.current?.focus(); }, [modeRecherche]);

  const categories = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.lister, staleTime: 3600_000 });
  const aLaUne = useQuery({ queryKey: ['annonces', 'a-la-une'], queryFn: annoncesApi.aLaUne, enabled: !filtre });
  const messages = useQuery({ queryKey: ['annonces', 'messages'], queryFn: annoncesApi.petitesAnnonces, enabled: !filtre });
  const liste = useInfiniteQuery({
    queryKey: ['annonces', 'liste', { q, categorie, type }],
    queryFn: ({ pageParam }) => annoncesApi.rechercher({ q, categorie, type }, pageParam),
    initialPageParam: 0,
    getNextPageParam: (derniere) => (derniere.page + 1 < derniere.totalPages ? derniere.page + 1 : undefined)
  });
  const annonces = liste.data?.pages.flatMap((p) => p.contenu) ?? [];

  const changerFiltre = (cle, valeur) => {
    const suivants = new URLSearchParams(params);
    if (valeur) suivants.set(cle, valeur); else suivants.delete(cle);
    setParams(suivants);
  };

  const lancerRecherche = (e) => {
    e.preventDefault();
    champRecherche.current?.blur(); // ferme le clavier sur mobile
    changerFiltre('q', saisie.trim());
  };

  const nomCategorie = categories.data?.find((c) => c.slug === categorie)?.nom;

  return (
    <main className="pb-28 md:pb-16">
      {/* En-tête sombre + recherche */}
      <section className="rounded-b-[28px] bg-nuit px-4 pb-7 pt-4 text-white md:mx-6 md:mt-6 md:rounded-[32px] md:px-12 md:pb-14 md:pt-12">
        <header className="flex items-center justify-between rounded-full border border-white/15 bg-white/[.08] py-2 pl-[18px] pr-2 md:hidden">
          <Logo />
          <div className="flex items-center gap-1.5">
          <BoutonLangue surFondSombre />
          <BoutonTheme surFondSombre />
          {!pret ? (
            <span aria-label="Chargement" className="h-11 w-11 animate-pulse rounded-full bg-white/15" />
          ) : utilisateur ? (
            <Link to="/compte" aria-label="Mon compte"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand font-display text-sm font-extrabold text-white">
              {initiales(utilisateur.prenom, utilisateur.nom)}
            </Link>
          ) : (
            <Link to="/connexion" className="flex h-11 items-center whitespace-nowrap rounded-full border border-white/30 px-4 text-sm font-bold text-white">
              Se connecter
            </Link>
          )}
          </div>
        </header>

        <div className="px-1 pt-7 md:max-w-2xl md:pt-0">
          {!filtre && !modeRecherche && (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[.06em]">
                <span className="h-2 w-2 rounded-full bg-brand-vif" />Campus ESTLC · Ambam
              </span>
              <h1 className="mt-4 font-display text-[30px] font-extrabold leading-[1.05] tracking-[-.04em] md:text-[52px]">
                Vends. Achète.<br /><span className="text-brand-vif">Entre étudiants.</span>
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-doux md:text-lg">Habits, téléphones, logement, cours… tout le campus au même endroit.</p>
            </>
          )}
          {(filtre || modeRecherche) && <h1 className="font-display text-[28px] font-extrabold tracking-[-.03em]">Rechercher</h1>}

          <form role="search" onSubmit={lancerRecherche} className="mt-5 flex items-center gap-2 rounded-full bg-surface py-1.5 pl-[18px] pr-1.5 md:mt-8 md:max-w-xl">
            <Icone nom="recherche" className="flex-none text-gris" />
            <label htmlFor="recherche" className="sr-only">Rechercher un article</label>
            <input id="recherche" ref={champRecherche} type="search" enterKeyHint="search" value={saisie}
              onChange={(e) => setSaisie(e.target.value)} placeholder="Un lit, un téléphone, des mèches…"
              className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-encre outline-none placeholder:text-gris/80" />
            <button type="submit" aria-label="Lancer la recherche"
              className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-brand text-white">
              <Icone nom="fleche" taille={18} epaisseur={2.4} />
            </button>
          </form>
        </div>
      </section>

      {/* Catégories */}
      <nav aria-label="Catégories" className="defilement flex gap-2 overflow-x-auto px-4 pb-1 pt-5 md:flex-wrap md:px-6 md:pt-8">
        <Puce actif={!categorie} onClick={() => changerFiltre('categorie', '')}>Tout</Puce>
        {categories.data?.map((c) => (
          <Puce key={c.id} actif={categorie === c.slug} onClick={() => changerFiltre('categorie', c.slug)}>{c.nom}</Puce>
        ))}
        {categories.isPending && [1, 2, 3, 4].map((i) => <span key={i} className="squelette h-11 w-24 flex-none rounded-full" />)}
      </nav>

      {!filtre && <BannierePub />}

      {/* À la une (seulement sans filtre) */}
      {!filtre && aLaUne.data?.length > 0 && (
        <section className="pt-6" aria-labelledby="titre-une">
          <div className="px-4 md:px-6">
            <p className="surtitre">À la une</p>
            <h2 id="titre-une" className="titre-section">Boostées aujourd'hui</h2>
          </div>
          <div className="defilement flex snap-x gap-3 overflow-x-auto px-4 pb-1.5 pt-4 md:px-6">
            {aLaUne.data.map((a, i) => <CarteUne key={a.id} annonce={a} ordre={i} />)}
          </div>
        </section>
      )}

      {/* Petites annonces (messages) */}
      {!filtre && messages.data?.contenu.length > 0 && (
        <section className="pt-6" aria-labelledby="titre-messages">
          <div className="flex items-end justify-between px-4 md:px-6">
            <div>
              <p className="surtitre">Petites annonces</p>
              <h2 id="titre-messages" className="titre-section">On cherche, on propose</h2>
            </div>
            <button type="button" onClick={() => changerFiltre('type', 'MESSAGE')} className="py-2.5 text-sm font-bold text-brand">Tout voir</button>
          </div>
          <div className="defilement flex snap-x gap-3 overflow-x-auto px-4 pb-1.5 pt-4 md:px-6">
            {messages.data.contenu.map((a, i) => <CarteMessage key={a.id} annonce={a} ordre={i} />)}
          </div>
        </section>
      )}

      {/* Liste */}
      <section className="px-4 pt-6 md:px-6 md:pt-10" aria-labelledby="titre-liste">
        <p className="surtitre">{filtre ? 'Résultats' : 'Nouveautés'}</p>
        <h2 id="titre-liste" className="titre-section mb-4">
          {q ? `« ${q} »` : nomCategorie || (type === 'MESSAGE' ? 'Petites annonces' : 'Près de toi')}
        </h2>

        {liste.isPending && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">{[1, 2, 3, 4].map((i) => <SqueletteCarte key={i} />)}</div>}

        {liste.isError && <Vide titre="Oups, impossible de charger" texte={liste.error.message} action="Réessayer" onAction={() => liste.refetch()} />}

        {liste.isSuccess && annonces.length === 0 && (
          filtre
            ? <Vide titre="Aucun résultat" texte="Essaie un autre mot ou une autre catégorie." action="Tout afficher" onAction={() => setParams({})} />
            : <Vide titre="Pas encore d'annonce" texte="Sois le premier à vendre quelque chose sur le campus !" action="Publier une annonce" lien="/vendre" />
        )}

        {annonces.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">{annonces.map((a, i) => <CarteAnnonce key={a.id} annonce={a} ordre={i} />)}</div>
        )}

        {liste.hasNextPage && (
          <button type="button" onClick={() => liste.fetchNextPage()} disabled={liste.isFetchingNextPage} className="btn-contour mt-5 w-full md:mx-auto md:flex md:w-auto md:px-10">
            {liste.isFetchingNextPage ? 'Chargement…' : 'Voir plus d\'annonces'}
          </button>
        )}
      </section>

      {!filtre && <><Confiance /><CommentCaMarche /><TuilesCategories /></>}

      {/* Appel à vendre */}
      {!filtre && (
        <Apparait as="section" className="mx-4 mt-7 rounded-[26px] bg-nuit px-5 py-6 text-white md:mx-6 md:mt-12 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-2 md:px-12 md:py-12">
          <p className="text-xs font-extrabold uppercase tracking-[.14em] text-brand-peche md:col-start-1">Tu as quelque chose à vendre ?</p>
          <h2 className="mt-2 font-display text-[22px] font-extrabold leading-[1.1] tracking-[-.03em] md:col-start-1 md:text-[30px]">Publie en 2 minutes, c'est gratuit.</h2>
          <ol className="mt-5 space-y-3 md:col-start-2 md:row-span-3 md:row-start-1 md:mt-0 md:self-center">
            {['Prends 1 à 4 photos (ou écris un simple message)', 'Fixe ton prix (ou « à débattre »)', "Les étudiants t'écrivent sur WhatsApp"].map((etape, i) => (
              <li key={etape} className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand font-extrabold">{i + 1}</span>
                <span className="text-[15px] text-doux">{etape}</span>
              </li>
            ))}
          </ol>
          <Link to="/vendre" className="btn-vif mt-5 w-full md:col-start-1 md:mt-6 md:w-auto md:justify-self-start">Publier une annonce <Icone nom="fleche" taille={18} epaisseur={2.4} /></Link>
        </Apparait>
      )}
      {!filtre && <QuestionsFrequentes />}
      <PiedDePage />
    </main>
  );
}

function Puce({ actif, onClick, children }) {
  return (
    <button type="button" aria-pressed={actif} onClick={onClick}
      className={`h-11 flex-none whitespace-nowrap rounded-full px-[18px] text-sm font-bold ${actif ? 'bg-brand text-white' : 'border border-bordure bg-surface text-encre'}`}>
      {children}
    </button>
  );
}
