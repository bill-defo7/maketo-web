import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/services.js';
import Chargement from '../components/Chargement.jsx';
import Vide from '../components/Vide.jsx';
import { TitreAdmin } from './AdminLayout.jsx';
import { formatPrix } from '../utils/format.js';

export default function Tableau() {
  const { data: s, isPending, isError, error, refetch } = useQuery({ queryKey: ['admin', 'stats'], queryFn: adminApi.statistiques, refetchInterval: 60_000 });
  if (isPending) return <Chargement />;
  if (isError) return <Vide titre="Oups" texte={error.message} action="Réessayer" onAction={refetch} />;

  return (
    <>
      <TitreAdmin titre="Tableau de bord" texte="Mis à jour chaque minute." />
      {(s.inscriptionsEnAttente > 0 || s.signalementsOuverts > 0) && (
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          {s.inscriptionsEnAttente > 0 && <Alerte vers="/admin/inscriptions" texte={`${s.inscriptionsEnAttente} inscription${s.inscriptionsEnAttente > 1 ? 's' : ''} à valider`} />}
          {s.signalementsOuverts > 0 && <Alerte vers="/admin/moderation" texte={`${s.signalementsOuverts} signalement${s.signalementsOuverts > 1 ? 's' : ''} à traiter`} />}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tuile valeur={s.utilisateursActifs} libelle="étudiants actifs" />
        <Tuile valeur={s.nouveauxInscrits7Jours} libelle="inscrits ces 7 jours" />
        <Tuile valeur={s.annoncesEnLigne} libelle="annonces en ligne" accent />
        <Tuile valeur={s.annoncesPubliees7Jours} libelle="publiées ces 7 jours" />
        <Tuile valeur={s.annoncesVendues} libelle="articles vendus" />
        <Tuile valeur={s.annoncesSuspendues} libelle="annonces masquées" />
        <Tuile valeur={formatPrix(s.encaisseCeMois)} libelle="encaissé ce mois" sombre />
        <Tuile valeur={formatPrix(s.fraisCeMois)} libelle="frais CT Pay ce mois" />
      </div>
      <p className="mt-5 rounded-2xl border border-trait bg-surface px-4 py-3 text-sm">
        Paiements : <strong className={s.paiementsActifs ? 'text-succes-texte' : 'text-brand-fonce'}>{s.paiementsActifs ? 'ouverts' : 'fermés (période de lancement)'}</strong>
        {' · '}<Link to="/admin/parametres" className="font-bold">Modifier</Link>
      </p>
    </>
  );
}

function Tuile({ valeur, libelle, accent, sombre }) {
  return (
    <div className={`rounded-[20px] p-4 ${sombre ? 'bg-nuit text-white' : 'border border-trait bg-surface'}`}>
      <p className={`font-display text-[26px] font-extrabold tracking-[-.02em] ${accent ? 'text-brand' : ''}`}>{valeur}</p>
      <p className={`mt-1 text-sm ${sombre ? 'text-[#CDBFB4]' : 'text-gris'}`}>{libelle}</p>
    </div>
  );
}

function Alerte({ vers, texte }) {
  return (
    <Link to={vers} className="flex items-center justify-between rounded-[20px] bg-brand px-5 py-4 font-extrabold text-white">
      {texte}<span aria-hidden="true">→</span>
    </Link>
  );
}
