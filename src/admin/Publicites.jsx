import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/services.js';
import Chargement from '../components/Chargement.jsx';
import FeuilleBas from '../components/FeuilleBas.jsx';
import Champ from '../components/Champ.jsx';
import { useToast } from '../components/Toast.jsx';
import { TitreAdmin } from './AdminLayout.jsx';
import { formatDate } from '../utils/format.js';

export default function Publicites() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data, isPending } = useQuery({ queryKey: ['admin', 'publicites'], queryFn: adminApi.publicites });
  const [creation, setCreation] = useState(false);

  const basculer = useMutation({
    mutationFn: (p) => adminApi.activerPublicite(p.id, !p.actif),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'publicites'] }); queryClient.invalidateQueries({ queryKey: ['publicites'] }); },
    onError: (e) => toast(e.message, 'erreur')
  });

  if (isPending) return <Chargement />;
  return (
    <>
      <TitreAdmin titre="Publicités" texte="Bannières des boutiques d'Ambam, affichées sur l'accueil pendant leur période."
        action={<button type="button" onClick={() => setCreation(true)} className="btn-primaire h-12 px-5 text-sm">Nouvelle publicité</button>} />
      {data.contenu.length === 0 && <p className="rounded-2xl border border-trait bg-surface px-5 py-10 text-center text-gris">Aucune publicité pour l'instant.</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {data.contenu.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-[20px] border border-trait bg-surface">
            <img src={p.imageUrl} alt="" className="h-32 w-full bg-sable object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-extrabold">{p.annonceur}{p.titre ? ` · ${p.titre}` : ''}</p>
                <span className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-extrabold ${p.enCours ? 'bg-succes text-succes-texte' : 'bg-sable text-texte2'}`}>{p.enCours ? 'En cours' : p.actif ? 'Programmée / terminée' : 'Désactivée'}</span>
              </div>
              <p className="mt-1 text-sm text-gris">Du {formatDate(p.dateDebut)} au {formatDate(p.dateFin)} · {p.nbClics} clic{p.nbClics > 1 ? 's' : ''}</p>
              <button type="button" onClick={() => basculer.mutate(p)} className="mt-3 h-10 rounded-full border-[1.5px] border-bordure px-4 text-sm font-extrabold">{p.actif ? 'Désactiver' : 'Réactiver'}</button>
            </div>
          </article>
        ))}
      </div>
      <FormulairePublicite ouvert={creation} onFermer={() => setCreation(false)}
        onSucces={() => { setCreation(false); toast('Publicité créée'); queryClient.invalidateQueries({ queryKey: ['admin', 'publicites'] }); queryClient.invalidateQueries({ queryKey: ['publicites'] }); }} />
    </>
  );
}

function FormulairePublicite({ ouvert, onFermer, onSucces }) {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const [v, setV] = useState({ annonceur: '', titre: '', lien: '', dateDebut: aujourdhui, dateFin: aujourdhui });
  const [numeroAnnonce, setNumeroAnnonce] = useState('');
  const [image, setImage] = useState(null);
  const [erreur, setErreur] = useState(null);

  const creer = useMutation({
    mutationFn: () => {
      const f = new FormData();
      // Une publicité peut renvoyer vers une annonce Maketo : plusieurs photos et une description complète
      const valeurs = numeroAnnonce ? { ...v, lien: `${window.location.origin}/annonces/${numeroAnnonce}` } : v;
      Object.entries(valeurs).forEach(([cle, val]) => { if (val) f.append(cle, val); });
      f.append('image', image);
      return adminApi.creerPublicite(f);
    },
    onSuccess: onSucces,
    onError: setErreur
  });
  const e = erreur?.erreurs || {};

  return (
    <FeuilleBas ouvert={ouvert} titre="Nouvelle publicité" onFermer={onFermer}>
      <form onSubmit={(ev) => { ev.preventDefault(); creer.mutate(); }} className="mt-4 flex flex-col gap-3">
        <div>
          <label htmlFor="pub-image" className="etiquette">Bannière (format large, JPG ou PNG)</label>
          <input id="pub-image" type="file" accept="image/jpeg,image/png" onChange={(ev) => setImage(ev.target.files?.[0] || null)}
            className="block w-full text-sm file:mr-3 file:h-11 file:rounded-full file:border-0 file:bg-brand file:px-4 file:font-extrabold file:text-white" />
        </div>
        <Champ label="Annonceur" value={v.annonceur} erreur={e.annonceur} onChange={(ev) => setV({ ...v, annonceur: ev.target.value })} />
        <Champ label="Accroche affichée sur la bannière (facultatif)" maxLength={100} value={v.titre} erreur={e.titre} onChange={(ev) => setV({ ...v, titre: ev.target.value })} />
        <div className="rounded-2xl bg-brand-clair p-3.5">
          <Champ label="N° de l'annonce Maketo à ouvrir (recommandé)" inputMode="numeric" placeholder="Ex. 42" value={numeroAnnonce}
            onChange={(ev) => setNumeroAnnonce(ev.target.value.replace(/\D/g, ''))}
            aide="La boutique publie une annonce avec ses photos et sa description ; la bannière y renvoie. Le n° est à la fin du lien de l'annonce." />
        </div>
        {!numeroAnnonce && (
          <Champ label="Ou un lien externe (facultatif)" type="url" placeholder="https://wa.me/2376…" value={v.lien} erreur={e.lien} onChange={(ev) => setV({ ...v, lien: ev.target.value })} />
        )}
        <div className="grid grid-cols-2 gap-2.5">
          <Champ label="Début" type="date" value={v.dateDebut} erreur={e.dateDebut} onChange={(ev) => setV({ ...v, dateDebut: ev.target.value })} />
          <Champ label="Fin" type="date" value={v.dateFin} erreur={e.dateFin} onChange={(ev) => setV({ ...v, dateFin: ev.target.value })} />
        </div>
        {erreur && !Object.keys(e).length && <p role="alert" className="text-sm font-semibold text-red-700">{erreur.message}</p>}
        <button type="submit" disabled={!image || !v.annonceur || creer.isPending} className="btn-primaire mt-1 w-full">{creer.isPending ? 'Envoi…' : 'Créer la publicité'}</button>
      </form>
    </FeuilleBas>
  );
}
