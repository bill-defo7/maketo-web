import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/services.js';
import Chargement from '../components/Chargement.jsx';
import FeuilleBas from '../components/FeuilleBas.jsx';
import Champ from '../components/Champ.jsx';
import { useToast } from '../components/Toast.jsx';
import { TitreAdmin } from './AdminLayout.jsx';

const VIDE = { nom: '', slug: '', icone: '', ordreAffichage: '' };
const versSlug = (texte) => texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function Categories() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data, isPending } = useQuery({ queryKey: ['admin', 'categories'], queryFn: adminApi.categories });
  const [edition, setEdition] = useState(null); // null = fermé, {} = nouvelle, {id,...} = modification

  const basculer = useMutation({
    mutationFn: (c) => adminApi.activerCategorie(c.id, !c.actif),
    onSuccess: (c) => { toast(c.actif ? 'Catégorie activée' : 'Catégorie désactivée'); invalider(); },
    onError: (e) => toast(e.message, 'erreur')
  });
  const invalider = () => { queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }); queryClient.invalidateQueries({ queryKey: ['categories'] }); };

  if (isPending) return <Chargement />;
  return (
    <>
      <TitreAdmin titre="Catégories" texte="Une catégorie désactivée n'est plus proposée à la publication ; ses annonces restent visibles."
        action={<button type="button" onClick={() => setEdition({})} className="btn-primaire h-12 px-5 text-sm">Nouvelle catégorie</button>} />
      <div className="overflow-hidden rounded-[20px] border border-trait bg-surface">
        {data.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-trait px-4 py-3.5 last:border-b-0">
            <div className={c.actif ? '' : 'opacity-50'}>
              <p className="font-extrabold">{c.ordreAffichage}. {c.nom}</p>
              <p className="text-xs text-gris">{c.slug}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEdition(c)} className="h-10 rounded-full border-[1.5px] border-bordure px-4 text-sm font-extrabold">Modifier</button>
              <button type="button" onClick={() => basculer.mutate(c)} className="h-10 rounded-full border-[1.5px] border-bordure px-4 text-sm font-extrabold">{c.actif ? 'Désactiver' : 'Activer'}</button>
            </div>
          </div>
        ))}
      </div>
      <FormulaireCategorie categorie={edition} onFermer={() => setEdition(null)} onSucces={() => { setEdition(null); invalider(); }} />
    </>
  );
}

function FormulaireCategorie({ categorie, onFermer, onSucces }) {
  const toast = useToast();
  const [v, setV] = useState(VIDE);
  const [ouvertPour, setOuvertPour] = useState(null);
  const [erreur, setErreur] = useState(null);
  if (categorie !== ouvertPour) {
    setOuvertPour(categorie);
    setV(categorie?.id ? { nom: categorie.nom, slug: categorie.slug, icone: categorie.icone || '', ordreAffichage: String(categorie.ordreAffichage) } : VIDE);
    setErreur(null);
  }

  const enregistrer = useMutation({
    mutationFn: () => {
      const corps = { ...v, icone: v.icone || null, ordreAffichage: Number(v.ordreAffichage || 0) };
      return categorie.id ? adminApi.modifierCategorie(categorie.id, corps) : adminApi.creerCategorie(corps);
    },
    onSuccess: () => { toast('Catégorie enregistrée'); onSucces(); },
    onError: setErreur
  });
  const e = erreur?.erreurs || {};

  return (
    <FeuilleBas ouvert={!!categorie} titre={categorie?.id ? 'Modifier la catégorie' : 'Nouvelle catégorie'} onFermer={onFermer}>
      <form onSubmit={(ev) => { ev.preventDefault(); enregistrer.mutate(); }} className="mt-4 flex flex-col gap-3">
        <Champ label="Nom" value={v.nom} erreur={e.nom}
          onChange={(ev) => setV({ ...v, nom: ev.target.value, slug: categorie?.id ? v.slug : versSlug(ev.target.value) })} />
        <Champ label="Slug (dans les liens)" value={v.slug} erreur={e.slug} onChange={(ev) => setV({ ...v, slug: ev.target.value })} />
        <div className="grid grid-cols-2 gap-2.5">
          <Champ label="Icône" value={v.icone} erreur={e.icone} onChange={(ev) => setV({ ...v, icone: ev.target.value })} />
          <Champ label="Ordre" inputMode="numeric" value={v.ordreAffichage} erreur={e.ordreAffichage} onChange={(ev) => setV({ ...v, ordreAffichage: ev.target.value.replace(/\D/g, '') })} />
        </div>
        {erreur && !Object.keys(e).length && <p role="alert" className="text-sm font-semibold text-red-700">{erreur.message}</p>}
        <button type="submit" disabled={enregistrer.isPending} className="btn-primaire mt-1 w-full">Enregistrer</button>
      </form>
    </FeuilleBas>
  );
}
