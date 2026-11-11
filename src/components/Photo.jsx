/** Photo d'annonce chargée au fil du défilement, avec un fond en attendant (ou si l'annonce n'a pas de photo). */
export default function Photo({ src, alt, className = '', sombre = false }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center ${sombre ? 'bg-brun text-[#B5A396]' : 'bg-sable text-gris'} ${className}`}>
        <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={`bg-sable object-cover ${className}`} />;
}
