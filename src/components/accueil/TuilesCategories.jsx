import Apparait from '../Apparait.jsx';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../../api/services.js';
import Icone, { ICONES_CATEGORIES } from '../Icone.jsx';

const DESCRIPTIONS = {
  'petites-annonces': 'Demandes, cours, infos du campus',
  vetements: 'Habits, chaussures, sacs',
  beaute: 'Mèches, cosmétiques, coiffure',
  nourriture: 'Snacks, plats, produits locaux',
  electronique: 'Téléphones, ordinateurs, accessoires',
  livres: 'Livres, polycopiés, fournitures',
  logement: 'Chambres, meubles, rideaux, draps',
  'objets-perdus': 'Perdu ou trouvé au campus',
  'produits-menagers': 'Savon liquide, javel, soupline, lessive',
  services: 'Répétitions, couture, réparations',
  divers: 'Tout le reste'
};

export default function TuilesCategories() {
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.lister, staleTime: 3600_000 });
  if (categories.length === 0) return null;
  return (
    <section aria-labelledby="titre-univers" className="px-4 pt-12 md:px-6">
      <Apparait>
        <p className="surtitre">Catégories</p>
        <h2 id="titre-univers" className="titre-section">Tout le campus au même endroit</h2>
      </Apparait>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c, i) => (
          <Apparait key={c.id} ordre={i}>
          <Link to={`/?categorie=${c.slug}`} onClick={() => window.scrollTo({ top: 0 })}
            className="group block h-full rounded-[22px] border border-trait bg-surface p-4 text-encre transition hover:border-brand">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sable text-brand-fonce transition group-hover:bg-brand group-hover:text-white">
              <Icone nom={ICONES_CATEGORIES[c.slug] || 'boite'} taille={22} />
            </span>
            <h3 className="mt-3 text-[15px] font-extrabold leading-tight">{c.nom}</h3>
            {DESCRIPTIONS[c.slug] && <p className="mt-1 text-[13px] leading-snug text-gris">{DESCRIPTIONS[c.slug]}</p>}
          </Link>
          </Apparait>
        ))}
      </div>
    </section>
  );
}
