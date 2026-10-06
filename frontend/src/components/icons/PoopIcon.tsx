import type { SVGProps } from 'react'

/** Icono de caca con el mismo estilo de trazo que lucide-react, que no trae uno propio. */
export default function PoopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 20h14a3 3 0 0 0 0-6H5a3 3 0 0 0 0 6z" />
      <path d="M7 14a2.5 2.5 0 0 1 0-5h10a2.5 2.5 0 0 1 0 5" />
      <path d="M9 9a2 2 0 0 1 1.5-3.5c1 0 2-1 1.8-2.5 2.2.6 3.7 2.8 3.2 6" />
    </svg>
  )
}
