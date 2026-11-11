import PageTexte from './PageTexte.jsx';

export default function Confidentialite() {
  return (
    <PageTexte titre="Confidentialité"
      introduction="Voici quelles informations Maketo garde sur toi, pourquoi, et qui peut les voir."
      sections={[
        ['Ce que nous enregistrons', [
          "Ton nom, ton prénom, ton numéro de téléphone (et WhatsApp s'il est différent), ton matricule, ton niveau et ta filière.",
          "Tes annonces et leurs photos. Avant d'être enregistrées, les photos sont réduites et leurs informations cachées (comme la position GPS) sont supprimées."
        ]],
        ['Qui voit quoi', [
          "Ton prénom, l'initiale de ton nom et ta filière s'affichent sur tes annonces.",
          "Ton numéro WhatsApp n'est visible que par les étudiants connectés, pour qu'ils puissent te contacter.",
          "Ton matricule n'est visible que par l'administrateur, qui s'en sert pour valider ton compte."
        ]],
        ['Paiements', [
          "Les paiements Mobile Money passent par notre prestataire de paiement. Maketo ne voit jamais ton code PIN."
        ]],
        ['Sécurité', [
          "Ton mot de passe est chiffré : personne, pas même l'administrateur, ne peut le lire.",
          "Pour faire supprimer ton compte ou corriger tes informations, contacte l'administrateur."
        ]]
      ]} />
  );
}
