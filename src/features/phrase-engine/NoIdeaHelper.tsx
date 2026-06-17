import { useState } from 'react';
import { experienceCategories } from '../../content/suggestions/experienceSuggestions';
import { generateExperienceBullets } from './engine';
import styles from './NoIdeaHelper.module.css';

interface Props {
  onAdd: (bullets: string[]) => void;
}

export function NoIdeaHelper({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
  }

  function handleAdd() {
    const bullets = generateExperienceBullets(Array.from(selected));
    if (bullets.length === 0) return;
    onAdd(bullets);
    setSelected(new Set());
    setOpen(false);
  }

  function handleCancel() {
    setSelected(new Set());
    setOpen(false);
  }

  const count = selected.size;

  if (!open) {
    return (
      <div className={styles.helperBox}>
        <p className={styles.helperTitle}>¿No sabés qué tareas poner?</p>
        <p className={styles.helperDesc}>
          Marcá tareas que hiciste y las convertimos en frases más prolijas para tu CV.
          Después podés editarlas.
        </p>
        <button
          type="button"
          className={styles.helperBtn}
          onClick={() => setOpen(true)}
        >
          No sé qué poner
        </button>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <p className={styles.intro}>
        Marcá las tareas que hacías. Las convertimos en frases más prolijas para
        tu CV.
      </p>

      <div className={styles.categories}>
        {experienceCategories.map((cat) => (
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

      <div className={styles.panelActions}>
        <button
          type="button"
          className={styles.addBtn}
          onClick={handleAdd}
          disabled={count === 0}
        >
          {count > 0
            ? `Agregar ${count} tarea${count > 1 ? 's' : ''}`
            : 'Agregar estas tareas'}
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={handleCancel}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
