import Vide from '../components/Vide.jsx';

export default function Introuvable() {
  return (
    <main className="pt-16">
      <Vide titre="Page introuvable" texte="Ce lien ne mène nulle part." action="Retour à l'accueil" lien="/" />
    </main>
  );
}
