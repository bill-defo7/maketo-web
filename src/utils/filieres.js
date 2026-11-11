/** Filières de l'ESTLC par niveau (le niveau 5 n'est pas encore ouvert). */
export const NIVEAUX = ['1', '2', '3', '4'];

const TRONCS_COMMUNS = ['GLTCO', 'TTL'];
const SPECIALISATIONS = ['TCT', 'AMA', 'GSI', 'GSA', 'GCIM', 'GDT', 'MLSC', 'MFT'];

export function filieresDuNiveau(niveau) {
  if (niveau === '1' || niveau === '2') return TRONCS_COMMUNS;
  if (niveau === '3' || niveau === '4') return SPECIALISATIONS;
  return [];
}
