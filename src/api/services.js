import { api, envoyerFichier } from './client.js';

/** Toutes les routes de l'API (voir docs/API.md du backend). */

const qs = (params) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const authApi = {
  connexion: (telephone, motDePasse) => api('/auth/connexion', { methode: 'POST', corps: { telephone, motDePasse } }),
  inscription: (donnees) => api('/auth/inscription', { methode: 'POST', corps: donnees }),
  deconnexion: () => api('/auth/deconnexion', { methode: 'POST' })
};

export const categoriesApi = {
  lister: () => api('/categories')
};

export const annoncesApi = {
  rechercher: (filtres, page = 0) => api('/annonces' + qs({ ...filtres, page, taille: 20 })),
  aLaUne: () => api('/annonces/a-la-une'),
  petitesAnnonces: () => api('/annonces?type=MESSAGE&page=0&taille=10'),
  detail: (id) => api(`/annonces/${id}`),
  contacter: (id) => api(`/annonces/${id}/contact`, { methode: 'POST' }),
  publier: (corps) => api('/annonces', { methode: 'POST', corps }),
  modifier: (id, corps) => api(`/annonces/${id}`, { methode: 'PUT', corps }),
  marquerVendue: (id) => api(`/annonces/${id}/vendue`, { methode: 'PATCH' }),
  renouveler: (id) => api(`/annonces/${id}/renouveler`, { methode: 'PATCH' }),
  supprimer: (id) => api(`/annonces/${id}`, { methode: 'DELETE' }),
  ajouterPhoto: (id, fichier, onProgression) => {
    const formulaire = new FormData();
    formulaire.append('fichier', fichier);
    return envoyerFichier(`/annonces/${id}/photos`, formulaire, onProgression);
  },
  supprimerPhoto: (id, photoId) => api(`/annonces/${id}/photos/${photoId}`, { methode: 'DELETE' }),
  signaler: (id, corps) => api(`/annonces/${id}/signalements`, { methode: 'POST', corps }),
  booster: (id, offreCode) => api(`/annonces/${id}/boost`, { methode: 'POST', corps: { offreCode } }),
  mesAnnonces: () => api('/utilisateurs/moi/annonces?page=0&size=50')
};

export const favorisApi = {
  ids: () => api('/utilisateurs/moi/favoris/ids'),
  lister: (page = 0) => api(`/utilisateurs/moi/favoris?page=${page}&size=20`),
  ajouter: (id) => api(`/annonces/${id}/favori`, { methode: 'POST' }),
  retirer: (id) => api(`/annonces/${id}/favori`, { methode: 'DELETE' })
};

export const compteApi = {
  moi: () => api('/utilisateurs/moi'),
  modifierProfil: (corps) => api('/utilisateurs/moi', { methode: 'PUT', corps }),
  changerMotDePasse: (ancien, nouveau) => api('/utilisateurs/moi/mot-de-passe', { methode: 'PATCH', corps: { ancien, nouveau } }),
  portefeuille: () => api('/utilisateurs/moi/portefeuille'),
  transactions: (page = 0) => api(`/utilisateurs/moi/transactions?page=${page}&size=20`),
  passerPro: (offreCode) => api('/abonnements/pro', { methode: 'POST', corps: { offreCode } })
};

export const paiementsApi = {
  options: () => api('/paiements/options'),
  recharger: (corps) => api('/paiements/recharges', { methode: 'POST', corps }),
  suivre: (reference) => api(`/paiements/recharges/${reference}`)
};

export const offresApi = {
  lister: () => api('/offres')
};

export const vendeursApi = {
  vitrine: (id) => api(`/vendeurs/${id}`),
  annonces: (id, page = 0) => api(`/vendeurs/${id}/annonces?page=${page}&size=20`)
};

export const publicitesApi = {
  actives: () => api('/publicites'),
  clic: (id) => api(`/publicites/${id}/clic`, { methode: 'POST' })
};

export const adminApi = {
  statistiques: () => api('/admin/statistiques'),
  utilisateurs: (statut, page = 0) => api(`/admin/utilisateurs${qs({ statut, page, size: 30 })}`),
  activer: (id) => api(`/admin/utilisateurs/${id}/activer`, { methode: 'PATCH' }),
  bloquer: (id) => api(`/admin/utilisateurs/${id}/bloquer`, { methode: 'PATCH' }),
  crediter: (id, corps) => api(`/admin/utilisateurs/${id}/credits`, { methode: 'POST', corps }),
  signalements: (statut, page = 0) => api(`/admin/moderation/signalements${qs({ statut, page, size: 30 })}`),
  retablir: (annonceId) => api(`/admin/moderation/annonces/${annonceId}/retablir`, { methode: 'POST' }),
  retirer: (annonceId) => api(`/admin/moderation/annonces/${annonceId}/retirer`, { methode: 'POST' }),
  paiements: (statut, page = 0) => api(`/admin/paiements${qs({ statut, page, size: 30 })}`),
  parametres: () => api('/admin/parametres'),
  modifierParametre: (cle, valeur) => api(`/admin/parametres/${cle}`, { methode: 'PUT', corps: { valeur } }),
  categories: () => api('/admin/categories'),
  creerCategorie: (corps) => api('/admin/categories', { methode: 'POST', corps }),
  modifierCategorie: (id, corps) => api(`/admin/categories/${id}`, { methode: 'PUT', corps }),
  activerCategorie: (id, actif) => api(`/admin/categories/${id}/${actif ? 'activer' : 'desactiver'}`, { methode: 'PATCH' }),
  publicites: () => api('/admin/publicites?page=0&size=50'),
  creerPublicite: (formulaire) => api('/admin/publicites', { methode: 'POST', formulaire }),
  activerPublicite: (id, actif) => api(`/admin/publicites/${id}/${actif ? 'activer' : 'desactiver'}`, { methode: 'PATCH' })
};
