import { forwardRef, useImperativeHandle, useState } from 'react';
import { useCVStore } from '../../cv-model';
import type { CVMode, CourseEntry } from '../../cv-model';
import type { StepRef } from '..';
import styles from './CoursesStep.module.css';

// ─── Tipos locales ────────────────────────────────────────────────────────────

type FormMode =
  | { type: 'idle' }
  | { type: 'new' }
  | { type: 'edit'; id: string };

interface EntryDraft {
  name: string;
  institution: string;
  year: string;
}

// ─── Textos y etiquetas ───────────────────────────────────────────────────────

const HELP: Record<CVMode, string> = {
  experiencia:
    'Agregá cursos o capacitaciones que sumen a tu perfil. Pueden ser del trabajo, online, presenciales o gratuitos.',
  'primer-empleo':
    'Si estás buscando tu primer trabajo, los cursos ayudan a mostrar interés, compromiso y ganas de aprender.',
  informal:
    'Podés agregar cursos, talleres o capacitaciones aunque no tengan certificado. Si te ayudaron a aprender algo útil, pueden sumar.',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_DRAFT: EntryDraft = {
  name: '',
  institution: '',
  year: '',
};

function draftToEntry(d: EntryDraft): Omit<CourseEntry, 'id'> {
  return {
    name: d.name.trim(),
    institution: d.institution.trim() || undefined,
    year: d.year.trim() || undefined,
  };
}

function entryToDraft(e: CourseEntry): EntryDraft {
  return {
    name: e.name,
    institution: e.institution ?? '',
    year: e.year ?? '',
  };
}

// ─── EntryCard ────────────────────────────────────────────────────────────────

interface CardProps {
  entry: CourseEntry;
  onEdit: () => void;
  onRemove: () => void;
}

function EntryCard({ entry, onEdit, onRemove }: CardProps) {
  const meta = [entry.institution, entry.year].filter(Boolean).join(' · ');

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <p className={styles.cardName}>{entry.name}</p>
          {meta && <p className={styles.cardMeta}>{meta}</p>}
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
      {/* Nombre */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="course-name">
          Nombre del curso o capacitación{' '}
          <span className={styles.required}>*</span>
        </label>
        <input
          id="course-name"
          className={`${styles.input}${errors.name ? ' ' + styles.inputError : ''}`}
          type="text"
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Ej: Excel avanzado · Primeros auxilios · Taller de costura"
          autoFocus
        />
        {errors.name && (
          <span role="alert" className={styles.errorMsg}>
            {errors.name}
          </span>
        )}
      </div>

      {/* Institución + Año */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="course-institution">
            Institución o plataforma{' '}
            <span className={styles.optional}>(opcional)</span>
          </label>
          <input
            id="course-institution"
            className={styles.input}
            type="text"
            value={draft.institution}
            onChange={(e) => onChange({ institution: e.target.value })}
            placeholder="Ej: Coursera · Centro de salud · Municipalidad"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="course-year">
            Año <span className={styles.optional}>(opcional)</span>
          </label>
          <input
            id="course-year"
            className={styles.input}
            type="text"
            value={draft.year}
            onChange={(e) => onChange({ year: e.target.value })}
            placeholder="Ej: 2024"
          />
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

// ─── CoursesStep ──────────────────────────────────────────────────────────────

const CoursesStep = forwardRef<StepRef>(function CoursesStep(_, ref) {
  const draft = useCVStore((s) => s.draft)!;
  const addCourse = useCVStore((s) => s.addCourse);
  const updateCourse = useCVStore((s) => s.updateCourse);
  const removeCourse = useCVStore((s) => s.removeCourse);

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

  function startEdit(entry: CourseEntry) {
    setEntryDraft(entryToDraft(entry));
    setEntryErrors({});
    setShowUnsavedWarning(false);
    setFormMode({ type: 'edit', id: entry.id });
  }

  function handleSave() {
    if (!entryDraft.name.trim()) {
      setEntryErrors({ name: 'Escribí el nombre del curso o capacitación' });
      return;
    }
    const entry = draftToEntry(entryDraft);
    if (formMode.type === 'new') {
      addCourse(entry);
    } else if (formMode.type === 'edit') {
      updateCourse(formMode.id, entry);
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
    removeCourse(id);
    if (formMode.type === 'edit' && formMode.id === id) {
      setFormMode({ type: 'idle' });
    }
  }

  function handleChange(updates: Partial<EntryDraft>) {
    setEntryDraft((prev) => ({ ...prev, ...updates }));
    if (updates.name !== undefined && entryErrors.name) {
      setEntryErrors((prev) => {
        const next = { ...prev };
        delete next.name;
        return next;
      });
    }
  }

  const isEmpty = draft.courses.length === 0;

  return (
    <div className={styles.step}>
      <p className={styles.help}>{HELP[draft.mode]}</p>

      {/* Nota suave cuando está vacío */}
      {isEmpty && formMode.type === 'idle' && (
        <p className={styles.softNote}>
          Si no tenés cursos cargados no pasa nada, podés continuar igual.
        </p>
      )}

      {/* Advertencia de formulario sin guardar */}
      {showUnsavedWarning && (
        <p role="alert" className={styles.unsavedWarning}>
          Tenés un curso sin guardar. Guardalo o cancelalo antes de continuar.
        </p>
      )}

      {/* Lista de entradas existentes */}
      {!isEmpty && (
        <ul className={styles.entryList}>
          {draft.courses.map((entry) => (
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
          + Agregar curso
        </button>
      )}
    </div>
  );
});

export default CoursesStep;
