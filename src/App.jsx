import { Route, Routes, useLocation } from 'react-router-dom';
import BarreNavigation from './components/BarreNavigation.jsx';
import EnTeteBureau from './components/EnTeteBureau.jsx';
import RouteProtegee from './auth/RouteProtegee.jsx';
import Accueil from './pages/Accueil.jsx';
import AnnonceDetail from './pages/AnnonceDetail.jsx';
import Connexion from './pages/Connexion.jsx';
import Vendre from './pages/Vendre.jsx';
import Publiee from './pages/Publiee.jsx';
import MesAnnonces from './pages/MesAnnonces.jsx';
import Favoris from './pages/Favoris.jsx';
import Compte from './pages/Compte.jsx';
import Recharge from './pages/Recharge.jsx';
import Transactions from './pages/Transactions.jsx';
import Profil from './pages/Profil.jsx';
import MotDePasse from './pages/MotDePasse.jsx';
import Vitrine from './pages/Vitrine.jsx';
import Introuvable from './pages/Introuvable.jsx';
import Regles from './pages/Regles.jsx';
import Confidentialite from './pages/Confidentialite.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Tableau from './admin/Tableau.jsx';
import Utilisateurs from './admin/Utilisateurs.jsx';
import Moderation from './admin/Moderation.jsx';
import Paiements from './admin/Paiements.jsx';
import Parametres from './admin/Parametres.jsx';
import Categories from './admin/Categories.jsx';
import Publicites from './admin/Publicites.jsx';

const AVEC_BARRE = ['/', '/recherche', '/favoris', '/compte', '/mes-annonces'];
const protege = (page) => <RouteProtegee>{page}</RouteProtegee>;

export default function App() {
  const { pathname } = useLocation();

  // Espace admin : pleine largeur
  if (pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route path="/admin" element={protege(<AdminLayout />)}>
          <Route index element={<Tableau />} />
          <Route path="inscriptions" element={<Utilisateurs inscriptions />} />
          <Route path="utilisateurs" element={<Utilisateurs />} />
          <Route path="moderation" element={<Moderation />} />
          <Route path="paiements" element={<Paiements />} />
          <Route path="parametres" element={<Parametres />} />
          <Route path="categories" element={<Categories />} />
          <Route path="publicites" element={<Publicites />} />
          <Route path="*" element={<Introuvable />} />
        </Route>
      </Routes>
    );
  }

  const pleinEcran = pathname === '/connexion' || pathname.endsWith('/publiee');
  return (
    // Responsive : barre du bas sur téléphone, barre du haut à partir de la tablette (md = 768 px)
    <div className="min-h-screen bg-creme">
      {!pleinEcran && <EnTeteBureau />}
      <div className="relative mx-auto w-full max-w-6xl">
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/recherche" element={<Accueil modeRecherche />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/annonces/:id" element={<AnnonceDetail />} />
        <Route path="/annonces/:id/modifier" element={protege(<Vendre />)} />
        <Route path="/annonces/:id/publiee" element={protege(<Publiee />)} />
        <Route path="/vendeurs/:id" element={<Vitrine />} />
        <Route path="/vendre" element={protege(<Vendre />)} />
        <Route path="/mes-annonces" element={protege(<MesAnnonces />)} />
        <Route path="/favoris" element={protege(<Favoris />)} />
        <Route path="/compte" element={protege(<Compte />)} />
        <Route path="/compte/recharger" element={protege(<Recharge />)} />
        <Route path="/compte/transactions" element={protege(<Transactions />)} />
        <Route path="/compte/profil" element={protege(<Profil />)} />
        <Route path="/compte/mot-de-passe" element={protege(<MotDePasse />)} />
        <Route path="/regles" element={<Regles />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
        <Route path="*" element={<Introuvable />} />
      </Routes>
      </div>
      {AVEC_BARRE.includes(pathname) && <BarreNavigation />}
    </div>
  );
}
