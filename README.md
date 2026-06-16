# MiCVListo

Web gratuita, sin anuncios y de costo operativo mínimo para armar CVs
profesionales. Guía al usuario con preguntas simples, transforma las respuestas
en frases profesionales (sin IA paga, con reglas y plantillas), muestra una
vista previa y permite descargar el CV en PDF.

- **Gratis, sin anuncios, sin vender datos.**
- **Funciona sin cuenta.** El login con Google (Firebase) es opcional y solo
  sirve para guardar CVs en la nube.
- **Todo en el navegador:** foto, generación de PDF y autosave local.

## Stack

- React + Vite + TypeScript
- CSS simple con variables + CSS Modules (sin Tailwind)
- React Router
- Hosting recomendado: Cloudflare Pages

> El plan completo y las decisiones técnicas están en [`PLAN.md`](./PLAN.md).

## Requisitos

- Node.js 20+ y npm

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo
npm run build      # typecheck + build de producción (carpeta dist/)
npm run preview    # previsualizar el build
npm run typecheck  # solo chequeo de tipos
npm run lint       # ESLint
npm run format     # formatear con Prettier
```

## Estructura

```
src/
  app/          router + componente raíz
  pages/        páginas por ruta (landing, wizard, preview, privacy)
  features/     wizard, cv-model, phrase-engine, photo, pdf, auth
  content/      contenido editable del producto (diccionarios, sugerencias, plantillas, copy)
  components/   UI reutilizable (Layout, etc.)
  lib/          helpers (firebase, storage local, etc.)
  styles/       estilos globales + design tokens
```

Estado: **Fase 0 completa** (scaffold, estructura, ruteo y pantalla inicial).
Próximas fases en [`PLAN.md`](./PLAN.md).
