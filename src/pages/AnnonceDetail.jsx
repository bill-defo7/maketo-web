import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { annoncesApi } from '../api/services.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Icone from '../components/Icone.jsx';
import Photo from '../components/Photo.jsx';
import BoutonFavori from '../components/BoutonFavori.jsx';
import Chargement from '../components/Chargement.jsx';
import Vide from '../components/Vide.jsx';
import Visionneuse from '../components/Visionneuse.jsx';
import FeuilleBas from '../components/FeuilleBas.jsx';
import { useToast } from '../components/Toast.jsx';
import { estMessage, formatPrix, initiales, LIBELLES_ETAT, LIBELLES_MOTIF, tempsRelatif } from '../utils/format.js';

const MESSAGES_STATUT = {
  EXPIREE: "Cette annonce a expiré : elle n'est plus visible par les autres étudiants.",
  VENDUE: 'Cet article a été vendu.',
  SUSPENDUE: "Cette annonce est masquée en attendant une vérification de l'administrateur."
};

export default function AnnonceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const [photoActive, setPhotoActive] = useState(0);
  const [visionneuse, setVisionneuse] = useState(null); // index de la photo ouverte en plein écran
  const [erreurContact, setErreurContact] = useState('');
  const [contactEnCours, setContactEnCours] = useState(false);
  const [message, setMessage] = useState('');
  const [signalementOuvert, setSignalementOuvert] = useState(false);

  const { data: annonce, isPending, isError, error } = useQuery({
    queryKey: ['annonce', id, !!utilisateur],
    queryFn: () => annoncesApi.detail(id)
  });

  const retour = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'));

  if (isPending) return <Chargement />;
  if (isError) {
    return error.status === 404
      ? <Vide titre="Annonce introuvable" texte="Elle a peut-être été vendue ou retirée." action="Voir les autres annonces" lien="/" />
      : <Vide titre="Oups" texte={error.message} action="Retour à l'accueil" lien="/" />;
  }

  const petite = estMessage(annonce);
  const estProprietaire = utilisateur?.id === annonce.vendeur.id;
  const avecPhotos = annonce.photos.length > 0;
  const messageStatut = MESSAGES_STATUT[annonce.statut] || (new Date(annonce.dateExpiration) < new Date() ? MESSAGES_STATUT.EXPIREE : null);

  const partager = async () => {
    const lien = window.location.href;
    const texte = petite ? `${annonce.titre} — sur Maketo` : `${annonce.titre} à ${formatPrix(annonce.prix, annonce.prixADebattre)} sur Maketo`;
    try {
      if (navigator.share) {
        await navigator.share({ title: annonce.titre, text: texte, url: lien });
      } else {
        await navigator.clipboard.writeText(lien);
        setMessage('Lien copié !');
        setTimeout(() => setMessage(''), 2500);
      }
    } catch { /* partage annulé */ }
  };

  const ecrireSurWhatsApp = async () => {
    setErreurContact('');
    setContactEnCours(true);
    // La fenêtre s'ouvre tout de suite (sinon le navigateur la bloque), puis on y charge le lien WhatsApp
    const fenetre = window.open('', '_blank');
    try {
      const { lienWhatsapp } = await annoncesApi.contacter(annonce.id);
      if (fenetre) fenetre.location.href = lienWhatsapp; else window.location.href = lienWhatsapp;
    } catch (e) {
      fenetre?.close();
      setErreurContact(e.message);
    } finally {
      setContactEnCours(false);
    }
  };

  const boutonsHaut = (surPhoto) => (
    <>
      <button type="button" onClick={retour} aria-label="Retour"
        className={`btn-rond ${surPhoto ? 'bg-white/95 text-noir' : 'border border-bordure bg-surface text-encre'}`}><Icone nom="retour" epaisseur={2.2} /></button>
      <div className="flex gap-2">
        <button type="button" onClick={partager} aria-label="Partager l'annonce"
          className={`btn-rond ${surPhoto ? 'bg-white/95 text-noir' : 'border border-bordure bg-surface text-encre'}`}><Icone nom="partager" taille={19} /></button>
        {!estProprietaire && <BoutonFavori annonceId={annonce.id} taille="grand" />}
      </div>
    </>
  );

  return (
    <main className="pb-36 md:grid md:grid-cols-2 md:items-start md:gap-10 md:px-6 md:pb-16 md:pt-8">
      {/* Galerie : photo entière sur fond flouté, un toucher l'ouvre en plein écran */}
      {avecPhotos ? (
        <div className="relative md:sticky md:top-24 md:overflow-hidden md:rounded-[28px]">
          <div className="defilement flex snap-x snap-mandatory overflow-x-auto"
            onScroll={(e) => setPhotoActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
            {annonce.photos.map((p, i) => (
              <button key={p.id} type="button" onClick={() => setVisionneuse(i)} aria-label={`Voir la photo ${i + 1} en grand`}
                className="relative h-[380px] w-full flex-none snap-center overflow-hidden bg-brun md:h-[560px]">
                <img src={p.url} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
                <img src={p.url} alt={`${annonce.titre}, photo ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} className="relative h-full w-full object-contain" />
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-4 top-4 flex justify-between [&>*]:pointer-events-auto">{boutonsHaut(true)}</div>
          <span className="pointer-events-none absolute bottom-9 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-bold text-white md:bottom-4">
            <Icone nom="agrandir" taille={14} />{annonce.photos.length > 1 ? `${photoActive + 1} / ${annonce.photos.length}` : 'Agrandir'}
          </span>
          {annonce.photos.length > 1 && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-9 flex justify-center gap-1.5 md:bottom-4">
              {annonce.photos.map((p, i) => <span key={p.id} className={`h-[7px] rounded-full ${i === photoActive ? 'w-[26px] bg-white' : 'w-[7px] bg-white/45'}`} />)}
            </div>
          )}
        </div>
      ) : petite ? (
        <div className="flex justify-between px-4 pt-5 md:hidden">{boutonsHaut(false)}</div>
      ) : (
        <div className="relative md:sticky md:top-24 md:overflow-hidden md:rounded-[28px]">
          <Photo src={null} alt="" sombre className="h-[300px] w-full md:h-[560px]" />
          <div className="absolute inset-x-4 top-4 flex justify-between">{boutonsHaut(true)}</div>
        </div>
      )}

      {/* Contenu */}
      <div className={`relative bg-creme px-[18px] md:mt-0 md:rounded-none md:bg-transparent md:px-0 md:pt-0 ${avecPhotos || !petite ? '-mt-6 rounded-t-[26px] pt-[22px]' : 'pt-4'}`}>
        {petite && !avecPhotos && <div className="mb-4 hidden justify-between md:flex">{boutonsHaut(false)}</div>}
        {messageStatut && <p className="mb-4 rounded-2xl bg-sable px-4 py-3 text-sm font-semibold text-texte2">{messageStatut}</p>}

        <div className="flex flex-wrap gap-2">
          {annonce.boostee && <span className="rounded-full bg-brand px-3 py-1.5 text-xs font-extrabold text-white">À la une</span>}
          <span className="rounded-full bg-brand-clair px-3 py-1.5 text-xs font-extrabold text-brand-fonce">{annonce.categorie.nom}</span>
        </div>

        {petite ? (
          <>
            {/* Petite annonce : le message EST le contenu */}
            <h1 className="sr-only">{annonce.titre}</h1>
            <blockquote className="mt-4 whitespace-pre-line rounded-[22px] bg-surface p-5 text-[17px] leading-relaxed text-encre shadow-carte">
              {annonce.description}
            </blockquote>
            <p className="mt-3 text-sm text-gris">{tempsRelatif(annonce.dateCreation)}{annonce.lieu ? ` · ${annonce.lieu}` : ''}</p>
          </>
        ) : (
          <>
            <p className="mt-3.5 text-[32px] font-extrabold tracking-[-.02em] text-brand">{formatPrix(annonce.prix, annonce.prixADebattre)}</p>
            <h1 className="mt-1 text-[22px] font-extrabold leading-tight">{annonce.titre}</h1>
            <dl className="mt-4 grid grid-cols-3 gap-2">
              <Info terme="État" valeur={LIBELLES_ETAT[annonce.etat]} />
              <Info terme="Lieu" valeur={annonce.lieu || 'Campus'} />
              <Info terme="Publiée" valeur={tempsRelatif(annonce.dateCreation)} />
            </dl>
            {annonce.description && (
              <>
                <h2 className="mb-2 mt-6 text-base font-extrabold">Description</h2>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-texte2">{annonce.description}</p>
              </>
            )}
          </>
        )}

        <Link to={`/vendeurs/${annonce.vendeur.id}`} className="mt-6 flex items-center gap-3 rounded-[20px] border border-trait bg-surface p-3.5 text-encre">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-nuit font-display text-[17px] font-extrabold text-brand-peche">
            {initiales(...annonce.vendeur.nomAffiche.split(' '))}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[15px] font-extrabold">
              {annonce.vendeur.nomAffiche}
              {annonce.vendeur.pro && <span className="rounded-full bg-nuit px-2 py-0.5 text-[11px] font-extrabold text-brand-peche">PRO</span>}
            </span>
            <span className="mt-0.5 block truncate text-[13px] text-gris">{annonce.vendeur.filiere ? `${annonce.vendeur.filiere} · ` : ''}Étudiant vérifié</span>
          </span>
          <span className="text-[13px] font-extrabold text-brand">Vitrine</span>
        </Link>

        <div className="mt-3.5 flex gap-3 rounded-[18px] bg-brand-clair p-3.5">
          <Icone nom="bouclier" taille={22} className="flex-none text-brand-fonce" />
          <p className="text-[13px] leading-normal text-alerte">
            <strong>Bon réflexe :</strong> {petite ? 'rencontre la personne au campus avant tout échange d\'argent.' : 'rencontre le vendeur au campus et vérifie l\'article avant de payer.'}
          </p>
        </div>
        <p className="mt-4 text-center text-xs text-gris">{annonce.nbVues} vue{annonce.nbVues > 1 ? 's' : ''}</p>
        {utilisateur && !estProprietaire && (
          <button type="button" onClick={() => setSignalementOuvert(true)} className="mx-auto mt-2 block py-3 text-[13px] font-bold text-gris underline">
            Signaler cette annonce
          </button>
        )}

        {/* Barre d'action : fixée en bas sur téléphone, intégrée à la colonne sur ordinateur */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-trait bg-surface px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-3 md:static md:mt-6 md:rounded-[22px] md:border md:p-4">
          {message && <p role="status" className="mb-2 text-center text-sm font-bold text-brand">{message}</p>}
          {erreurContact && <p role="alert" className="mb-2 text-center text-sm font-semibold text-red-700">{erreurContact}</p>}
          {estProprietaire ? (
            <div className="flex gap-2.5">
              <Link to={`/annonces/${annonce.id}/modifier`} className="btn-contour flex-1">Modifier</Link>
              <Link to="/mes-annonces" className="btn-primaire flex-1">Gérer</Link>
            </div>
          ) : utilisateur ? (
            <div className="flex gap-2.5">
              <a href={`tel:+237${annonce.vendeur.whatsapp}`} aria-label={petite ? "Appeler l'auteur" : 'Appeler le vendeur'}
                className="flex h-14 w-14 flex-none items-center justify-center rounded-full border-[1.5px] border-bordure text-encre">
                <Icone nom="telephone" taille={21} />
              </a>
              <button type="button" onClick={ecrireSurWhatsApp} disabled={contactEnCours} className="btn-primaire flex-1">
                <Icone nom="whatsapp" />{contactEnCours ? 'Ouverture…' : 'Répondre sur WhatsApp'}
              </button>
            </div>
          ) : (
            <>
              <p className="mb-2.5 text-center text-[13px] text-gris">Le numéro est réservé aux étudiants inscrits.</p>
              <Link to={`/connexion?retour=/annonces/${annonce.id}`} className="btn-primaire w-full">Se connecter pour répondre</Link>
            </>
          )}
        </div>
      </div>

      <FeuilleSignalement annonceId={annonce.id} ouvert={signalementOuvert} onFermer={() => setSignalementOuvert(false)} />
      {visionneuse !== null && <Visionneuse photos={annonce.photos} indexDepart={visionneuse} onFermer={() => setVisionneuse(null)} />}
    </main>
  );
}

function FeuilleSignalement({ annonceId, ouvert, onFermer }) {
  const toast = useToast();
  const [motif, setMotif] = useState('ARNAQUE');
  const [commentaire, setCommentaire] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const envoyer = async () => {
    setEnvoi(true);
    setErreur('');
    try {
      await annoncesApi.signaler(annonceId, { motif, commentaire: commentaire.trim() || null });
      toast("Merci ! L'équipe Maketo va vérifier.");
      onFermer();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <FeuilleBas ouvert={ouvert} titre="Signaler l'annonce" onFermer={onFermer}>
      <fieldset className="mt-4">
        <legend className="sr-only">Motif</legend>
        <div className="flex flex-col gap-2">
          {Object.entries(LIBELLES_MOTIF).map(([cle, libelle]) => (
            <label key={cle} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3.5 ${motif === cle ? 'border-brand bg-brand-clair' : 'border-bordure bg-surface'}`}>
              <input type="radio" name="motif" value={cle} checked={motif === cle} onChange={() => setMotif(cle)} className="h-5 w-5 accent-[#C2410C]" />
              <span className="font-bold">{libelle}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label htmlFor="commentaire-signalement" className="etiquette mt-4">Précisions <span className="font-semibold text-gris">· facultatif</span></label>
      <textarea id="commentaire-signalement" rows={3} maxLength={500} value={commentaire} onChange={(e) => setCommentaire(e.target.value)}
        className="w-full resize-none rounded-2xl border-[1.5px] border-bordure bg-surface px-4 py-3 text-[15px] focus:border-brand focus:outline-none" />
      {erreur && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{erreur}</p>}
      <button type="button" onClick={envoyer} disabled={envoi} className="btn-primaire mt-4 w-full">{envoi ? 'Envoi…' : 'Envoyer le signalement'}</button>
    </FeuilleBas>
  );
}

function Info({ terme, valeur }) {
  return (
    <div className="rounded-2xl border border-trait bg-surface p-3">
      <dt className="text-xs text-gris">{terme}</dt>
      <dd className="mt-0.5 truncate text-sm font-extrabold">{valeur}</dd>
    </div>
  );
}
