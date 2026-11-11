/** Petit stockage local (brouillon, recharge en cours). Ne plante jamais : navigation privée, stockage plein… */
export const stockage = {
  lire(cle) {
    try { return JSON.parse(localStorage.getItem(cle)); } catch { return null; }
  },
  ecrire(cle, valeur) {
    try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch { /* ignoré */ }
  },
  effacer(cle) {
    try { localStorage.removeItem(cle); } catch { /* ignoré */ }
  }
};
