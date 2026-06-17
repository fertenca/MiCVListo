import { experienceCategories } from '../../content/suggestions/experienceSuggestions';
import { experiencePhrases } from '../../content/phrase-templates/experiencePhrases';

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
