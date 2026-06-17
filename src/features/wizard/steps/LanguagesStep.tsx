import { forwardRef, useImperativeHandle, useState } from 'react';
import { useCVStore } from '../../cv-model';
import type { CVMode, LanguageEntry, LanguageLevel } from '../../cv-model';
import type { StepRef } from '..';
import styles from './LanguagesStep.module.css';

// ─── Tipos locales ────────────────────────────────────────────────────────────

type FormMode =
  | { type: 'idle' }
  | { type: 'new' }
  | { type: 'edit'; id: string };

interface EntryDraft {
  language: string;
  level: LanguageLevel;
}

// ─── Textos y etiquetas ───────────────────────────────────────────────────────

const HELP: Record<CVMode, string> = {
  experiencia:
    'Agregá idiomas que puedan sumar a tu perfil. No hace falta que sean perfectos: indicá el nivel aproximado.',
  'primer-empleo':
    'Si sabés algo de otro idioma, aunque sea básico, puede sumar. Si no, podés saltear este paso sin problema.',
  informal:
    'Agregá idiomas que hayas usado o estés aprendiendo. Si no aplica, podés continuar.',
};

const LEVEL_OPTIONS: LanguageLevel[] = [
  'basico',
  'intermedio',
  'avanzado',
  'nativo',
];

const LEVEL_LABELS: Record<LanguageLevel, string> = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  nativo: 'Nativo',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_DRAFT: EntryDraft = { language: '', level: 'intermedio' };

function draftToEntry(d: EntryDraft): Omit<LanguageEntry, 'id'> {
  return { language: d.language.trim(), level: d.level };
}

function entryToDraft(e: LanguageEntry): EntryDraft {
  return { language: e.language, level: e.level };
}

// ─── EntryCard ────────────────────────────────────────────────────────────────

interface CardProps {
  entry: LanguageEntry;
  onEdit: () => void;
  onRemove: () => void;
}

function EntryCard({ entry, onEdit, onRemove }: CardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <p className={styles.cardLanguage}>{entry.language}</p>
          <p className={styles.cardLevel}>{LEVEL_LABELS[entry.level]}</p>
        </div>
        <div className={styles.cardActions}>
          <button className={styles.actionBtn} onClick={onEdit} type="button">
            Editar
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnRemove}`}
            onClick={onRemove}
            type="button"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EntryForm ────────────────────────────────────────────────────────────────

interface FormProps {
  draft: EntryDraft;
  errors: Record<string, string>;
  isNew: boolean;
  onChange: (updates: Partial<EntryDraft>) => void;
  onSave: () => void;
  onCancel: () => void;
}

function EntryForm({
  draft,
  errors,
  isNew,
  onChange,
  onSave,
  onCancel,
}: FormProps) {
  return (
    <div className={styles.entryForm}>
      {/* Idioma */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="lang-language">
          Idioma <span className={styles.required}>*</span>
        </label>
        <input
          id="lang-language"
          className={`${styles.input}${errors.language ? ' ' + styles.inputError : ''}`}
          type="text"
          value={draft.language}
          onChange={(e) => onChange({ language: e.target.value })}
          placeholder="Ej: Inglés · Portugués · Italiano"
          autoFocus
        />
        {errors.language && (
          <span role="alert" className={styles.errorMsg}>
            {errors.language}
          </span>
        )}
      </div>

      {/* Nivel */}
      <div className={styles.field}>
        <span className={styles.label}>Nivel</span>
        <div className={styles.levelToggle}>
          {LEVEL_OPTIONS.map((lvl) => (
            <label key={lvl} className={styles.radioLabel}>
              <input
                type="radio"
                name="lang-level"
                checked={draft.level === lvl}
                onChange={() => onChange({ level: lvl })}
              />
              {LEVEL_LABELS[lvl]}
            </label>
          ))}
        </div>
      </div>

      {/* Acciones */}
      <div className={styles.formActions}>
        <button className={styles.btnPrimary} onClick={onSave} type="button">
          {isNew ? 'Agregar' : 'Guardar cambios'}
        </button>
        <button className={styles.btnGhost} onClick={onCancel} type="button">
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── LanguagesStep ────────────────────────────────────────────────────────────

const LanguagesStep = forwardRef<StepRef>(function LanguagesStep(_, ref) {
  const draft = useCVStore((s) => s.draft)!;
  const addLanguage = useCVStore((s) => s.addLanguage);
  const updateLanguage = useCVStore((s) => s.updateLanguage);
  const removeLanguage = useCVStore((s) => s.removeLanguage);

  const [formMode, setFormMode] = useState<FormMode>({ type: 'idle' });
  const [entryDraft, setEntryDraft] = useState<EntryDraft>(DEFAULT_DRAFT);
  const [entryErrors, setEntryErrors] = useState<Record<string, string>>({});
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  useImperativeHandle(ref, () => ({
    validate() {
      if (formMode.type !== 'idle') {
        setShowUnsavedWarning(true);
        return false;
      }
      return true;
    },
  }));

  function startNew() {
    setEntryDraft(DEFAULT_DRAFT);
    setEntryErrors({});
    setShowUnsavedWarning(false);
    setFormMode({ type: 'new' });
  }

  function startEdit(entry: LanguageEntry) {
    setEntryDraft(entryToDraft(entry));
    setEntryErrors({});
    setShowUnsavedWarning(false);
    setFormMode({ type: 'edit', id: entry.id });
  }

  function handleSave() {
    if (!entryDraft.language.trim()) {
      setEntryErrors({ language: 'Escribí el nombre del idioma' });
      return;
    }
    const entry = draftToEntry(entryDraft);
    if (formMode.type === 'new') {
      addLanguage(entry);
    } else if (formMode.type === 'edit') {
      updateLanguage(formMode.id, entry);
    }
    setFormMode({ type: 'idle' });
    setEntryErrors({});
  }

  function handleCancel() {
    setFormMode({ type: 'idle' });
    setEntryErrors({});
    setShowUnsavedWarning(false);
  }

  function handleRemove(id: string) {
    removeLanguage(id);
    if (formMode.type === 'edit' && formMode.id === id) {
      setFormMode({ type: 'idle' });
    }
  }

  function handleChange(updates: Partial<EntryDraft>) {
    setEntryDraft((prev) => ({ ...prev, ...updates }));
    if (updates.language !== undefined && entryErrors.language) {
      setEntryErrors((prev) => {
        const next = { ...prev };
        delete next.language;
        return next;
      });
    }
  }

  const isEmpty = draft.languages.length === 0;

  return (
    <div className={styles.step}>
      <p className={styles.help}>{HELP[draft.mode]}</p>

      {/* Nota suave cuando está vacío */}
      {isEmpty && formMode.type === 'idle' && (
        <p className={styles.softNote}>
          Si no cargás idiomas podés seguir igual. No es obligatorio.
        </p>
      )}

      {/* Advertencia de formulario sin guardar */}
      {showUnsavedWarning && (
        <p role="alert" className={styles.unsavedWarning}>
          Tenés un idioma sin guardar. Guardalo o cancelalo antes de continuar.
        </p>
      )}

      {/* Lista de entradas existentes */}
      {!isEmpty && (
        <ul className={styles.entryList}>
          {draft.languages.map((entry) => (
            <li key={entry.id}>
              {formMode.type === 'edit' && formMode.id === entry.id ? (
                <EntryForm
                  draft={entryDraft}
                  errors={entryErrors}
                  isNew={false}
                  onChange={handleChange}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              ) : (
                <EntryCard
                  entry={entry}
                  onEdit={() => startEdit(entry)}
                  onRemove={() => handleRemove(entry.id)}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Formulario nueva entrada */}
      {formMode.type === 'new' && (
        <EntryForm
          draft={entryDraft}
          errors={entryErrors}
          isNew={true}
          onChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Botón agregar */}
      {formMode.type === 'idle' && (
        <button className={styles.addBtn} onClick={startNew} type="button">
          + Agregar idioma
        </button>
      )}
    </div>
  );
});

export default LanguagesStep;
