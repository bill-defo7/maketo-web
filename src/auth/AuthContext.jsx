import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { definirSession, ecouterSession, rafraichirSession } from '../api/client.js';
import { authApi } from '../api/services.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [pret, setPret] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    ecouterSession(setUtilisateur);
    // Au démarrage : le cookie httpOnly permet de retrouver la session sans retaper le mot de passe
    rafraichirSession().finally(() => setPret(true));
  }, []);

  const connexion = useCallback(async (telephone, motDePasse) => {
    const session = await authApi.connexion(telephone, motDePasse);
    definirSession(session);
    queryClient.invalidateQueries(); // les pages se rechargent avec les infos réservées aux connectés
    return session.utilisateur;
  }, [queryClient]);

  const deconnexion = useCallback(async () => {
    try { await authApi.deconnexion(); } finally {
      definirSession(null);
      queryClient.clear();
    }
  }, [queryClient]);

  /** Après un changement de mot de passe : toutes les sessions sont coupées côté serveur. */
  const oublierSession = useCallback(() => {
    definirSession(null);
    queryClient.clear();
  }, [queryClient]);

  const valeur = useMemo(
    () => ({ utilisateur, pret, connexion, deconnexion, oublierSession, mettreAJourUtilisateur: setUtilisateur }),
    [utilisateur, pret, connexion, deconnexion, oublierSession]
  );
  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
