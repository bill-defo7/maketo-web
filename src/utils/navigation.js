/** N'accepte qu'un chemin interne ("/annonces/3") : empêche une redirection vers un site piégé (?retour=//pirate.com). */
export function retourSur(valeur, defaut = '/') {
  if (!valeur || !valeur.startsWith('/') || valeur.startsWith('//')) return defaut;
  return valeur;
}
