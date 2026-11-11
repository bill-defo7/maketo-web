import Apparait from '../Apparait.jsx';
import Icone from '../Icone.jsx';

const POINTS = [
  ['bouclier', 'Étudiants vérifiés', "Chaque compte est validé avec le matricule ESTLC : seuls les étudiants entrent."],
  ['whatsapp', 'Contact direct', "Tu écris au vendeur sur WhatsApp, sans intermédiaire ni commission."],
  ['valide', 'Publication gratuite', "Publie tes articles et tes messages gratuitement, en 2 minutes."],
  ['oeil', 'Annonces surveillées', "Une annonce signalée plusieurs fois est masquée en attendant l'admin."]
];

/** Les vraies garanties de Maketo (aucun chiffre inventé). */
export default function Confiance() {
  return (
    <section aria-labelledby="titre-confiance" className="px-4 pt-12 md:px-6">
      <Apparait>
        <p className="surtitre">Pourquoi Maketo</p>
        <h2 id="titre-confiance" className="titre-section">Entre étudiants, en confiance</h2>
      </Apparait>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {POINTS.map(([icone, titre, texte], i) => (
          <Apparait key={titre} ordre={i} className="rounded-[22px] border border-trait bg-surface p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-clair text-brand-fonce"><Icone nom={icone} taille={22} /></span>
            <h3 className="mt-3 text-[15px] font-extrabold">{titre}</h3>
            <p className="mt-1 text-[13px] leading-snug text-gris">{texte}</p>
          </Apparait>
        ))}
      </div>
    </section>
  );
}
