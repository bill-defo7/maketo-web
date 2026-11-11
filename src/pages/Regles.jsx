import PageTexte from './PageTexte.jsx';

export default function Regles() {
  return (
    <PageTexte titre="Règles du campus"
      introduction="Maketo est un espace entre étudiants de l'ESTLC. Ces règles le gardent sûr et agréable pour tout le monde."
      sections={[
        ['Ce qui est interdit', [
          "Les produits illégaux ou dangereux : armes, drogues, médicaments, produits contrefaits ou volés.",
          "Les faux documents, la vente de devoirs ou d'examens, et tout ce qui va contre le règlement de l'école.",
          "Les contenus choquants, insultants ou à caractère sexuel."
        ]],
        ['Publier honnêtement', [
          "Décris l'article tel qu'il est, avec de vraies photos. Indique les défauts.",
          "Une annonce par article. Marque-la « vendue » dès que l'affaire est faite."
        ]],
        ['Acheter prudemment', [
          "Rencontre le vendeur au campus ou dans un lieu fréquenté, et vérifie l'article avant de payer.",
          "Ne paie jamais d'avance un inconnu pour un article que tu n'as pas vu."
        ]],
        ['En cas de problème', [
          "Touche « Signaler cette annonce ». Après plusieurs signalements, l'annonce est masquée automatiquement en attendant la décision de l'administrateur.",
          "Un compte qui ne respecte pas ces règles peut être bloqué."
        ]]
      ]} />
  );
}
