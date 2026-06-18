import { useState } from 'react';
import { profileCategories } from '../../content/suggestions/profileSuggestions';
import { generateProfileText } from './engine';
import type { CVMode } from '../cv-model';
import { track } from '../analytics';
import styles from './ProfileHelper.module.css';

interface Props {
  mode: CVMode;
  currentText: string;
  onReplace: (text: string) => void;
}

export function ProfileHelper({ mode, currentText, onReplace }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingText, setPendingText] = useState<string | null>(null);

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

  function handleGenerate() {
    const text = generateProfileText(Array.from(selected), mode);
    if (currentText.trim()) {
      setPendingText(text);
    } else {
      onReplace(text);
      track('helper_applied', { helperType: 'profile' });
      reset();
    }
  }

  function handleConfirmReplace() {
    if (pendingText !== null) onReplace(pendingText);
    track('helper_applied', { helperType: 'profile' });
    reset();
  }

  function handleBack() {
    setPendingText(null);
  }

  function reset() {
    setSelected(new Set());
    setPendingText(null);
    setOpen(false);
  }

  const count = selected.size;

  if (!open) {
    return (
      <div className={styles.helperBox}>
        <p className={styles.helperTitle}>¿Te cuesta escribir tu perfil?</p>
        <p className={styles.helperDesc}>
          Elegí algunas opciones y armamos un resumen breve que después podés modificar.
        </p>
        <button
          type="button"
          className={styles.helperBtn}
          onClick={() => {
            track('helper_opened', { helperType: 'profile' });
            setOpen(true);
          }}
        >
          Ayudarme a escribir mi perfil
        </button>
      </div>
    );
  }

  if (pendingText !== null) {
    return (
      <div className={styles.panel}>
        <p className={styles.confirmMsg}>
          Esto va a reemplazar el texto actual. ¿Confirmás?
        </p>
        <blockquote className={styles.preview}>{pendingText}</blockquote>
        <div className={styles.panelActions}>
          <button
            type="button"
            className={styles.addBtn}
            onClick={handleConfirmReplace}
          >
            Sí, reemplazar
          </button>
          <button type="button" className={styles.cancelBtn} onClick={handleBack}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <p className={styles.intro}>
        Seleccioná lo que aplica a tu situación y generamos un párrafo de perfil para
        vos.
      </p>

      <div className={styles.categories}>
        {profileCategories.map((cat) => (
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
          onClick={handleGenerate}
          disabled={count === 0}
        >
          {count > 0 ? 'Generar perfil' : 'Seleccioná al menos una opción'}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={reset}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
