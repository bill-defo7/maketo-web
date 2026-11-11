import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Chargement from '../components/Chargement.jsx';

/** Redirige vers la connexion puis ramène l'étudiant exactement là où il voulait aller. */
export default function RouteProtegee({ children }) {
  const { utilisateur, pret } = useAuth();
  const location = useLocation();
  if (!pret) return <Chargement />;
  if (!utilisateur) {
    const retour = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/connexion?retour=${retour}`} replace />;
  }
  return children;
}
