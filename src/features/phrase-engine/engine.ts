import { experienceCategories } from '../../content/suggestions/experienceSuggestions';
import { experiencePhrases } from '../../content/phrase-templates/experiencePhrases';
import {
  attitudeNouns,
  experienceAreaLabels,
  knowledgeLabels,
  objectivePhrases,
} from '../../content/phrase-templates/profilePhrases';
import type { CVMode } from '../cv-model';

export function generateExperienceBullets(selectedIds: string[]): string[] {
  const selectedSet = new Set(selectedIds);
  const result: string[] = [];

  for (const cat of experienceCategories) {
    for (const s of cat.suggestions) {
      if (selectedSet.has(s.id)) {
        const phrase = experiencePhrases[s.id];
        if (phrase) result.push(phrase);
      }
    }
  }

  return result;
}

export function generateProfileText(selectedIds: string[], mode: CVMode): string {
  const sitIds = selectedIds.filter((id) => id.startsWith('sit-'));
  const actIds = selectedIds.filter((id) => id.startsWith('act-'));
  const conIds = selectedIds.filter((id) => id.startsWith('con-'));
  const objIds = selectedIds.filter((id) => id.startsWith('obj-'));

  const parts: string[] = [];

  // Opening sentence based on situation chips + mode
  const areaIds = sitIds.filter((id) => id.startsWith('sit-exp-'));
  const areaLabels = areaIds.map((id) => experienceAreaLabels[id]).filter(Boolean);

  if (sitIds.includes('sit-primera') || mode === 'primer-empleo') {
    parts.push('Busco mi primera oportunidad laboral para aprender y desarrollarme.');
  } else if (sitIds.includes('sit-estudio')) {
    parts.push(
      'Me encuentro cursando estudios y busco incorporarme al mercado laboral.',
    );
  } else if (sitIds.includes('sit-volviendo')) {
    parts.push('Retomo la actividad laboral luego de un período de pausa.');
  } else if (sitIds.includes('sit-informal') || mode === 'informal') {
    if (areaLabels.length > 0) {
      parts.push(
        `Cuento con experiencia en trabajos informales vinculados a ${joinList(areaLabels)}.`,
      );
    } else {
      parts.push('Cuento con experiencia en trabajos informales variados.');
    }
  } else if (areaLabels.length > 0) {
    parts.push(`Cuento con experiencia en ${joinList(areaLabels)}.`);
  }

  // Attitudes: "Me destaco por..."
  if (actIds.length > 0) {
    const nouns = actIds.map((id) => attitudeNouns[id]).filter(Boolean);
    if (nouns.length > 0) {
      parts.push(`Me destaco por ${joinList(nouns)}.`);
    }
  }

  // Knowledge: "Cuento además con conocimientos en..."
  if (conIds.length > 0) {
    const areas = conIds.map((id) => knowledgeLabels[id]).filter(Boolean);
    if (areas.length > 0) {
      parts.push(`Cuento además con conocimientos en ${joinList(areas)}.`);
    }
  }

  // Objective chip (first selected wins) or default mode closing
  let closingAdded = false;
  for (const id of objIds) {
    const phrase = objectivePhrases[id];
    if (phrase) {
      parts.push(phrase);
      closingAdded = true;
      break;
    }
  }

  if (!closingAdded) {
    const defaultClosings: Record<CVMode, string> = {
      'primer-empleo': 'Tengo buena disposición para aprender y adaptarme al equipo.',
      informal: 'Estoy disponible para trabajar con responsabilidad y compromiso.',
      experiencia: 'Busco una oportunidad donde pueda aportar mi experiencia.',
    };
    parts.push(defaultClosings[mode]);
  }

  return parts.join(' ');
}

function joinList(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} y ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}
