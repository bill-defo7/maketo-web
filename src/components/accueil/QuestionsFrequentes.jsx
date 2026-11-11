import Apparait from '../Apparait.jsx';
const QUESTIONS = [
  ['Maketo, c\'est pour qui ?', "Pour les étudiants de l'ESTLC. Tu t'inscris avec ton numéro et ton matricule, puis l'administrateur valide ton compte."],
  ['Comment contacter un vendeur ?', "Connecte-toi, ouvre l'annonce et touche « Répondre sur WhatsApp ». Le numéro n'est visible que par les étudiants inscrits."],
  ['Comment se passe le paiement d\'un article ?', "Directement entre vous, en main propre au campus. Maketo ne prend aucune commission sur tes ventes."],
  ['Est-ce que c\'est payant ?', "Publier est gratuit. Des options facultatives (mettre une annonce à la une, devenir Vendeur Pro) seront proposées plus tard."],
  ['Combien de temps mon annonce reste-t-elle en ligne ?', "7 jours. Ensuite, tu la remets en ligne en un clic depuis « Mes annonces »."],
  ['Que faire si une annonce me paraît suspecte ?', "Touche « Signaler cette annonce ». Après plusieurs signalements, elle est masquée automatiquement en attendant la vérification de l'admin."]
];

export default function QuestionsFrequentes() {
  return (
    <section aria-labelledby="titre-faq" className="px-4 pt-12 md:px-6">
      <Apparait>
        <p className="surtitre">Questions fréquentes</p>
        <h2 id="titre-faq" className="titre-section">Tu te demandes…</h2>
      </Apparait>
      <div className="mt-5 grid gap-2.5 md:grid-cols-2">
        {QUESTIONS.map(([question, reponse], i) => (
          <Apparait key={question} ordre={i}>
          <details className="group rounded-[20px] border border-trait bg-surface px-5 py-4 open:border-brand">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-extrabold [&::-webkit-details-marker]:hidden">
              {question}
              <span aria-hidden="true" className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-sable text-lg leading-none transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2.5 text-sm leading-relaxed text-gris">{reponse}</p>
          </details>
          </Apparait>
        ))}
      </div>
    </section>
  );
}
