const nombre = new Intl.NumberFormat('fr-FR');

/** 25000 -> "25 000 F" (espaces normales : certains vieux Android affichent mal l'espace fine). */
export function formatPrix(prix, aDebattre) {
  if (prix === null || prix === undefined) return aDebattre ? 'À débattre' : '—';
  return nombre.format(prix).replace(/ | /g, ' ') + ' F';
}

export function tempsRelatif(iso) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const heures = Math.round(minutes / 60);
  if (heures < 24) return `Il y a ${heures} h`;
  const jours = Math.round(heures / 24);
  if (jours === 1) return 'Hier';
  if (jours < 7) return `Il y a ${jours} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Africa/Douala' });
}

export const LIBELLES_ETAT = { NEUF: 'Neuf', OCCASION: 'Occasion' };

export function initiales(prenom = '', nom = '') {
  return ((prenom[0] || '') + (nom[0] || '')).toUpperCase();
}

export function formatDate(iso, avecHeure = false) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Douala',
    ...(avecHeure ? { hour: '2-digit', minute: '2-digit' } : {})
  });
}

export function joursRestants(iso) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export const LIBELLES_MOTIF = {
  ARNAQUE: 'Arnaque ou faux article',
  INTERDIT: 'Produit interdit',
  DOUBLON: 'Annonce en double',
  INAPPROPRIE: 'Contenu choquant ou inapproprié',
  AUTRE: 'Autre raison'
};

export const SLUG_PETITES_ANNONCES = 'petites-annonces';

export function estMessage(annonce) {
  return annonce?.type === 'MESSAGE';
}
