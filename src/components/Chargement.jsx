export default function Chargement({ texte = 'Chargement…' }) {
  return (
    <div role="status" className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-gris">
      <span className="h-9 w-9 animate-spin rounded-full border-4 border-sable border-t-brand" />
      <span className="text-sm font-semibold">{texte}</span>
    </div>
  );
}
