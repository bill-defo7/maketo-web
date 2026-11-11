import { MOIS, MOTIFS, TEXTES } from './en.js';

/**
 * Traduction de l'interface affichée (FR → EN), sans toucher aux composants.
 *
 * Les composants écrivent toujours en français. Quand l'anglais est choisi, un MutationObserver
 * remplace chaque texte connu (et les attributs placeholder, aria-label, title, alt) par sa traduction.
 * Le texte français d'origine est gardé pour revenir au français sans recharger la page.
 *
 * Ce qui n'est PAS traduit : le contenu écrit par les étudiants (titres, messages, noms),
 * et tout élément marqué translate="no" (ex. l'espace admin).
 */
const ATTRIBUTS = ['placeholder', 'aria-label', 'title', 'alt'];
const IGNORES = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE']);

const normaliser = (t) => t.replace(/[  ]/g, ' ').replace(/[’]/g, "'").replace(/\s+/g, ' ').trim();
const regexMois = new RegExp(`\\b(\\d{1,2}) (${Object.keys(MOIS).map((m) => m.replace('.', '\\.')).join('|')})(?=\\s|$|,)`, 'g');

/** Traduit une chaîne française ; renvoie null si elle est inconnue. */
export function traduire(texte) {
  const cle = normaliser(texte);
  if (!cle) return null;
  if (TEXTES[cle] !== undefined) return TEXTES[cle];
  for (const [motif, remplacement] of MOTIFS) {
    if (motif.test(cle)) return cle.replace(motif, remplacement);
  }
  if (regexMois.test(cle)) {
    regexMois.lastIndex = 0;
    return cle.replace(regexMois, (_, jour, mois) => `${jour} ${MOIS[mois]}`);
  }
  return null;
}

/** Garde les espaces autour du texte (ex. " pour confirmer.") pour ne pas coller les mots. */
function habiller(original, traduction) {
  const debut = original.match(/^\s*/)[0];
  const fin = original.match(/\s*$/)[0];
  return debut + traduction + fin;
}

export function creerTraducteur(racine = document.body) {
  const textesOrigine = new WeakMap(); // nœud texte -> français
  const textesPoses = new WeakMap();   // nœud texte -> anglais que NOUS avons écrit
  const attributsOrigine = new WeakMap(); // élément -> { attribut: français }
  let observateur = null;

  const ignore = (el) => !el || IGNORES.has(el.tagName) || el.closest?.('[translate="no"], [contenteditable="true"]');

  function traiterTexte(noeud) {
    const valeur = noeud.nodeValue;
    if (textesPoses.get(noeud) === valeur) return; // c'est notre propre traduction
    if (ignore(noeud.parentElement)) return;
    textesOrigine.set(noeud, valeur);               // React vient d'écrire un nouveau texte français
    const traduction = traduire(valeur);
    if (traduction !== null) {
      const final = habiller(valeur, traduction);
      textesPoses.set(noeud, final);
      noeud.nodeValue = final;
    } else {
      textesPoses.delete(noeud);
    }
  }

  function traiterAttributs(el) {
    if (ignore(el)) return;
    for (const nom of ATTRIBUTS) {
      const valeur = el.getAttribute(nom);
      if (valeur === null) continue;
      const memo = attributsOrigine.get(el) || {};
      if (memo[nom]?.pose === valeur) continue;
      const traduction = traduire(valeur);
      memo[nom] = { origine: valeur, pose: traduction ?? valeur };
      attributsOrigine.set(el, memo);
      if (traduction !== null) el.setAttribute(nom, traduction);
    }
  }

  function parcourir(noeud) {
    if (noeud.nodeType === Node.TEXT_NODE) return traiterTexte(noeud);
    if (noeud.nodeType !== Node.ELEMENT_NODE || ignore(noeud)) return;
    traiterAttributs(noeud);
    const marcheur = document.createTreeWalker(noeud, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let courant = marcheur.nextNode();
    while (courant) {
      if (courant.nodeType === Node.TEXT_NODE) traiterTexte(courant);
      else traiterAttributs(courant);
      courant = marcheur.nextNode();
    }
  }

  return {
    demarrer() {
      if (observateur) return;
      parcourir(racine);
      observateur = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'characterData') traiterTexte(m.target);
          else if (m.type === 'attributes') traiterAttributs(m.target);
          else m.addedNodes.forEach(parcourir);
        }
      });
      observateur.observe(racine, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTS });
    },

    /** Coupe la traduction et remet le français partout. */
    arreter() {
      observateur?.disconnect();
      observateur = null;
      const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      let courant = marcheur.nextNode();
      while (courant) {
        if (courant.nodeType === Node.TEXT_NODE) {
          const origine = textesOrigine.get(courant);
          if (origine !== undefined && textesPoses.get(courant) === courant.nodeValue) courant.nodeValue = origine;
          textesPoses.delete(courant);
        } else {
          const memo = attributsOrigine.get(courant);
          if (memo) {
            for (const [nom, { origine, pose }] of Object.entries(memo)) {
              if (courant.getAttribute(nom) === pose) courant.setAttribute(nom, origine);
            }
            attributsOrigine.delete(courant);
          }
        }
        courant = marcheur.nextNode();
      }
    }
  };
}
