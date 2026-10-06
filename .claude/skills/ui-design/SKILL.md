---
name: ui-design
description: Sistema de diseño de Pet Manager (paleta Butter Yellow / Soft Blue / Brown, tipografías Nunito + Outfit, iconos lucide-react, logo del shiba y componentes compartidos). Úsala siempre que crees o modifiques UI en frontend/ (componentes React, clases Tailwind, CSS, iconos o textos visibles).
---

# Sistema de diseño de Pet Manager

Antes de escribir UI, reutiliza lo que ya existe. Si algo de esta lista no te sirve, amplíalo en su sitio (tokens, `styles.ts`, componente compartido) en vez de crear estilos sueltos.

## 1. Paleta (innegociable)
Los tokens viven en `frontend/src/index.css` (`@theme`) y se usan como clases de Tailwind. **No escribas colores hexadecimales en los componentes.**

| Token | Valor | Uso |
|---|---|---|
| `butter-yellow` | `#faf0ca` | Tarjetas grandes, modales, áreas cálidas |
| `butter-yellow-light` | `#fdf9ec` | Fondo de la página; texto sobre botones Brown |
| `soft-blue` | `#a9bcd0` | Navbar lateral, badges, elementos secundarios, estados inactivos, anillo de foco |
| `brown` | `#582f0e` | Texto, iconos, botones primarios |

- Matices con opacidad, no colores nuevos: `text-brown/75` (texto secundario), `border-brown/20`, `bg-white/60` (subtarjetas dentro de una tarjeta), `shadow-brown/5`.
- Único color fuera de tokens permitido: el de los gráficos de Recharts, que necesita el hex (`ExpensesByCategoryChart.tsx`, mismo valor que `--color-brown`).

## 2. Tipografía
- **Títulos** (`h1`–`h3`, logo, botones primarios): `font-display` = Nunito, ya aplicada a los encabezados en `index.css` con `font-extrabold tracking-tight`.
- **Cuerpo** (texto, menús, formularios): `font-sans` = Outfit, por defecto en `body`. Usa `font-light` en descripciones.
- Las fuentes vienen de `@fontsource-variable/*`; no añadas otras ni enlaces a Google Fonts.

## 3. Iconos y logo
- **Nada de emojis** en la interfaz. Los iconos son vectoriales de **`lucide-react`**, en `currentColor` (heredan el Brown), con `aria-hidden="true"` y tamaño Tailwind (`size-4` en texto, `size-5` en títulos de tarjeta).
- Si lucide no tiene el icono, créalo en `src/components/icons/` con su mismo estilo (viewBox 24, `stroke="currentColor"`, `strokeWidth={2}`, extremos redondeados). Ejemplo: `PoopIcon.tsx`.
- Los iconos asociados a enums están en `src/constants/labels.ts` (`SPECIES_ICONS`, `EXPENSE_CATEGORY_LABELS[x].icon`), no repartidos por los componentes.
- **Logo:** el shiba sonriente de `public/favicon.svg`, mostrado con `<AppLogo className="size-…" />`. Va donde aparezca la marca "Pet Manager" (navbar, login, estados vacíos). No uses huellas como logo.
- Dentro de un `<select>` nativo no caben iconos: ahí solo texto.

## 4. Componentes y clases compartidas
| Necesitas… | Usa |
|---|---|
| Botón primario / secundario / terciario | `primaryButton`, `primaryButtonSm`, `secondaryButton`, `ghostButton` de `src/constants/styles.ts` |
| Micro-interacción al pasar el ratón | `lift` / `liftSm` (ya incluyen `motion-safe` y estado deshabilitado) |
| Input, select, textarea | `inputClass` dentro de `<Field label error hint>` (`forms/FormControls.tsx`) |
| Radio o checkbox con aspecto de botón | `<ChoiceButton input={<input type="radio" … />}>` |
| Botones Guardar/Cancelar y error del servidor | `<FormActions>` |
| "+ Añadir…" en la cabecera de una tarjeta | `<AddButton>` |
| Tarjeta del dashboard | `<Card title icon={IconoLucide} action>` + `<EmptyState>` (`cards/Card.tsx`) |
| Carga y error con reintento | `<LoadingState>` y `<ErrorState error onRetry>` (`Feedback.tsx`) |
| Foto de mascota | `<PetAvatar>` (siempre `rounded-full`) |

## 5. Forma y espaciado
- Radios amplios: `rounded-2xl` / `rounded-3xl` en tarjetas y contenedores, `rounded-xl` en controles, `rounded-full` en fotos y badges. Nunca `rounded-md`.
- Sombras grandes y muy suaves: `shadow-lg shadow-brown/5`.
- Diseño que respira: `p-6`/`p-8` en tarjetas, `gap-6`/`gap-8` entre bloques.

## 6. Layout
- Navbar fija a la izquierda (`w-64`, alto completo, `bg-soft-blue`) y contenido dinámico a la derecha (`Layout.tsx`).
- Dashboard de mascota: cabecera con foto grande + datos y, debajo, rejilla de tarjetas (`grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3`).

## 7. Accesibilidad (no opcional)
- Iconos decorativos con `aria-hidden="true"`; si un icono es el único contenido de un botón, el botón lleva `aria-label`.
- Estados de carga con `role="status"`; errores de campo enlazados con `aria-describedby` (ya lo hace `<Field>`).
- Animaciones de desplazamiento solo con `motion-safe:`.
- Modales con `<dialog>` + `showModal()` (foco atrapado y cierre con Esc), como `NewPetModal.tsx`.

## 8. Textos
En español, cercanos y breves ("Todavía no ha salido a pasear hoy."). Los nombres de los enums se muestran con `SPECIES_LABELS` / `EXPENSE_CATEGORY_LABELS`, nunca con el valor crudo (`PERRO`).

## Al terminar
`cd frontend && npm run build && npm run lint`, y comprueba que cada componente o función nueva lleva su comentario `/** */` (regla de `CLAUDE.md`).
