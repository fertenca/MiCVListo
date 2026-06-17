export interface Suggestion {
  id: string;
  label: string;
}

export interface SuggestionCategory {
  id: string;
  label: string;
  suggestions: Suggestion[];
}

export const profileCategories: SuggestionCategory[] = [
  {
    id: 'situacion',
    label: 'Tu situación',
    suggestions: [
      { id: 'sit-exp-atencion', label: 'Atención al cliente' },
      { id: 'sit-exp-admin', label: 'Tareas administrativas' },
      { id: 'sit-exp-cuidado', label: 'Cuidado de personas' },
      { id: 'sit-exp-gastronomia', label: 'Gastronomía' },
      { id: 'sit-exp-reparto', label: 'Reparto / cadetería' },
      { id: 'sit-exp-limpieza', label: 'Limpieza y mantenimiento' },
      { id: 'sit-exp-comercio', label: 'Ventas / comercio' },
      { id: 'sit-primera', label: 'Primera búsqueda laboral' },
      { id: 'sit-estudio', label: 'Estoy estudiando' },
      { id: 'sit-informal', label: 'Experiencia informal' },
      { id: 'sit-volviendo', label: 'Retomando tras una pausa' },
    ],
  },
  {
    id: 'actitudes',
    label: 'Cómo sos trabajando',
    suggestions: [
      { id: 'act-responsable', label: 'Responsable' },
      { id: 'act-puntual', label: 'Puntual' },
      { id: 'act-aprendo', label: 'Aprendo rápido' },
      { id: 'act-equipo', label: 'Trabajo en equipo' },
      { id: 'act-ordenado', label: 'Ordenado/a' },
      { id: 'act-cordial', label: 'Buen trato' },
      { id: 'act-proactivo', label: 'Proactivo/a' },
      { id: 'act-compromiso', label: 'Comprometido/a' },
      { id: 'act-autonomo', label: 'Trabajo solo/a' },
      { id: 'act-presion', label: 'Trabajo bajo presión' },
    ],
  },
  {
    id: 'conocimientos',
    label: 'Qué sabés hacer',
    suggestions: [
      { id: 'con-excel', label: 'Excel' },
      { id: 'con-computadora', label: 'Computadora' },
      { id: 'con-caja', label: 'Caja registradora' },
      { id: 'con-redes', label: 'Redes sociales' },
      { id: 'con-ingles', label: 'Inglés básico' },
      { id: 'con-licencia', label: 'Licencia de conducir' },
      { id: 'con-facturacion', label: 'Facturación' },
      { id: 'con-herramientas', label: 'Herramientas manuales' },
    ],
  },
  {
    id: 'objetivo',
    label: 'Qué buscás',
    suggestions: [
      { id: 'obj-aprender', label: 'Seguir aprendiendo' },
      { id: 'obj-estable', label: 'Trabajo estable' },
      { id: 'obj-crecer', label: 'Crecer en la empresa' },
      { id: 'obj-aportar', label: 'Aportar lo que sé' },
      { id: 'obj-local', label: 'Trabajo cerca de casa' },
    ],
  },
];
