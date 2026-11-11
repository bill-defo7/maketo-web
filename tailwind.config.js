/**
 * Design Maketo (repris de la maquette AllVote).
 * Les couleurs "de surface" passent par des variables CSS (src/index.css) : elles changent en mode nuit.
 * Les couleurs fixes (orange de marque, fonds sombres de l'en-tête) restent les mêmes dans les deux modes.
 */
const variable = (nom) => `rgb(var(--${nom}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#C2410C', // boutons et texte (contraste AA sur blanc)
          vif: '#FC5C01',     // accents, gros titres
          fonce: '#9A3412',
          clair: variable('brand-clair'),
          logo: '#FF6B00',
          peche: '#FFA24D'
        },
        // Variables (clair / sombre)
        creme: variable('creme'),     // fond de page
        surface: variable('surface'), // cartes, champs
        encre: variable('encre'),     // texte principal
        sable: variable('sable'),
        bordure: variable('bordure'),
        trait: variable('trait'),
        gris: variable('gris'),
        texte2: variable('texte2'),
        alerte: variable('alerte'),   // texte sur fond orange pâle
        succes: { DEFAULT: variable('succes'), texte: variable('succes-texte') },
        // Fixes
        noir: '#141110',  // texte sur fond orange vif ou sur blanc fixe (boutons posés sur une photo)
        nuit: '#1A1411',  // en-têtes et blocs sombres
        brun: '#2B211B',
        doux: '#E7DCD4'   // texte clair sur fond sombre
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        logo: ['Lora', 'Georgia', 'serif']
      },
      boxShadow: {
        bouton: '0 12px 26px -10px rgba(252,92,1,.7)',
        carte: '0 10px 24px -16px rgba(120,52,10,.4)'
      }
    }
  },
  plugins: []
};
