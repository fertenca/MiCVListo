export interface SkillSuggestion {
  id: string;
  label: string;
  category: string;
}

export interface SkillSuggestionCategory {
  id: string;
  label: string;
  suggestions: SkillSuggestion[];
}

export const skillsCategories: SkillSuggestionCategory[] = [
  {
    id: 'atencion-cliente',
    label: 'Atención al cliente',
    suggestions: [
      { id: 'sk-atencion-cliente', label: 'Atención al cliente', category: 'Atención al cliente' },
      { id: 'sk-trato-cordial', label: 'Trato cordial', category: 'Atención al cliente' },
      { id: 'sk-resolucion-consultas', label: 'Resolución de consultas', category: 'Atención al cliente' },
      { id: 'sk-manejo-reclamos', label: 'Manejo de reclamos simples', category: 'Atención al cliente' },
      { id: 'sk-comunicacion-clara', label: 'Comunicación clara', category: 'Atención al cliente' },
    ],
  },
  {
    id: 'comercio-caja',
    label: 'Comercio y caja',
    suggestions: [
      { id: 'sk-manejo-caja', label: 'Manejo de caja', category: 'Comercio y caja' },
      { id: 'sk-cobros', label: 'Cobros', category: 'Comercio y caja' },
      { id: 'sk-reposicion', label: 'Reposición de mercadería', category: 'Comercio y caja' },
      { id: 'sk-control-stock', label: 'Control de stock', category: 'Comercio y caja' },
      { id: 'sk-org-pedidos', label: 'Organización de pedidos', category: 'Comercio y caja' },
      { id: 'sk-ventas', label: 'Ventas', category: 'Comercio y caja' },
    ],
  },
  {
    id: 'administracion',
    label: 'Administración',
    suggestions: [
      { id: 'sk-carga-datos', label: 'Carga de datos', category: 'Administración' },
      { id: 'sk-org-documentacion', label: 'Organización de documentación', category: 'Administración' },
      { id: 'sk-atencion-telefonica', label: 'Atención telefónica', category: 'Administración' },
      { id: 'sk-manejo-turnos', label: 'Manejo de turnos', category: 'Administración' },
      { id: 'sk-archivo', label: 'Archivo de documentación', category: 'Administración' },
    ],
  },
  {
    id: 'informatica',
    label: 'Informática básica',
    suggestions: [
      { id: 'sk-computadora', label: 'Uso de computadora', category: 'Informática básica' },
      { id: 'sk-excel', label: 'Excel básico', category: 'Informática básica' },
      { id: 'sk-word', label: 'Word básico', category: 'Informática básica' },
      { id: 'sk-drive', label: 'Google Drive', category: 'Informática básica' },
      { id: 'sk-email', label: 'Correo electrónico', category: 'Informática básica' },
      { id: 'sk-whatsapp', label: 'WhatsApp', category: 'Informática básica' },
      { id: 'sk-redes', label: 'Redes sociales', category: 'Informática básica' },
    ],
  },
  {
    id: 'tareas-generales',
    label: 'Tareas generales',
    suggestions: [
      { id: 'sk-limpieza', label: 'Limpieza y orden', category: 'Tareas generales' },
      { id: 'sk-mantenimiento', label: 'Mantenimiento del espacio de trabajo', category: 'Tareas generales' },
      { id: 'sk-prep-pedidos', label: 'Preparación de pedidos', category: 'Tareas generales' },
      { id: 'sk-colaboracion', label: 'Colaboración en equipo', category: 'Tareas generales' },
      { id: 'sk-adaptacion', label: 'Adaptación a distintas tareas', category: 'Tareas generales' },
    ],
  },
  {
    id: 'actitudes',
    label: 'Actitudes personales',
    suggestions: [
      { id: 'sk-responsabilidad', label: 'Responsabilidad', category: 'Actitudes personales' },
      { id: 'sk-puntualidad', label: 'Puntualidad', category: 'Actitudes personales' },
      { id: 'sk-predisposicion', label: 'Buena predisposición', category: 'Actitudes personales' },
      { id: 'sk-aprendizaje', label: 'Aprendizaje rápido', category: 'Actitudes personales' },
      { id: 'sk-trabajo-equipo', label: 'Trabajo en equipo', category: 'Actitudes personales' },
      { id: 'sk-organizacion', label: 'Organización', category: 'Actitudes personales' },
      { id: 'sk-compromiso', label: 'Compromiso', category: 'Actitudes personales' },
      { id: 'sk-proactividad', label: 'Proactividad', category: 'Actitudes personales' },
    ],
  },
];

export const skillsSuggestionMap: Map<string, SkillSuggestion> = new Map(
  skillsCategories.flatMap((cat) => cat.suggestions.map((s) => [s.id, s])),
);
