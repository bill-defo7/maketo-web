import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { annoncesApi, categoriesApi } from '../api/services.js';
import EnTetePage from '../components/EnTetePage.jsx';
import Champ from '../components/Champ.jsx';
import Icone from '../components/Icone.jsx';
import Chargement from '../components/Chargement.jsx';
import { useToast } from '../components/Toast.jsx';
import { compresserImage } from '../utils/image.js';
import { stockage } from '../utils/stockage.js';
import { SLUG_PETITES_ANNONCES } from '../utils/format.js';
import { useAuth } from '../auth/AuthContext.jsx';

const SLUG_OBJETS_PERDUS = 'objets-perdus';
/** Catégories réservées aux messages (pas de prix ni d'état). */
const SLUGS_MESSAGES = [SLUG_PETITES_ANNONCES, SLUG_OBJETS_PERDUS];

const MAX_PHOTOS = 4;
const CLE_BROUILLON = 'maketo:brouillon';
const VIDE = { type: 'ARTICLE', categorieId: null, titre: '', description: '', prix: '', prixADebattre: false, etat: 'OCCASION', lieu: 'Campus', telephoneContact: '' };
const nouvelleCle = () => Math.random().toString(36).slice(2);

/** Création ET modification d'une annonce (/vendre et /annonces/:id/modifier). */
export default function Vendre() {
  const { id } = useParams();
  const modification = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { utilisateur } = useAuth();
  const estAdmin = utilisateur?.role === 'ADMIN';
  const champFichier = useRef(null);
  const initialise = useRef(false);

  const [valeurs, setValeurs] = useState(() => (modification ? VIDE : { ...VIDE, ...(stockage.lire(CLE_BROUILLON) || {}) }));
  const [photos, setPhotos] = useState([]);
  const [erreurs, setErreurs] = useState({});
  const [erreurGenerale, setErreurGenerale] = useState('');
  const [quotaAtteint, setQuotaAtteint] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [annonceCreee, setAnnonceCreee] = useState(null); // annonce enregistrée mais photos incomplètes

  const categories = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.lister, staleTime: 3600_000 });
  const existante = useQuery({ queryKey: ['annonce', id, 'edition'], queryFn: () => annoncesApi.detail(id), enabled: modification });

  // Modification : on pré-remplit une seule fois
  useEffect(() => {
    if (!existante.data || initialise.current) return;
    initialise.current = true;
    const a = existante.data;
    setValeurs({
      type: a.type, categorieId: a.categorie.id, titre: a.titre, description: a.description || '',
      prix: a.prix ?? '', prixADebattre: a.prixADebattre, etat: a.etat || 'OCCASION', lieu: a.lieu || '',
      telephoneContact: a.vendeur?.whatsapp || ''
    });
    setPhotos(a.photos.map((p) => ({ cle: `p${p.id}`, id: p.id, apercu: p.url, statut: 'ok', existante: true })));
  }, [existante.data]);

  // Création : brouillon gardé si l'étudiant quitte la page ou perd la connexion
  useEffect(() => {
    if (!modification) stockage.ecrire(CLE_BROUILLON, valeurs);
  }, [valeurs, modification]);

  // Libère la mémoire des aperçus
  useEffect(() => () => photos.forEach((p) => !p.existante && p.apercu && URL.revokeObjectURL(p.apercu)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const changer = (cle, valeur) => {
    setValeurs((v) => ({ ...v, [cle]: valeur }));
    setErreurs((e) => ({ ...e, [cle]: undefined }));
  };
  const majPhoto = (cle, maj) => setPhotos((liste) => liste.map((p) => (p.cle === cle ? { ...p, ...maj } : p)));

  const ajouterPhotos = async (e) => {
    const fichiers = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - photos.length);
    e.target.value = '';
    for (const fichier of fichiers) {
      const cle = nouvelleCle();
      setPhotos((liste) => [...liste, { cle, statut: 'preparation' }]);
      try {
        const compressee = await compresserImage(fichier);
        majPhoto(cle, { fichier: compressee, apercu: URL.createObjectURL(compressee), statut: 'attente' });
      } catch (err) {
        majPhoto(cle, { statut: 'invalide', erreur: err.message });
      }
    }
  };

  const retirerPhoto = async (photo) => {
    if (photo.existante) {
      try {
        await annoncesApi.supprimerPhoto(id, photo.id);
      } catch (err) {
        toast(err.message, 'erreur');
        return;
      }
    } else if (photo.apercu) {
      URL.revokeObjectURL(photo.apercu);
    }
    setPhotos((liste) => liste.filter((p) => p.cle !== photo.cle));
  };

  const petite = valeurs.type === 'MESSAGE';
  const idPetitesAnnonces = categories.data?.find((c) => c.slug === SLUG_PETITES_ANNONCES)?.id;
  const idsMessages = (categories.data || []).filter((c) => SLUGS_MESSAGES.includes(c.slug)).map((c) => c.id);
  const numeroContact = valeurs.telephoneContact.replace(/\D/g, '').replace(/^237(?=6\d{8}$)/, '');

  /** Article ou simple message : le message n'a ni prix, ni état, ni titre à écrire. */
  const choisirType = (type) => {
    setErreurs({});
    setValeurs((v) => ({
      ...v,
      type,
      categorieId: type === 'MESSAGE' ? (idPetitesAnnonces ?? v.categorieId) : (idsMessages.includes(v.categorieId) ? null : v.categorieId)
    }));
  };

  const valider = () => {
    const e = {};
    if (!valeurs.categorieId) e.categorieId = 'Choisis une catégorie';
    if (estAdmin && !/^6\d{8}$/.test(numeroContact)) e.telephoneContact = 'Indique le numéro WhatsApp à contacter (6XXXXXXXX)';
    if (petite) {
      if (valeurs.description.trim().length < 10) e.description = 'Écris ton message (10 caractères minimum)';
      setErreurs(e);
      return Object.keys(e).length === 0;
    }
    if (valeurs.titre.trim().length < 3) e.titre = 'Le titre doit faire au moins 3 caractères';
    if (!valeurs.prixADebattre && valeurs.prix === '') e.prix = 'Indique un prix ou coche « Prix à débattre »';
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  /** Envoie une à une les photos pas encore en ligne. Renvoie le nombre d'échecs. */
  const envoyerPhotos = async (annonceId) => {
    let echecs = 0;
    for (const photo of photos) {
      if (!photo.fichier || photo.statut === 'ok') continue;
      majPhoto(photo.cle, { statut: 'envoi', progression: 0, erreur: undefined });
      try {
        await annoncesApi.ajouterPhoto(annonceId, photo.fichier, (progression) => majPhoto(photo.cle, { progression }));
        majPhoto(photo.cle, { statut: 'ok' });
      } catch (err) {
        echecs += 1;
        majPhoto(photo.cle, { statut: 'erreur', erreur: err.message });
      }
    }
    return echecs;
  };

  const terminer = (annonceId) => {
    queryClient.invalidateQueries({ queryKey: ['annonces'] });
    queryClient.invalidateQueries({ queryKey: ['mes-annonces'] });
    queryClient.invalidateQueries({ queryKey: ['annonce'] });
    if (modification) {
      toast('Annonce mise à jour');
      navigate(`/annonces/${annonceId}`, { replace: true });
    } else {
      stockage.effacer(CLE_BROUILLON);
      navigate(`/annonces/${annonceId}/publiee`, { replace: true });
    }
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setErreurGenerale('');
    setQuotaAtteint(false);
    if (!annonceCreee && !valider()) return;
    setEnvoi(true);
    try {
      let annonceId = annonceCreee || id;
      if (!annonceCreee) {
        const corps = petite ? {
          type: 'MESSAGE',
          categorieId: valeurs.categorieId,
          titre: null,
          description: valeurs.description.trim(),
          prix: null,
          prixADebattre: false,
          etat: null,
          lieu: valeurs.lieu.trim() || null,
          telephoneContact: estAdmin ? numeroContact : null
        } : {
          type: 'ARTICLE',
          categorieId: valeurs.categorieId,
          titre: valeurs.titre.trim(),
          description: valeurs.description.trim() || null,
          prix: valeurs.prixADebattre && valeurs.prix === '' ? null : Number(String(valeurs.prix).replace(/\s/g, '')),
          prixADebattre: valeurs.prixADebattre,
          etat: valeurs.etat,
          lieu: valeurs.lieu.trim() || null,
          telephoneContact: estAdmin ? numeroContact : null
        };
        const annonce = modification ? await annoncesApi.modifier(id, corps) : await annoncesApi.publier(corps);
        annonceId = annonce.id;
        setAnnonceCreee(annonceId);
      }
      const echecs = await envoyerPhotos(annonceId);
      if (echecs === 0) terminer(annonceId);
      else setErreurGenerale(`${echecs} photo${echecs > 1 ? 's n\'ont' : ' n\'a'} pas pu être envoyée${echecs > 1 ? 's' : ''}. Vérifie ta connexion puis réessaie.`);
    } catch (err) {
      setErreurs(err.erreurs || {});
      if (err.message.includes('publications gratuites')) setQuotaAtteint(true);
      setErreurGenerale(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  if (modification && existante.isPending) return <Chargement />;

  const photosValides = photos.filter((p) => p.statut !== 'invalide').length;
  const peutAjouter = photosValides < MAX_PHOTOS;

  return (
    <main className="pb-32 md:mx-auto md:max-w-2xl md:pb-16">
      <EnTetePage titre={modification ? "Modifier l'annonce" : 'Publier'} icone="fermer" repli={modification ? '/mes-annonces' : '/'} />

      {!modification && (
        <div role="radiogroup" aria-label="Que veux-tu publier ?" className="mx-4 mt-2.5 grid grid-cols-2 gap-2.5">
          <ChoixType actif={!petite} onClick={() => choisirType('ARTICLE')} icone="boite" titre="Un article" texte="Je vends un objet ou un service, avec un prix" />
          <ChoixType actif={petite} onClick={() => choisirType('MESSAGE')} icone="message" titre="Un message" texte="Je cherche, je propose, objet perdu ou trouvé : un texte suffit" />
        </div>
      )}

      {!modification && (
        <div className="mx-4 mt-3 flex items-center gap-2.5 rounded-2xl bg-nuit px-3.5 py-3 text-white">
          <span className="flex-none rounded-full bg-brand-vif px-2.5 py-1 text-xs font-extrabold text-noir">Gratuit</span>
          <p className="text-[13px] leading-snug text-doux">{petite ? 'Ton message' : 'Ton annonce'} reste en ligne 7 jours. Tu pourras la renouveler en un clic.</p>
        </div>
      )}

      <form id="form-annonce" onSubmit={soumettre} noValidate className="flex flex-col gap-6 px-4 pt-5">
        {petite && (
          <div>
            <label htmlFor="message" className="etiquette text-base font-extrabold">Ton message</label>
            <textarea id="message" rows={6} maxLength={2000} value={valeurs.description} onChange={(e) => changer('description', e.target.value)}
              aria-invalid={!!erreurs.description} aria-describedby="aide-message"
              placeholder="Ex. Salut, je suis Amougou (GSI 4). Je donne des cours de maths et de PCT aux élèves de Terminale, le week-end. Écrivez-moi !"
              className={`w-full resize-none rounded-2xl border-[1.5px] bg-surface px-4 py-3.5 text-base leading-relaxed focus:border-brand focus:outline-none ${erreurs.description ? 'border-red-600' : 'border-bordure'}`} />
            <div id="aide-message" className="mt-1.5 flex justify-between text-xs text-gris">
              <span className={erreurs.description ? 'font-semibold text-red-700' : ''}>{erreurs.description || 'La première ligne sert de titre.'}</span>
              <span>{valeurs.description.length} / 2000</span>
            </div>
          </div>
        )}

        {/* Photos */}
        <fieldset>
          <legend className="text-base font-extrabold">Photos <span className="font-semibold text-gris">· {petite ? 'facultatif' : `jusqu'à ${MAX_PHOTOS}`}</span></legend>
          <div className="mt-2.5 grid grid-cols-4 gap-2 md:gap-3">
            {photos.map((p, i) => <VignettePhoto key={p.cle} photo={p} principale={i === 0} onRetirer={() => retirerPhoto(p)} desactive={envoi} />)}
            {peutAjouter && (
              <button type="button" onClick={() => champFichier.current?.click()} disabled={envoi}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-brand bg-brand-clair text-brand-fonce ${photos.length === 0 ? 'col-span-4 h-40 text-sm font-extrabold' : 'aspect-square text-[11px] font-extrabold'}`}>
                <Icone nom="photo" taille={photos.length === 0 ? 30 : 22} />
                {photos.length === 0 ? 'Ajouter des photos' : 'Ajouter'}
              </button>
            )}
          </div>
          <input ref={champFichier} type="file" accept="image/*" multiple onChange={ajouterPhotos} className="sr-only" tabIndex={-1} aria-hidden="true" />
          {!petite && <p className="mt-2 text-[13px] text-gris">La première photo s'affiche dans les listes. Une photo nette, à la lumière du jour, vend plus vite.</p>}
        </fieldset>

        {!petite && (
          <Champ label="Titre" value={valeurs.titre} onChange={(e) => changer('titre', e.target.value)} maxLength={100}
            placeholder="Ex. Lit 2 places + matelas" erreur={erreurs.titre} />
        )}

        {/* Catégorie */}
        <fieldset>
          <legend className="text-base font-extrabold">Catégorie</legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {categories.data?.filter((c) => petite || !SLUGS_MESSAGES.includes(c.slug)).map((c) => (
              <button key={c.id} type="button" aria-pressed={valeurs.categorieId === c.id} onClick={() => changer('categorieId', c.id)}
                className={`h-11 rounded-full px-4 text-sm ${valeurs.categorieId === c.id ? 'bg-brand font-extrabold text-white' : 'border-[1.5px] border-bordure bg-surface font-bold text-encre'}`}>
                {c.nom}
              </button>
            ))}
          </div>
          {erreurs.categorieId && <p className="mt-1.5 text-sm font-semibold text-red-700">{erreurs.categorieId}</p>}
        </fieldset>

        {!petite && (<>
        {/* Prix */}
        <div>
          <label htmlFor="prix" className="etiquette text-base font-extrabold">Prix</label>
          <div className={`flex h-[60px] items-center gap-2.5 rounded-2xl border-[1.5px] px-4 ${erreurs.prix ? 'border-red-600' : 'border-bordure'} ${valeurs.prixADebattre ? 'bg-sable' : 'bg-surface'}`}>
            <input id="prix" inputMode="numeric" value={valeurs.prix} placeholder={valeurs.prixADebattre ? 'Facultatif' : '25000'}
              onChange={(e) => changer('prix', e.target.value.replace(/[^\d]/g, ''))}
              className="min-w-0 flex-1 bg-transparent text-[22px] font-extrabold outline-none placeholder:font-semibold placeholder:text-gris/60" />
            <span className="font-extrabold text-gris">FCFA</span>
          </div>
          {erreurs.prix && <p className="mt-1.5 text-sm font-semibold text-red-700">{erreurs.prix}</p>}
          <button type="button" role="switch" aria-checked={valeurs.prixADebattre} onClick={() => changer('prixADebattre', !valeurs.prixADebattre)}
            className="mt-2.5 flex w-full items-center justify-between rounded-2xl border border-bordure bg-surface px-3.5 py-3">
            <span className="text-[15px] font-bold">Prix à débattre</span>
            <span className={`flex h-[30px] w-[50px] rounded-full p-[3px] transition ${valeurs.prixADebattre ? 'justify-end bg-brand' : 'justify-start bg-bordure'}`}>
              <span className="h-6 w-6 rounded-full bg-white shadow" />
            </span>
          </button>
        </div>

        {/* État */}
        <fieldset>
          <legend className="text-base font-extrabold">État</legend>
          <div className="mt-2.5 grid grid-cols-2 gap-1 rounded-full bg-sable p-1">
            {[['NEUF', 'Neuf'], ['OCCASION', 'Occasion']].map(([cle, libelle]) => (
              <button key={cle} type="button" aria-pressed={valeurs.etat === cle} onClick={() => changer('etat', cle)}
                className={`h-[46px] rounded-full text-[15px] ${valeurs.etat === cle ? 'bg-surface font-extrabold shadow-[0_4px_12px_-6px_rgba(120,52,10,.35)]' : 'font-bold text-gris'}`}>
                {libelle}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="description" className="etiquette text-base font-extrabold">Description <span className="font-semibold text-gris">· facultatif</span></label>
          <textarea id="description" rows={4} maxLength={2000} value={valeurs.description} onChange={(e) => changer('description', e.target.value)}
            placeholder="Dimensions, défauts éventuels, pourquoi tu vends…"
            className="w-full resize-none rounded-2xl border-[1.5px] border-bordure bg-surface px-4 py-3.5 text-[15px] focus:border-brand focus:outline-none" />
        </div>
        </>)}

        {estAdmin && (
          <Champ label="Numéro WhatsApp à contacter" type="tel" inputMode="numeric" value={valeurs.telephoneContact}
            onChange={(e) => changer('telephoneContact', e.target.value)} placeholder="6XX XX XX XX" erreur={erreurs.telephoneContact}
            aide="Tu publies pour quelqu'un : les intéressés écriront à ce numéro, pas au tien." />
        )}

        <Champ label={petite ? 'Lieu (facultatif)' : "Où récupérer l'article ?"} value={valeurs.lieu} onChange={(e) => changer('lieu', e.target.value)} maxLength={100}
          placeholder="Campus, Ambam centre…" erreur={erreurs.lieu} />

        {quotaAtteint ? (
          <div role="alert" className="rounded-[20px] bg-nuit p-4 text-white">
            <p className="text-sm leading-relaxed text-doux">{erreurGenerale}</p>
            <Link to="/compte" className="btn-vif mt-3 h-12 w-full text-sm">Découvrir Vendeur Pro</Link>
          </div>
        ) : erreurGenerale && (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{erreurGenerale}</p>
        )}
        {annonceCreee && erreurGenerale && !quotaAtteint && (
          <button type="button" onClick={() => terminer(annonceCreee)} className="btn-contour w-full">Continuer sans ces photos</button>
        )}
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-trait bg-surface px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-3 md:static md:mt-8 md:border-0 md:bg-transparent">
        <button type="submit" form="form-annonce" disabled={envoi || photos.some((p) => p.statut === 'preparation')} className="btn-primaire w-full">
          {envoi ? 'Envoi en cours…' : annonceCreee ? 'Réessayer l\'envoi des photos' : modification ? 'Enregistrer' : petite ? 'Publier mon message' : 'Publier mon annonce'}
          {!envoi && !annonceCreee && <Icone nom="fleche" taille={18} epaisseur={2.4} />}
        </button>
      </div>
    </main>
  );
}

function ChoixType({ actif, onClick, icone, titre, texte }) {
  return (
    <button type="button" role="radio" aria-checked={actif} onClick={onClick}
      className={`rounded-[20px] border-2 p-3.5 text-left ${actif ? 'border-brand bg-brand-clair' : 'border-bordure bg-surface'}`}>
      <Icone nom={icone} taille={22} className={actif ? 'text-brand-fonce' : 'text-gris'} />
      <span className="mt-2 block text-[15px] font-extrabold text-encre">{titre}</span>
      <span className="mt-0.5 block text-xs leading-snug text-gris">{texte}</span>
    </button>
  );
}

function VignettePhoto({ photo, principale, onRetirer, desactive }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl border border-bordure bg-sable">
      {photo.apercu && <img src={photo.apercu} alt="" className="h-full w-full object-cover" />}
      {photo.statut === 'preparation' && <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-texte2">Préparation…</span>}
      {photo.statut === 'invalide' && <span className="absolute inset-0 flex items-center justify-center p-1.5 text-center text-[10px] font-bold leading-tight text-red-800">{photo.erreur}</span>}
      {photo.statut === 'envoi' && (
        <span className="absolute inset-x-1.5 bottom-1.5 h-1.5 overflow-hidden rounded-full bg-white/70">
          <span className="block h-full bg-brand transition-all" style={{ width: `${photo.progression || 0}%` }} />
        </span>
      )}
      {photo.statut === 'erreur' && <span className="absolute inset-x-0 bottom-0 bg-red-700/90 py-0.5 text-center text-[10px] font-bold text-white">Échec</span>}
      {principale && photo.statut !== 'invalide' && <span className="absolute left-1 top-1 rounded-full bg-nuit/80 px-1.5 py-0.5 text-[9px] font-extrabold text-white">Principale</span>}
      <button type="button" onClick={onRetirer} disabled={desactive} aria-label="Retirer la photo"
        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-noir">
        <Icone nom="fermer" taille={13} epaisseur={2.6} />
      </button>
    </div>
  );
}
