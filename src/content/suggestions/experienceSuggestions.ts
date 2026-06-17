export interface Suggestion {
  id: string;
  label: string;
}

export interface SuggestionCategory {
  id: string;
  label: string;
  suggestions: Suggestion[];
}

export const experienceCategories: SuggestionCategory[] = [
  {
    id: 'atencion-cliente',
    label: 'Atención al cliente / comercio',
    suggestions: [
      { id: 'aten-clientes', label: 'Atendía clientes' },
      { id: 'cobraba', label: 'Cobraba' },
      { id: 'reponia', label: 'Reponía productos' },
      { id: 'ordenaba-local', label: 'Ordenaba el local' },
      { id: 'consultas', label: 'Respondía consultas' },
      { id: 'pedidos', label: 'Preparaba pedidos' },
      { id: 'stock', label: 'Controlaba stock' },
      { id: 'redes', label: 'Usaba WhatsApp o redes sociales' },
      { id: 'reclamos', label: 'Resolvía reclamos simples' },
    ],
  },
  {
    id: 'admin',
    label: 'Administración básica',
    suggestions: [
      { id: 'datos', label: 'Cargaba datos' },
      { id: 'papeles', label: 'Organizaba papeles' },
      { id: 'llamadas', label: 'Atendía llamadas' },
      { id: 'computadora', label: 'Usaba computadora' },
      { id: 'excel', label: 'Usaba Excel' },
      { id: 'archivo', label: 'Archivaba documentación' },
      { id: 'turnos', label: 'Coordinaba turnos o pedidos' },
    ],
  },
  {
    id: 'cuidado',
    label: 'Cuidado de personas',
    suggestions: [
      { id: 'ninos', label: 'Cuidaba niños' },
      { id: 'mayores', label: 'Cuidaba adultos mayores' },
      { id: 'tramites', label: 'Acompañaba a trámites' },
      { id: 'comidas', label: 'Preparaba comidas' },
      { id: 'ordena-espacio', label: 'Ordenaba o limpiaba el espacio' },
      { id: 'medicacion', label: 'Ayudaba con medicación indicada por la familia' },
    ],
  },
  {
    id: 'reparto',
    label: 'Reparto / cadetería',
    suggestions: [
      { id: 'repartos', label: 'Hacía repartos' },
      { id: 'entregas', label: 'Organizaba entregas' },
      { id: 'mapas', label: 'Usaba mapas o apps' },
      { id: 'cobra-pedidos', label: 'Cobraba pedidos' },
      { id: 'comunica', label: 'Mantenía comunicación con clientes' },
    ],
  },
  {
    id: 'limpieza',
    label: 'Limpieza / mantenimiento',
    suggestions: [
      { id: 'limpiar', label: 'Limpiaba espacios' },
      { id: 'materiales', label: 'Ordenaba materiales' },
      { id: 'higiene', label: 'Mantenía higiene del lugar' },
      { id: 'prep-espacio', label: 'Preparaba espacios de trabajo' },
      { id: 'colabora', label: 'Colaboraba con tareas generales' },
    ],
  },
  {
    id: 'gastronomia',
    label: 'Gastronomía',
    suggestions: [
      { id: 'alimentos', label: 'Preparaba alimentos' },
      { id: 'atiende-pedidos', label: 'Atendía pedidos' },
      { id: 'limpieza-gastro', label: 'Mantenía limpieza' },
      { id: 'cocina', label: 'Ayudaba en cocina' },
      { id: 'insumos', label: 'Organizaba insumos' },
      { id: 'empaquetado', label: 'Empaquetaba productos' },
    ],
  },
];
