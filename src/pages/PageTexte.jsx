import EnTetePage from '../components/EnTetePage.jsx';

/** Mise en page commune des pages de texte (règles, confidentialité). */
export default function PageTexte({ titre, introduction, sections }) {
  return (
    <main className="pb-16 md:mx-auto md:max-w-3xl">
      <EnTetePage titre={titre} />
      <div className="px-4 pt-3">
        <p className="text-[15px] leading-relaxed text-texte2">{introduction}</p>
        {sections.map(([sousTitre, paragraphes]) => (
          <section key={sousTitre} className="mt-7">
            <h2 className="font-display text-lg font-extrabold tracking-[-.02em]">{sousTitre}</h2>
            {paragraphes.map((p) => <p key={p} className="mt-2.5 text-[15px] leading-relaxed text-texte2">{p}</p>)}
          </section>
        ))}
      </div>
    </main>
  );
}
