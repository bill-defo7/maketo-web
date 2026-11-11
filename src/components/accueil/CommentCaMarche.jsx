import Apparait from '../Apparait.jsx';
import { useState } from 'react';

const ETAPES = {
  acheter: [
    ['Cherche', 'Tape ce que tu veux ou parcours les catégories : habits, téléphones, logement, cours…'],
    ['Écris au vendeur', 'Connecte-toi et touche « Répondre sur WhatsApp » : la conversation s\'ouvre directement.'],
    ['Rencontrez-vous au campus', 'Vérifie l\'article en main propre avant de payer le vendeur.']
  ],
  vendre: [
    ['Inscris-toi', 'Avec ton numéro et ton matricule. L\'admin valide ton compte en quelques heures.'],
    ['Publie en 2 minutes', 'Un article avec photos et prix, ou un simple message pour une demande ou une offre.'],
    ['Réponds et vends', 'Les étudiants intéressés t\'écrivent sur WhatsApp. Marque l\'annonce vendue une fois l\'affaire faite.']
  ]
};

export default function CommentCaMarche() {
  const [onglet, setOnglet] = useState('acheter');
  return (
    <section aria-labelledby="titre-comment" className="px-4 pt-12 md:px-6">
      <Apparait>
        <p className="surtitre">Comment ça marche</p>
        <h2 id="titre-comment" className="titre-section">Simple comme un message</h2>
      </Apparait>
      <div role="tablist" aria-label="Je veux" className="mt-5 inline-grid grid-cols-2 gap-1 rounded-full bg-sable p-1">
        {[['acheter', 'J\'achète'], ['vendre', 'Je vends']].map(([cle, libelle]) => (
          <button key={cle} type="button" role="tab" aria-selected={onglet === cle} onClick={() => setOnglet(cle)}
            className={`h-11 rounded-full px-6 text-[15px] ${onglet === cle ? 'bg-surface font-extrabold shadow-sm' : 'font-bold text-gris'}`}>
            {libelle}
          </button>
        ))}
      </div>
      <ol className="mt-5 grid gap-3 md:grid-cols-3">
        {ETAPES[onglet].map(([titre, texte], i) => (
          <Apparait as="li" key={`${onglet}-${titre}`} ordre={i} className="rounded-[22px] border border-trait bg-surface p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-extrabold text-white">{i + 1}</span>
            <h3 className="mt-3 text-base font-extrabold">{titre}</h3>
            <p className="mt-1 text-sm leading-relaxed text-gris">{texte}</p>
          </Apparait>
        ))}
      </ol>
    </section>
  );
}
