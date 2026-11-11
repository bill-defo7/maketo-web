/**
 * Client HTTP unique de l'appli.
 * - Le jeton d'accès reste EN MÉMOIRE (jamais dans localStorage : protégé contre le vol par XSS).
 * - Sur un 401, on rafraîchit la session une seule fois (cookie httpOnly) puis on rejoue la requête.
 */
const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

let jetonAcces = null;
let rafraichissementEnCours = null;
let surChangementSession = () => {};

export class ApiError extends Error {
  constructor(status, probleme) {
    super(probleme?.detail || 'Une erreur est survenue, réessaie.');
    this.status = status;
    this.titre = probleme?.title;
    this.erreurs = probleme?.erreurs || {}; // erreurs par champ de formulaire
  }
}

export function definirSession(session) {
  jetonAcces = session?.accessToken || null;
  surChangementSession(session?.utilisateur || null);
}

export function ecouterSession(callback) {
  surChangementSession = callback;
}

export function estConnecte() {
  return jetonAcces !== null;
}

/** Rafraîchit la session (une seule requête même si plusieurs appels échouent en même temps). */
export function rafraichirSession() {
  if (!rafraichissementEnCours) {
    rafraichissementEnCours = fetch(BASE + '/auth/rafraichir', { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          definirSession(null);
          return false;
        }
        definirSession(await res.json());
        return true;
      })
      .catch(() => false)
      .finally(() => { rafraichissementEnCours = null; });
  }
  return rafraichissementEnCours;
}

export async function api(chemin, { methode = 'GET', corps, formulaire, rejouer = true } = {}) {
  const enTetes = {};
  if (jetonAcces) enTetes.Authorization = `Bearer ${jetonAcces}`;
  let body;
  if (formulaire) {
    body = formulaire; // FormData : le navigateur pose lui-même le Content-Type multipart
  } else if (corps !== undefined) {
    enTetes['Content-Type'] = 'application/json';
    body = JSON.stringify(corps);
  }

  let reponse;
  try {
    reponse = await fetch(BASE + chemin, { method: methode, headers: enTetes, body, credentials: 'include' });
  } catch {
    throw new ApiError(0, { detail: 'Pas de connexion internet. Vérifie ta data ou ton wifi.' });
  }

  const routeAuth = chemin.startsWith('/auth/');
  if (reponse.status === 401 && rejouer && !routeAuth) {
    const avaitJeton = jetonAcces !== null;
    const ok = await rafraichirSession();
    // Rafraîchi : on rejoue avec le nouveau jeton. Sinon, si un vieux jeton bloquait une route publique,
    // on rejoue sans jeton (le visiteur voit la page en mode non connecté).
    if (ok || avaitJeton) {
      return api(chemin, { methode, corps, formulaire, rejouer: false });
    }
  }

  if (!reponse.ok) {
    let probleme = null;
    try { probleme = await reponse.json(); } catch { /* corps vide */ }
    if (!probleme && reponse.status >= 500) {
      probleme = { detail: 'Le serveur Maketo ne répond pas. Réessaie dans un instant.' };
    }
    throw new ApiError(reponse.status, probleme);
  }
  if (reponse.status === 204) return null;
  const type = reponse.headers.get('content-type') || '';
  return type.includes('json') ? reponse.json() : null;
}

/** Envoi de fichier avec progression (fetch ne sait pas suivre l'envoi : on passe par XMLHttpRequest). */
export function envoyerFichier(chemin, formulaire, onProgression) {
  const tenter = (rejouer) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', BASE + chemin);
    xhr.withCredentials = true;
    if (jetonAcces) xhr.setRequestHeader('Authorization', `Bearer ${jetonAcces}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgression) onProgression(Math.round((e.loaded * 100) / e.total));
    };
    xhr.onload = async () => {
      if (xhr.status === 401 && rejouer && (await rafraichirSession())) {
        tenter(false).then(resolve, reject);
        return;
      }
      let corps = null;
      try { corps = xhr.responseText ? JSON.parse(xhr.responseText) : null; } catch { /* vide */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(corps);
      else reject(new ApiError(xhr.status, corps));
    };
    xhr.onerror = () => reject(new ApiError(0, { detail: "Connexion perdue pendant l'envoi." }));
    xhr.send(formulaire);
  });
  return tenter(true);
}
