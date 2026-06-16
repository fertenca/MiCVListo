# MiCVListo — Documento de Planificación (MVP V0)

> Estado: **plan aprobado**. Las decisiones de la sección "Decisiones cerradas"
> están confirmadas por el dueño del proyecto y no se reabren sin acuerdo.

## Decisiones cerradas

1. **Vite + React + TypeScript** para la V0.
2. **CSS simple con variables + CSS Modules.** No usar Tailwind por ahora.
3. **Español de Argentina** como único idioma de la V0.
4. **Cloudflare Pages** como hosting recomendado.
5. **Firebase Auth + Firestore**, pero solo en una **fase posterior** y solo
   para usuarios logueados.
6. La app **debe funcionar sin cuenta** y permitir **descargar el PDF sin
   login**.

## Ajustes obligatorios (parte del acuerdo)

- **Consistencia preview/PDF:** no se promete "byte por byte exacto". La vista
  previa y la descarga **usan la misma plantilla, buscando consistencia
  visual**.
- **Foto:** **local por defecto en la V0**. Si más adelante se guarda en
  Firestore, debe estar **comprimida**, con **límite estricto de tamaño** y
  **aclaración de privacidad**. **No usar Firebase Storage en la V0.**
- **Firebase no se adelanta a la Fase 0.** Queda para la fase de login/guardado
  en la nube.
- **Prioridad inicial:** tener una app **usable sin cuenta** →
  wizard + autosave local + preview + PDF.
- **`content/` separado del código desde el inicio.** Es parte central del
  producto.

---

## 1. Análisis del proyecto

Es, en el fondo, una **SPA que vive casi entera en el navegador**. Esto define
todo lo demás:

- **La "inteligencia" no es IA, es contenido curado + reglas.** El valor real
  está en los diccionarios de habilidades, las frases prearmadas y las
  plantillas de texto. El código es el andamiaje; el contenido es el producto.
- **Local-first.** Crear un CV sin cuenta es central: el navegador es la fuente
  de verdad por defecto. Firebase es **opcional y secundario**.
- **Costo cercano a cero = sin servidor propio.** Todo lo pesado (PDF, foto,
  lógica de frases) corre en el cliente. Hosting estático. Firebase solo en su
  capa gratuita.
- **El público define la UX.** Personas con poca experiencia digital → pasos
  cortos, botones grandes, lenguaje humano, y el botón **"No sé qué poner"**
  como mecánica central.

El mayor desafío técnico real es **la generación de PDF en el navegador con
calidad profesional y compatible con ATS** (los sistemas que filtran CVs).

---

## 2. Alcance exacto del MVP

### ✅ Entra en la V0

| Área                | Detalle                                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Landing             | Propuesta de valor + mensajes de confianza/privacidad                                                                                           |
| Modos               | "Tengo experiencia", "Busco mi primer trabajo", "Tengo experiencia informal"                                                                    |
| Wizard              | Datos personales → Foto (opc.) → Perfil → Experiencia → Educación → Cursos → Habilidades → Idiomas → Disponibilidad (opc.) → Referencias (opc.) |
| "No sé qué poner"   | En secciones clave: opciones simples → frases profesionales                                                                                     |
| Motor de frases     | Reglas + plantillas + diccionarios (sin IA)                                                                                                     |
| Foto                | Recorte + compresión 100% en el navegador (borra EXIF). **Local por defecto.**                                                                  |
| Vista previa        | Misma plantilla que la descarga, buscando consistencia visual                                                                                   |
| Plantillas          | 3: **Clásica**, **Moderna**, **Primer empleo**                                                                                                  |
| Exportar            | Descarga PDF con texto seleccionable. **Sin requerir login.**                                                                                   |
| Guardado local      | Autosave en el navegador, sin cuenta                                                                                                            |
| Login Google        | Opcional (Firebase Auth), fase posterior                                                                                                        |
| Guardado en la nube | Firestore, **solo** para usuarios logueados, fase posterior                                                                                     |
| Privacidad          | Página de privacidad + microcopys de confianza                                                                                                  |

### ❌ Fuera de la V0

Pagos, premium, anuncios, IA paga, importar LinkedIn, editor visual tipo Canva,
más de 3 plantillas, backend propio, multi-idioma de la interfaz, Firebase
Storage.

### Decisiones de alcance

- Idioma de la V0: **español de Argentina**, una sola variante. Los textos van en
  `content/copy/` para una futura traducción, pero **sin** librería de i18n.
- **Una sola foto por CV.**
- **CV de 1–2 páginas** (manejo de salto de página acotado).
- En local: **un borrador activo**. Múltiples CVs simultáneos quedan para los
  usuarios logueados.

---

## 3. Arquitectura técnica (decisiones justificadas)

### Framework: **Vite + React + TypeScript** (no Next.js)

- La app es esencialmente **un wizard + un render de PDF**. No necesita SSR,
  rutas de API ni base de datos en servidor; eso lo cubre Firebase desde el
  cliente.
- Vite genera **output 100% estático** → costo cero real, sin "cold starts".
- Menos complejidad = se lanza antes.
- **Contra (SEO de SPA) y mitigación:** la landing es lo único que necesita SEO;
  se puede pre-renderizar a HTML estático con buenos meta tags. El wizard no
  necesita SEO.

### Hosting: **Cloudflare Pages**

- Ancho de banda **ilimitado** en el plan gratuito (importa para una herramienta
  que puede viralizarse). CDN global, SSL, dominio gratis `*.pages.dev`.
- Como es una SPA, se incluye `public/_redirects` con fallback
  `/* /index.html 200` para que las rutas profundas funcionen al recargar.

### Auth + Base de datos: **Firebase** (Auth + Firestore), plan Spark — **fase posterior**

- Login con Google 100% client-side. Firestore en capa gratuita alcanza de
  sobra. Seguridad vía **Security Rules**: cada usuario solo lee/escribe sus
  propios documentos.
- Las claves de config de Firebase son públicas por diseño; la seguridad real
  está en las Rules.
- **No se toca Firebase hasta la fase de login/guardado en la nube.**

### Generación de PDF: **`@react-pdf/renderer`** (decisión crítica)

| Enfoque                 | Texto seleccionable / ATS | Backend   | Veredicto       |
| ----------------------- | ------------------------- | --------- | --------------- |
| **@react-pdf/renderer** | ✅ Sí (vectorial)         | No        | ✅ **Elegido**  |
| html2canvas + jsPDF     | ❌ No (foto del DOM)      | No        | ❌ Rompe ATS    |
| Puppeteer (server)      | ✅ Sí                     | Sí (paga) | ❌ Cuesta plata |

**Por qué importa el ATS:** muchas empresas extraen el texto del PDF con un
software. Si el PDF es una imagen, el CV llega "vacío" al reclutador. Para este
público, eso es decisivo.

**Consistencia preview/PDF:** las plantillas se escriben una sola vez como
componentes de `@react-pdf` y la vista previa usa el `<PDFViewer>` de la misma
librería. Así **la vista previa y la descarga usan la misma plantilla, buscando
consistencia visual** (no se promete equivalencia exacta).

### Foto: Canvas API + recorte en el cliente

- `react-easy-crop` para recortar → exportar con Canvas comprimiendo a
  JPEG/WebP pequeño. Re-encodear borra el EXIF (incluida geolocalización).
- **V0: local por defecto**, embebida como data-URL en el modelo del CV.
- Si en una fase posterior se guarda en Firestore: **comprimida, con límite
  estricto de tamaño y aclaración de privacidad**. **Nunca Firebase Storage en
  la V0.**

### Estado: **Zustand** con middleware `persist`

- El modelo del CV es un objeto que muchos pasos editan y hay que persistir a
  `localStorage` (autosave casi gratis) y, si hay login, sincronizar a Firestore.
- Validación por paso con **Zod**.

> Nota: Zustand, Zod, react-pdf, react-easy-crop, firebase y nanoid **no** se
> instalan en la Fase 0; entran en sus fases respectivas.

---

## 4. Estructura de carpetas

```
MiCVListo/
├─ public/
│  ├─ fonts/                    # fuentes para react-pdf (glyphs latinos: ñ, á…)
│  └─ _redirects                # fallback SPA para Cloudflare Pages
├─ src/
│  ├─ app/
│  │  ├─ App.tsx                # componente raíz (router provider)
│  │  └─ routes.tsx             # definición de rutas
│  ├─ pages/
│  │  ├─ Landing.tsx
│  │  ├─ Wizard.tsx
│  │  ├─ Preview.tsx
│  │  └─ Privacy.tsx
│  ├─ features/
│  │  ├─ wizard/steps/          # shell del wizard + un componente por paso
│  │  ├─ cv-model/              # tipos + store Zustand del CV
│  │  ├─ phrase-engine/         # ⭐ motor de frases (reglas + plantillas)
│  │  ├─ photo/                 # recorte + compresión
│  │  ├─ pdf/templates/         # plantillas @react-pdf (Clasica/Moderna/PrimerEmpleo)
│  │  └─ auth/                  # Firebase auth + sync Firestore (fase posterior)
│  ├─ content/                  # ⭐ contenido editable, separado del código
│  │  ├─ dictionaries/          # diccionarios de habilidades
│  │  ├─ suggestions/           # opciones "No sé qué poner"
│  │  ├─ phrase-templates/      # plantillas de frases
│  │  └─ copy/                  # textos de la UI (futura traducción)
│  ├─ components/               # UI reutilizable (Layout, etc.)
│  ├─ lib/                      # firebase init, storage local, helpers
│  └─ styles/                   # global.css (variables/design tokens)
├─ index.html
├─ vite.config.ts
├─ tsconfig*.json
├─ eslint.config.js
├─ .prettierrc.json
├─ package.json
└─ PLAN.md
```

`content/` está separada a propósito: ahí vive el verdadero producto y debe
poder editarse sin tocar lógica.

---

## 5. Modelo de datos

```ts
type CVMode = 'experiencia' | 'primer-empleo' | 'informal';
type TemplateId = 'clasica' | 'moderna' | 'primer-empleo';

interface CVDocument {
  id: string; // uuid
  schemaVersion: 1; // para migraciones futuras
  mode: CVMode;
  template: TemplateId;

  personal: {
    fullName: string;
    headline?: string;
    email?: string;
    phone?: string;
    city?: string;
    photo?: string; // data-URL comprimido (local) o null
    links?: { label: string; url: string }[];
  };

  profile?: string; // resumen, generado o escrito a mano

  experience: {
    id: string;
    role: string; // puede ser informal
    org?: string;
    isInformal: boolean;
    startDate?: string;
    endDate?: string; // o "Actualidad"
    bullets: string[]; // frases generadas/editadas
  }[];

  education: {
    id: string;
    title: string;
    institution?: string;
    status: 'completo' | 'en-curso' | 'incompleto';
    year?: string;
  }[];

  courses: { id: string; name: string; institution?: string; year?: string }[];
  skills: { id: string; label: string; category?: string }[];
  languages: {
    id: string;
    language: string;
    level: 'basico' | 'intermedio' | 'avanzado' | 'nativo';
  }[];

  availability?: string;
  references: { id: string; name: string; relation?: string; phone?: string }[];

  meta: { createdAt: number; updatedAt: number };
}
```

**Persistencia:**

- **Local (sin cuenta):** `localStorage` → un borrador activo.
- **Nube (logueado, fase posterior):** Firestore `users/{uid}/cvs/{cvId}`.
- **Security Rules:** `request.auth.uid == uid` + límite de tamaño del documento.

> ⚠️ Foto: Firestore limita a **1 MB por documento**. Se comprime a ~80–150 KB.
> Sin Firebase Storage en la V0.

---

## 6. Flujo de usuario

```
Landing  (confianza + "Empezá gratis, sin cuenta")
  ▼
Elegí tu situación  →  [Tengo experiencia] [Primer trabajo] [Experiencia informal]
  ▼
WIZARD (autosave local en cada cambio)
  Datos → Foto (opc.) → Perfil → Experiencia → Educación → Cursos
  → Habilidades → Idiomas → Disponibilidad (opc.) → Referencias (opc.)
    └─ "No sé qué poner" → opciones simples → motor de frases → editable a mano
  ▼
Vista previa  ◄──►  cambiar plantilla (Clásica / Moderna / Primer empleo)
  ├──►  Descargar PDF        (NO requiere cuenta)
  └──►  Login con Google     (opcional, "guardalo para después") → Firestore
```

**Descargar nunca exige login.** El login es conveniencia, no barrera.

---

## 7. Componentes principales

- **`Layout`** — header con marca + nav, contenido (Outlet), footer de confianza.
- **`WizardShell`** — navegación entre pasos, progreso, autosave ("Guardado ✓").
- **`StepCard`** — contenedor de cada paso (título humano, ayuda, contenido).
- **`NoIdeaHelper`** — abre chips de opciones simples → llama al motor de frases.
- **`SuggestionChips`** — chips seleccionables.
- **`PhraseEngine`** (módulo) — selecciones + modo → frases profesionales.
- **`PhotoUploader`** — input + recorte + compresión Canvas.
- **`RepeatableList`** — experiencia/educación/cursos/idiomas/referencias.
- **`CVPreview`** — `<PDFViewer>` con la plantilla activa.
- **`TemplatePicker`** — cambia entre las 3 plantillas en vivo.
- **`DownloadButton`** — dispara la descarga del PDF.
- **`AuthButton` / `SaveToCloud`** — login Google + sincronización (fase posterior).
- **`TrustBanner`** — mensajes de privacidad.

---

## 8. Librerías

| Librería                         | Para qué                | Fase |
| -------------------------------- | ----------------------- | ---- |
| `react`, `react-dom`             | Base                    | 0    |
| `vite`, `@vitejs/plugin-react`   | Build/dev estático      | 0    |
| `typescript`                     | Tipado                  | 0    |
| `react-router-dom`               | Rutas                   | 0    |
| `eslint` + `prettier` (+ config) | Calidad/formato         | 0    |
| `zustand`                        | Estado + autosave local | 1    |
| `zod`                            | Validación por paso     | 1    |
| `react-easy-crop`                | Recorte de foto         | 4    |
| `@react-pdf/renderer`            | PDF + preview           | 6    |
| `firebase`                       | Auth Google + Firestore | 9    |
| `nanoid`                         | IDs                     | 1    |

**Estilos:** CSS Modules + variables CSS, sin Tailwind. Sin librería de
componentes pesada ni i18n en la V0.

---

## 9. Riesgos técnicos (y mitigación)

1. **PDF — tildes/ñ.** Registrar una fuente con set latino completo y probar
   `ñ á é í ó ú ü ¿ ¡` desde el día uno.
2. **PDF — saltos de página.** Diseñar para 1–2 páginas; `wrap`/`break`
   controlados; testear con un CV "máximo".
3. **Performance en celulares de gama baja.** Preview con _debounce_; el PDF
   pesado se genera al tocar "Descargar".
4. **Límites de almacenamiento** (`localStorage` ~5 MB, Firestore 1 MB/doc).
   Comprimir foto fuerte; un borrador local activo; alertar si se excede.
5. **Calidad del motor de frases.** Frases deterministas y curadas; **el usuario
   siempre puede editar a mano**.
6. **SEO de SPA.** Pre-render de la landing.
7. **Privacidad/legal.** Página de privacidad clara; datos mínimos; foto y PDF
   en el cliente.
8. **UX para baja alfabetización digital.** Un paso = una pregunta, botones
   grandes, "No sé qué poner" siempre a mano, accesibilidad básica.
9. **Abuso de la capa gratuita de Firebase.** Rules estrictas + escritura solo
   autenticada + límite de tamaño.

---

## 10. Fases (con checklist)

### Fase 0 — Setup ✅ (completada)

- [x] Inicializar Vite + React + TS
- [x] ESLint + Prettier + estructura de carpetas
- [x] Rutas vacías (landing / wizard / preview / privacidad)
- [x] Layout base + pantalla inicial mínima
- [x] `public/_redirects` para Cloudflare Pages
- [ ] (Pendiente, cuando se quiera) primer deploy a Cloudflare Pages

> Firebase y PDF **no** se tocan en esta fase.

### Fase 1 — Modelo de datos + persistencia local

- [ ] Tipos del `CVDocument`
- [ ] Store Zustand con `persist` → autosave a `localStorage`
- [ ] Esquemas Zod por sección

### Fase 2 — Landing + selección de modo

- [ ] Landing con propuesta de valor y `TrustBanner`
- [ ] Pantalla "Elegí tu situación" (3 modos) → setea `mode`
- [ ] Pre-render de la landing (SEO)

### Fase 3 — Esqueleto del wizard

- [ ] `WizardShell`: navegación, progreso, atrás/siguiente
- [ ] Indicador "Guardado ✓" + reanudar borrador

### Fase 4 — Pasos del formulario

- [ ] Datos personales
- [ ] Foto opcional (recorte + compresión + borrado EXIF, local)
- [ ] Perfil / Experiencia / Educación / Cursos / Habilidades / Idiomas / Disponibilidad / Referencias
- [ ] `RepeatableList`

### Fase 5 — Motor de frases + contenido ⭐

- [ ] Estructura de `content/` (diccionarios, sugerencias, plantillas)
- [ ] `NoIdeaHelper` + `SuggestionChips`
- [ ] `PhraseEngine`: selecciones → frase profesional (editable)
- [ ] Variantes por modo

### Fase 6 — Preview + plantilla Clásica

- [ ] Registrar fuente con glyphs latinos + test de acentos
- [ ] Plantilla **Clásica** en `@react-pdf`
- [ ] `CVPreview` con `<PDFViewer>`

### Fase 7 — Exportar PDF

- [ ] `DownloadButton` (sin requerir login)
- [ ] Test con CV vacío, mínimo y "máximo" (1–2 páginas)

### Fase 8 — Plantillas restantes

- [ ] **Moderna** + **Primer empleo**
- [ ] `TemplatePicker` en vivo

### Fase 9 — Auth opcional + nube

- [ ] Firebase init + login Google
- [ ] Guardar/leer CVs en Firestore (`users/{uid}/cvs`)
- [ ] Security Rules + límites de tamaño
- [ ] Pantalla "Mis CVs" (logueados)

### Fase 10 — Pulido y lanzamiento

- [ ] Página de privacidad completa
- [ ] Accesibilidad + mobile gama baja
- [ ] Estados vacíos y mensajes de error humanos
- [ ] Checklist de lanzamiento (favicon propio, meta tags, og:image, dominio)

---

## 11. Visión ética del producto y métricas futuras

### Principios obligatorios del producto

Estos principios no son aspiracionales: son restricciones de diseño que deben
verificarse en cada nueva función antes de implementarla.

| Principio                        | Descripción                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sin barrera de descarga**      | El usuario puede crear y descargar su CV sin cuenta. El login nunca bloquea el acceso al PDF.                                                     |
| **Login solo como conveniencia** | El login con Google existe únicamente para guardar y retomar el CV después. Nunca como requisito.                                                 |
| **Sin anuncios**                 | Cero banners, cero redes publicitarias, cero tracking de terceros.                                                                                |
| **Sin pasos artificiales**       | No hay pantallas intermedias, formularios extra ni "últimos pasos" inventados antes de la descarga.                                               |
| **Sin venta de datos**           | Los datos del CV no se comparten, venden ni ceden a ningún tercero bajo ninguna forma.                                                            |
| **Sin patrones oscuros**         | No se usan dark patterns: sin checkboxes pre-tildados, sin subscripciones disfrazadas, sin urgencia falsa, sin opciones diseñadas para confundir. |
| **Sin explotación de contenido** | El contenido de los CVs (nombre, experiencia, datos personales) no se lee, analiza ni usa con fines comerciales.                                  |
| **Lenguaje simple y accesible**  | La app habla como una persona, no como un formulario corporativo. Diseñada para personas con poca experiencia digital.                            |

> **Regla de revisión:** antes de agregar cualquier nueva función, preguntarse:
> ¿viola alguno de estos principios? Si la respuesta es sí, la función no entra.

### Dashboard de administración (backlog futuro, fuera de la V0)

Panel privado para el dueño del proyecto que muestre métricas agregadas de uso.
No es parte del MVP. Se diseña e implementa después del lanzamiento, cuando haya
datos reales que analizar.

**Qué debe mostrar:**

- Cantidad de usuarios registrados (con cuenta).
- Cantidad de CVs guardados en la nube.
- Cantidad estimada de CVs creados (incluyendo sin cuenta, via eventos anónimos
  de descarga).
- Cantidad de descargas de PDF.
- Distribución de modos: primer empleo / experiencia formal / experiencia
  informal.
- Plantillas más usadas: Clásica / Moderna / Primer empleo.
- Errores técnicos relevantes (tasa de errores de build de PDF, fallos de sync,
  etc.).

**Restricción de privacidad (no negociable):**

El dashboard **jamás** muestra contenido de CVs individuales: ni nombres, ni
fotos, ni teléfonos, ni emails, ni ningún dato personal cargado por el usuario.
Solo métricas agregadas, anónimas y sin posibilidad de reidentificación.

Cualquier evento de analítica que se implemente (para alimentar estas métricas)
debe respetar la misma restricción: **recolectar únicamente qué se hizo, nunca
con qué datos se hizo**.
