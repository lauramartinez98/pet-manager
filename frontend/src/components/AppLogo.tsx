/** Logo de la app (shiba sonriente, el mismo SVG que el favicon). Es decorativo: el nombre "Pet Manager" va siempre al lado. */
export default function AppLogo({ className = '' }: { className?: string }) {
  return <img src="/favicon.svg" alt="" className={className} />
}
