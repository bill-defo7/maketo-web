import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { authApi } from '../api/services.js';
import Logo from '../components/Logo.jsx';
import Icone from '../components/Icone.jsx';
import Champ from '../components/Champ.jsx';
import ChoixFiliere from '../components/ChoixFiliere.jsx';
import { retourSur } from '../utils/navigation.js';

export default function Connexion() {
  const { utilisateur, connexion } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const retour = retourSur(params.get('retour'));
  const [onglet, setOnglet] = useState(params.get('onglet') === 'inscription' ? 'inscription' : 'connexion');
  const [telephoneMemorise, setTelephoneMemorise] = useState('');
  const [inscrit, setInscrit] = useState(false);

  if (utilisateur) return <Navigate to={retour} replace />;

  return (
    <main className="min-h-screen bg-nuit md:flex md:items-center md:justify-center md:bg-creme md:p-8">
      <div className="md:w-full md:max-w-md md:overflow-hidden md:rounded-[28px] md:bg-nuit md:shadow-carte">
      <div className="px-5 pb-8 pt-5 text-white">
        <Link to="/" aria-label="Retour à l'accueil" className="btn-rond border border-white/30 text-white"><Icone nom="retour" epaisseur={2.2} /></Link>
        <p className="mt-6"><Logo taille={44} lien={false} /></p>
        <p className="mt-3 text-base leading-normal text-doux">Le marché des étudiants de l'ESTLC. Entre nous, en toute confiance.</p>
      </div>

      <div className="min-h-[70vh] rounded-t-[28px] bg-creme px-5 pb-10 pt-[22px] md:min-h-0">
        {params.get('info') === 'mot-de-passe' && (
          <p role="status" className="mb-4 rounded-2xl bg-succes px-4 py-3 text-sm font-semibold text-succes-texte">Mot de passe modifié. Reconnecte-toi avec le nouveau.</p>
        )}
        <div role="tablist" aria-label="Connexion ou inscription" className="grid grid-cols-2 gap-1 rounded-full bg-sable p-1">
          <Onglet actif={onglet === 'connexion'} onClick={() => setOnglet('connexion')}>Connexion</Onglet>
          <Onglet actif={onglet === 'inscription'} onClick={() => { setOnglet('inscription'); setInscrit(false); }}>Inscription</Onglet>
        </div>

        {onglet === 'connexion' && (
          <FormulaireConnexion
            telephoneInitial={telephoneMemorise}
            inscritAvecSucces={inscrit}
            onConnexion={async (tel, mdp) => { await connexion(tel, mdp); navigate(retour, { replace: true }); }}
            versInscription={() => setOnglet('inscription')}
          />
        )}
        {onglet === 'inscription' && (
          <FormulaireInscription onSucces={(tel) => { setTelephoneMemorise(tel); setInscrit(true); setOnglet('connexion'); }} />
        )}
      </div>
      </div>
    </main>
  );
}

function Onglet({ actif, onClick, children }) {
  return (
    <button type="button" role="tab" aria-selected={actif} onClick={onClick}
      className={`h-11 rounded-full text-[15px] ${actif ? 'bg-surface font-extrabold text-encre shadow-[0_4px_12px_-6px_rgba(120,52,10,.35)]' : 'font-bold text-gris'}`}>
      {children}
    </button>
  );
}

function FormulaireConnexion({ telephoneInitial, inscritAvecSucces, onConnexion, versInscription }) {
  const [telephone, setTelephone] = useState(telephoneInitial);
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      await onConnexion(telephone, motDePasse);
    } catch (err) {
      setErreur(err);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <form onSubmit={soumettre} noValidate className="mt-6 flex flex-col gap-4">
      {inscritAvecSucces && (
        <div role="status" className="flex gap-3 rounded-2xl bg-succes p-4 text-succes-texte">
          <Icone nom="valide" taille={22} epaisseur={2.6} className="flex-none" />
          <p className="text-sm leading-normal"><strong>Compte créé !</strong> L'administrateur vérifie ton matricule. Tu pourras te connecter dès que ton compte est validé.</p>
        </div>
      )}
      <Champ label="Numéro de téléphone" prefixe="+237" type="tel" inputMode="numeric" autoComplete="tel-national"
        placeholder="6XX XX XX XX" value={telephone} onChange={(e) => setTelephone(e.target.value)} erreur={erreur?.erreurs?.telephone} required />
      <Champ label="Mot de passe" type="password" autoComplete="current-password" placeholder="Ton mot de passe"
        value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} erreur={erreur?.erreurs?.motDePasse} required />
      {erreur && !Object.keys(erreur.erreurs).length && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{erreur.message}</p>
      )}
      <button type="submit" disabled={envoi} className="btn-primaire mt-2">{envoi ? 'Connexion…' : 'Se connecter'}</button>
      <button type="button" onClick={versInscription} className="py-3 text-sm text-texte2">
        Pas encore de compte ? <strong className="text-brand">Inscris-toi</strong>
      </button>
    </form>
  );
}

const VIDE = { nom: '', prenom: '', telephone: '', matricule: '', filiere: '', niveau: '', motDePasse: '' };

function FormulaireInscription({ onSucces }) {
  const [valeurs, setValeurs] = useState(VIDE);
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreursLocales, setErreursLocales] = useState({});
  const changer = (cle) => (e) => setValeurs({ ...valeurs, [cle]: e.target.value });
  const e = erreur?.erreurs || {};

  const soumettre = async (ev) => {
    ev.preventDefault();
    setErreur(null);
    if (!valeurs.niveau || !valeurs.filiere) {
      setErreursLocales({ niveau: !valeurs.niveau ? 'Choisis ton niveau' : undefined, filiere: !valeurs.filiere ? 'Choisis ta filière' : undefined });
      return;
    }
    setEnvoi(true);
    try {
      await authApi.inscription(valeurs);
      onSucces(valeurs.telephone);
    } catch (err) {
      setErreur(err);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <form onSubmit={soumettre} noValidate className="mt-5 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5">
        <Champ label="Nom" autoComplete="family-name" value={valeurs.nom} onChange={changer('nom')} erreur={e.nom} required />
        <Champ label="Prénom" autoComplete="given-name" value={valeurs.prenom} onChange={changer('prenom')} erreur={e.prenom} required />
      </div>
      <Champ label="Téléphone (WhatsApp)" prefixe="+237" type="tel" inputMode="numeric" autoComplete="tel-national"
        placeholder="6XX XX XX XX" value={valeurs.telephone} onChange={changer('telephone')} erreur={e.telephone} required />
      <Champ label="Matricule étudiant" placeholder="Ex. 23GSI001" autoCapitalize="characters"
        value={valeurs.matricule} onChange={changer('matricule')} erreur={e.matricule} required />
      <ChoixFiliere niveau={valeurs.niveau} filiere={valeurs.filiere} erreurs={{ ...e, ...erreursLocales }}
        onChange={(choix) => { setValeurs({ ...valeurs, ...choix }); setErreursLocales({}); }} />
      <Champ label="Mot de passe" type="password" autoComplete="new-password" placeholder="8 caractères minimum"
        value={valeurs.motDePasse} onChange={changer('motDePasse')} erreur={e.motDePasse} required />

      <div className="flex gap-2.5 rounded-2xl bg-brand-clair p-3.5">
        <Icone nom="bouclier" className="flex-none text-brand-fonce" />
        <p className="text-[13px] leading-snug text-alerte">Ton matricule est vérifié par l'admin : seuls les étudiants de l'ESTLC entrent. Tu reçois une confirmation en quelques heures.</p>
      </div>
      {erreur && !Object.keys(e).length && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{erreur.message}</p>
      )}
      <button type="submit" disabled={envoi} className="btn-primaire mt-1">{envoi ? 'Création…' : 'Créer mon compte'}</button>
    </form>
  );
}
