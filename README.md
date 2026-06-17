# MiCVListo

MiCVListo es una herramienta web gratuita para crear un CV profesional de forma simple, sin cuenta obligatoria, sin anuncios y con descarga en PDF A4 listo para enviar.

La app está pensada especialmente para personas que buscan trabajo y necesitan una guía clara para armar su CV, incluso si no tienen experiencia formal, están buscando su primer empleo o vienen de trabajos informales.

**App en producción:** https://micvlisto.pages.dev

![Vista previa para compartir](./public/og-image.png)

## Estado actual

**MVP funcional / pre-lanzamiento.**

Actualmente permite:

- Crear un CV desde un wizard guiado.
- Elegir entre modos: experiencia laboral, primer empleo o experiencia informal.
- Guardar el borrador localmente en el navegador.
- Cargar una foto opcional procesada en el navegador.
- Usar ayudas tipo “No sé qué poner” para redactar mejor algunas secciones.
- Ver una vista previa del CV.
- Descargar un PDF A4 con texto seleccionable, sin login y sin backend.
- Usar la app sin anuncios y sin pagos.

## Principios del proyecto

- **Gratis:** no hay pagos, planes premium ni anuncios.
- **Sin cuenta obligatoria:** el usuario puede crear y descargar su CV sin registrarse.
- **Local-first:** mientras no exista login opcional, el borrador vive en el navegador del usuario.
- **Privacidad:** la foto y el PDF se procesan en el dispositivo; no se suben a un servidor.
- **Accesibilidad práctica:** textos simples, pasos cortos y ayuda para personas que no saben cómo redactar su CV.
- **Costo operativo mínimo:** hosting estático y lógica en cliente.

## Funcionalidades principales

- Landing con propuesta de valor y mensajes de confianza.
- Wizard de carga de datos:
  - Datos personales.
  - Foto opcional.
  - Perfil.
  - Experiencia.
  - Educación.
  - Cursos y capacitaciones.
  - Habilidades.
  - Idiomas.
  - Disponibilidad.
  - Referencias.
  - Revisión final.
- Vista previa con plantilla clásica.
- Generación de PDF A4 desde el navegador.
- Página de privacidad.
- Metadata Open Graph para compartir el link.
- Favicon e imagen pública del proyecto.

## Stack

- React
- Vite
- TypeScript
- React Router
- Zustand + persistencia local
- Zod
- CSS Modules + variables CSS
- `@react-pdf/renderer` para generar PDF con texto seleccionable
- Cloudflare Pages para deploy
- GitHub Actions para CI/CD

## Requisitos

- Node.js 22 recomendado.
- npm.

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo
npm run build      # typecheck + build de producción
npm run preview    # previsualizar el build
npm run typecheck  # chequeo de tipos
npm run lint       # ESLint
npm run format     # formatear con Prettier
```

## Estructura general

```txt
src/
  app/          router + componente raíz
  pages/        landing, crear, wizard, preview, privacidad
  features/     wizard, modelo de CV, motor de frases, template y PDF
  content/      sugerencias, plantillas de frases y contenido editable
  components/   UI reutilizable
  styles/       estilos globales y design tokens
public/
  _redirects    fallback SPA para Cloudflare Pages
  favicon.svg   ícono del sitio
  og-image.png  imagen para compartir en redes
```

## Privacidad y datos

MiCVListo no tiene backend propio en el MVP actual.

- El borrador se guarda en `localStorage` del navegador.
- La foto se procesa localmente con Canvas.
- El PDF se genera localmente en el navegador.
- No se venden datos.
- No hay anuncios.
- No se requiere login para crear o descargar el CV.

## Roadmap posible

Ideas para futuras fases:

- Login opcional con Google para guardar CVs entre dispositivos.
- Persistencia en Firestore solo para usuarios logueados.
- Más plantillas de CV.
- Dashboard privado con métricas agregadas, sin leer datos personales del CV.
- Pruebas específicas en Safari iOS.

## Documentación de planificación

El archivo [`PLAN.md`](./PLAN.md) conserva decisiones, análisis y planificación histórica del proyecto. Puede incluir ideas de roadmap o fases que todavía no están implementadas.

## Licencia

MIT. Ver [`LICENSE`](./LICENSE).
