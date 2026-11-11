import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { favorisApi } from '../api/services.js';
import { useAuth } from '../auth/AuthContext.jsx';

/** Ids des favoris (un seul appel pour toute l'appli) + bascule instantanée (mise à jour optimiste). */
export function useFavoris() {
  const { utilisateur } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: ids = [] } = useQuery({
    queryKey: ['favoris', 'ids'],
    queryFn: favorisApi.ids,
    enabled: !!utilisateur
  });

  const mutation = useMutation({
    mutationFn: ({ id, ajouter }) => (ajouter ? favorisApi.ajouter(id) : favorisApi.retirer(id)),
    onMutate: async ({ id, ajouter }) => {
      await queryClient.cancelQueries({ queryKey: ['favoris', 'ids'] });
      const avant = queryClient.getQueryData(['favoris', 'ids']) || [];
      queryClient.setQueryData(['favoris', 'ids'], ajouter ? [...avant, id] : avant.filter((x) => x !== id));
      return { avant };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(['favoris', 'ids'], ctx.avant),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['favoris'] })
  });

  const estFavori = (id) => ids.includes(id);

  const basculer = (id) => {
    if (!utilisateur) {
      navigate(`/connexion?retour=${encodeURIComponent(location.pathname)}`);
      return;
    }
    mutation.mutate({ id, ajouter: !estFavori(id) });
  };

  return { estFavori, basculer };
}
