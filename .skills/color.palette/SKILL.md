# Skill: Color Palette & Modern UI Design
name: color-palette
description: Aplica estrictamente la paleta de colores oficial (Butter Yellow, Soft Blue, Brown) y directrices visuales de UI moderna, combinando tipografía redondeada para títulos y minimalista para texto en React/Tailwind.

## Instrucciones para el Agente:
Cuando escribas o modifiques código de interfaz (React / Tailwind / CSS), aplica estas reglas estrictamente para evitar un diseño genérico o "soso":

### 1. Paleta de Colores (Innegociable)
* **Butter Yellow (#FAF0CA o similar suave):** Usar exclusivamente para fondos principales, tarjetas grandes de contenido y áreas que requieran calidez.
* **Soft Blue (#A9BCD0 o similar):** Usar para el Navbar lateral, elementos secundarios, y estados inactivos o badges informativos.
* **Brown (#582F0E o similar):** Usar para la tipografía principal, iconos y botones de acción primaria (ej. "+ Nuevo miembro").

### 2. Tipografía (Dualidad Moderna)
* **Títulos (Gordita y redondeada):** Importa y usa una fuente como `Quicksand`, `Nunito` o `Fredoka` con pesos altos (`font-bold`, `font-extrabold`, `tracking-tight`). Aplícalo a todos los encabezados (h1, h2, h3), logotipos y textos de botones primarios.
* **Cuerpo (Fina y minimalista):** Importa y usa una fuente geométrica y limpia como `Inter`, `Outfit` o `Manrope` con pesos ligeros (`font-light`, `font-normal`, `text-gray-800` o Brown claro). Aplícalo a descripciones, menús, formularios y texto general.

### 3. Componentes y UI (Look "Moderno")
* **Bordes y Sombras:** Todas las imágenes de mascotas deben ser circulares (`rounded-full`). Las tarjetas y contenedores deben tener bordes redondeados amplios y limpios (usa `rounded-2xl` o `rounded-3xl`, no te quedes en el básico `rounded-md`) y sombras grandes pero muy difuminadas y suaves (ej. `shadow-lg` combinado con opacidades del 5% o 10%).
* **Espaciado (Breathable UI):** Añade paddings generosos (`p-6`, `p-8`) dentro de las tarjetas y separa bien los componentes (`gap-6`, `gap-8`). El diseño debe "respirar" y verse minimalista.
* **Interacciones:** Los botones y tarjetas clicables deben tener micro-interacciones modernas (ej. `transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`).