import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { compteApi } from '../api/services.js';
import { useAuth } from '../auth/AuthContext.jsx';
import EnTetePage from '../components/EnTetePage.jsx';
import Champ from '../components/Champ.jsx';

export default function MotDePasse() {
  const { oublierSession } = useAuth();
  const navigate = useNavigate();
  const [ancien, setAncien] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const enregistrer = async (e) => {
    e.preventDefault();
    if (nouveau !== confirmation) {
      setErreur({ erreurs: { confirmation: 'Les deux mots de passe ne correspondent pas' } });
      return;
    }
    setErreur(null);
    setEnvoi(true);
    try {
      await compteApi.changerMotDePasse(ancien, nouveau);
      // Le serveur a coupé toutes les sessions (y compris celle-ci) : on reconnecte proprement
      oublierSession();
      navigate('/connexion?info=mot-de-passe', { replace: true });
    } catch (err) {
      setErreur(err);
      setEnvoi(false);
    }
  };

  const e = erreur?.erreurs || {};
  return (
    <main className="pb-10 md:pb-16 md:mx-auto md:max-w-xl">
      <EnTetePage titre="Mot de passe" repli="/compte" />
      <form onSubmit={enregistrer} noValidate className="flex flex-col gap-3.5 px-4 pt-3">
        <Champ label="Mot de passe actuel" type="password" autoComplete="current-password" value={ancien} onChange={(ev) => setAncien(ev.target.value)} erreur={e.ancien} />
        <Champ label="Nouveau mot de passe" type="password" autoComplete="new-password" value={nouveau} onChange={(ev) => setNouveau(ev.target.value)} erreur={e.nouveau} aide="8 caractères minimum" />
        <Champ label="Confirme le nouveau mot de passe" type="password" autoComplete="new-password" value={confirmation} onChange={(ev) => setConfirmation(ev.target.value)} erreur={e.confirmation} />
        <p className="text-[13px] text-gris">Par sécurité, tu seras déconnecté de tous tes appareils.</p>
        {erreur?.message && !Object.keys(e).length && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{erreur.message}</p>}
        <button type="submit" disabled={envoi} className="btn-primaire mt-2 w-full">{envoi ? 'Modification…' : 'Changer le mot de passe'}</button>
      </form>
    </main>
  );
}
