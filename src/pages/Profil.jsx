import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { compteApi } from '../api/services.js';
import { useAuth } from '../auth/AuthContext.jsx';
import EnTetePage from '../components/EnTetePage.jsx';
import Champ from '../components/Champ.jsx';
import ChoixFiliere from '../components/ChoixFiliere.jsx';
import { useToast } from '../components/Toast.jsx';

export default function Profil() {
  const { utilisateur, mettreAJourUtilisateur } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [v, setV] = useState({
    nom: utilisateur.nom, prenom: utilisateur.prenom, whatsapp: utilisateur.whatsapp || '',
    filiere: utilisateur.filiere || '', niveau: utilisateur.niveau || ''
  });
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const changer = (cle) => (e) => setV({ ...v, [cle]: e.target.value });
  const e = erreur?.erreurs || {};

  const enregistrer = async (ev) => {
    ev.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      const maj = await compteApi.modifierProfil({ ...v, whatsapp: v.whatsapp || null, filiere: v.filiere || null, niveau: v.niveau || null });
      mettreAJourUtilisateur(maj);
      toast('Profil mis à jour');
      navigate('/compte');
    } catch (err) {
      setErreur(err);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <main className="pb-10 md:pb-16 md:mx-auto md:max-w-xl">
      <EnTetePage titre="Mon profil" repli="/compte" />
      <form onSubmit={enregistrer} noValidate className="flex flex-col gap-3.5 px-4 pt-3">
        <div className="grid grid-cols-2 gap-2.5">
          <Champ label="Nom" value={v.nom} onChange={changer('nom')} erreur={e.nom} />
          <Champ label="Prénom" value={v.prenom} onChange={changer('prenom')} erreur={e.prenom} />
        </div>
        <Champ label="Numéro WhatsApp" prefixe="+237" type="tel" inputMode="numeric" value={v.whatsapp} onChange={changer('whatsapp')}
          erreur={e.whatsapp} aide="C'est ce numéro que les acheteurs utilisent pour t'écrire." />
        <ChoixFiliere niveau={v.niveau} filiere={v.filiere} erreurs={e} onChange={(choix) => setV({ ...v, ...choix })} />
        <div className="rounded-2xl bg-sable px-4 py-3 text-[13px] text-texte2">
          Téléphone de connexion : <strong>{utilisateur.telephone}</strong> · Matricule : <strong>{utilisateur.matricule}</strong>
          <br />Ils identifient ton compte et ne peuvent pas être modifiés.
        </div>
        {erreur && !Object.keys(e).length && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{erreur.message}</p>}
        <button type="submit" disabled={envoi} className="btn-primaire mt-2 w-full">{envoi ? 'Enregistrement…' : 'Enregistrer'}</button>
      </form>
    </main>
  );
}
