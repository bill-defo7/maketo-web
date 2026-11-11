import { useQuery } from '@tanstack/react-query';
import { compteApi } from '../api/services.js';
import { useAuth } from '../auth/AuthContext.jsx';

/** Solde, statut Pro et interrupteur des paiements (tout ce qui est payant se cache s'il est fermé). */
export function usePortefeuille() {
  const { utilisateur } = useAuth();
  const requete = useQuery({ queryKey: ['portefeuille'], queryFn: compteApi.portefeuille, enabled: !!utilisateur });
  return { ...requete, paiementsActifs: requete.data?.paiementsActifs === true };
}
