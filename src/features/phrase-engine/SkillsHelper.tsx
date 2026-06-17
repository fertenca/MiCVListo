import { useState } from 'react';
import {
  skillsCategories,
  skillsSuggestionMap,
} from '../../content/suggestions/skillsSuggestions';
import type { SkillEntry } from '../cv-model';
import styles from './SkillsHelper.module.css';

interface Props {
  existingSkills: SkillEntry[];
  onAdd: (skills: Omit<SkillEntry, 'id'>[]) => void;
}

export function SkillsHelper({ existingSkills, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [allDupeMsg, setAllDupeMsg] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setAllDupeMsg(false);
  }

  function handleAdd() {
    const existingLabels = new Set(
      existingSkills.map((s) => s.label.toLowerCase().trim()),
    );

    const toAdd: Omit<SkillEntry, 'id'>[] = [];
    for (const id of selected) {
      const suggestion = skillsSuggestionMap.get(id);
      if (!suggestion) continue;
      if (!existingLabels.has(suggestion.label.toLowerCase().trim())) {
        toAdd.push({ label: suggestion.label, category: suggestion.category });
      }
    }

    if (toAdd.length === 0) {
      setAllDupeMsg(true);
      return;
    }

    onAdd(toAdd);
    reset();
  }

  function reset() {
    setSelected(new Set());
    setAllDupeMsg(false);
    setOpen(false);
  }

  const count = selected.size;

  if (!open) {
    return (
      <div className={styles.helperBox}>
        <p className={styles.helperTitle}>¿No sabés qué habilidades poner?</p>
        <p className={styles.helperDesc}>
          Marcá cosas que sabés hacer o actitudes que te representan. Después podés
          editar o borrar lo que quieras.
        </p>
        <button
          type="button"
          className={styles.helperBtn}
          onClick={() => setOpen(true)}
        >
          Ayudarme con mis habilidades
        </button>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <p className={styles.intro}>
        Seleccioná lo que aplica. Cada opción se agrega como una habilidad individual
        que después podés editar.
      </p>

      <div className={styles.categories}>
        {skillsCategories.map((cat) => (
          <div key={cat.id} className={styles.category}>
            <p className={styles.categoryLabel}>{cat.label}</p>
            <div className={styles.chipGrid}>
              {cat.suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.chip}${selected.has(s.id) ? ' ' + styles.chipSelected : ''}`}
                  onClick={() => toggle(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {allDupeMsg && (
        <p className={styles.dupeMsg} role="alert">
          Todas estas habilidades ya las tenés cargadas. Elegí otras o cerrá.
        </p>
      )}

      <div className={styles.panelActions}>
        <button
          type="button"
          className={styles.addBtn}
          onClick={handleAdd}
          disabled={count === 0}
        >
          {count > 0
            ? `Agregar ${count} habilidad${count > 1 ? 'es' : ''}`
            : 'Seleccioná al menos una'}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={reset}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
