# content/ — El producto vive acá

Esta carpeta contiene **el contenido editable de MiCVListo**, separado a
propósito del código. La "inteligencia" de la app (sin IA paga) se resuelve con
estos datos curados, no con lógica:

- `dictionaries/` — diccionarios de habilidades por rubro/categoría.
- `suggestions/` — opciones simples que aparecen al tocar **"No sé qué poner"**
  (ej.: "Atendía clientes", "Cobraba", "Reponía productos").
- `phrase-templates/` — plantillas que convierten las opciones elegidas en
  frases profesionales para el CV.
- `copy/` — textos de la interfaz (preparados para una futura traducción;
  la V0 es solo español de Argentina).

**Regla:** este contenido debe poder editarse y ampliarse sin tocar la lógica
de la app. El motor de frases (`src/features/phrase-engine/`) consume estos
datos, no los define.

Se completa a partir de la Fase 5 del plan.
