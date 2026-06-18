import { forwardRef, useImperativeHandle, useState } from 'react';
import { useCVStore } from '../../cv-model';
import type { CVMode, EducationEntry, EducationStatus } from '../../cv-model';
import type { StepRef } from '..';
import { isLikelyValidYear } from '../softValidation';
import { useValidationHints } from '../../analytics';
import styles from './EducationStep.module.css';

// ─── Tipos locales ────────────────────────────────────────────────────────────

type FormMode =
  | { type: 'idle' }
  | { type: 'new' }
  | { type: 'edit'; id: string };

interface EntryDraft {
  title: string;
  institution: string;
  status: EducationStatus;
  year: string;
}

// ─── Textos y etiquetas ───────────────────────────────────────────────────────

const HELP: Record<CVMode, string> = {
  experiencia:
    'Agregá tus estudios principales. Puede ser secundario, terciario, universidad o cursos importantes.',
  'primer-empleo':
    'Si estás buscando tu primer trabajo, tus estudios ayudan mucho a presentar tu perfil. Podés cargar secundario, cursos o estudios en curso.',
  informal:
    'Agregá tus estudios aunque no estén relacionados directamente con tus trabajos. Todo suma para mostrar tu formación.',
};

const STATUS_LABELS: Record<EducationStatus, string> = {
  completo: 'Completo',
  'en-curso': 'En curso',
  incompleto: 'Incompleto',
};

const STATUS_OPTIONS: EducationStatus[] = [
  'completo',
  'en-curso',
  'incompleto',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_DRAFT: EntryDraft = {
  title: '',
  institution: '',
  status: 'completo',
  year: '',
};

function draftToEntry(d: EntryDraft): Omit<EducationEntry, 'id'> {
  return {
    title: d.title.trim(),
    institution: d.institution.trim() || undefined,
    status: d.status,
    year: d.year.trim() || undefined,
  };
}

function entryToDraft(e: EducationEntry): EntryDraft {
  return {
    title: e.title,
    institution: e.institution ?? '',
    status: e.status,
    year: e.year ?? '',
  };
}

// ─── EntryCard ────────────────────────────────────────────────────────────────

interface CardProps {
  entry: EducationEntry;
  onEdit: () => void;
  onRemove: () => void;
}

function EntryCard({ entry, onEdit, onRemove }: CardProps) {
  const statusMeta = STATUS_LABELS[entry.status];
  const meta = [statusMeta, entry.year].filter(Boolean).join(' · ');

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <p className={styles.cardTitle}>{entry.title}</p>
          {entry.institution && (
            <p className={styles.cardInstitution}>{entry.institution}</p>
          )}
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
  useValidationHints(
    'educacion',
    isLikelyValidYear(draft.year) ? [] : ['invalid_year'],
  );
  return (
    <div className={styles.entryForm}>
      {/* Título */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="edu-title">
          Título, nivel o estudio <span className={styles.required}>*</span>
        </label>
        <input
          id="edu-title"
          className={`${styles.input}${errors.title ? ' ' + styles.inputError : ''}`}
          type="text"
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Ej: Secundario · Bachiller en Economía · Tecnicatura en Informática"
          autoFocus
        />
        {errors.title && (
          <span role="alert" className={styles.errorMsg}>
            {errors.title}
          </span>
        )}
      </div>

      {/* Institución + Año */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="edu-institution">
            Institución <span className={styles.optional}>(opcional)</span>
          </label>
          <input
            id="edu-institution"
            className={styles.input}
            type="text"
            value={draft.institution}
            onChange={(e) => onChange({ institution: e.target.value })}
            placeholder="Ej: Escuela Técnica N° 3 · ISFT N° 182"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="edu-year">
            Año <span className={styles.optional}>(opcional)</span>
          </label>
          <input
            id="edu-year"
            className={styles.input}
            type="text"
            value={draft.year}
            onChange={(e) => onChange({ year: e.target.value })}
            placeholder="Ej: 2023"
          />
          {!isLikelyValidYear(draft.year) && (
            <span className={styles.softNote}>
              Revisá el año. Parece que hay algo escrito por error.
            </span>
          )}
        </div>
      </div>

      {/* Estado */}
      <div className={styles.field}>
        <span className={styles.label}>Estado</span>
        <div className={styles.statusToggle}>
          {STATUS_OPTIONS.map((s) => (
            <label key={s} className={styles.radioLabel}>
              <input
                type="radio"
                name="edu-status"
                checked={draft.status === s}
                onChange={() => onChange({ status: s })}
              />
              {STATUS_LABELS[s]}
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

// ─── EducationStep ────────────────────────────────────────────────────────────

const EducationStep = forwardRef<StepRef>(function EducationStep(_, ref) {
  const draft = useCVStore((s) => s.draft)!;
  const addEducation = useCVStore((s) => s.addEducation);
  const updateEducation = useCVStore((s) => s.updateEducation);
  const removeEducation = useCVStore((s) => s.removeEducation);

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

  function startEdit(entry: EducationEntry) {
    setEntryDraft(entryToDraft(entry));
    setEntryErrors({});
    setShowUnsavedWarning(false);
    setFormMode({ type: 'edit', id: entry.id });
  }

  function handleSave() {
    if (!entryDraft.title.trim()) {
      setEntryErrors({ title: 'Indicá tu nivel de estudios o carrera' });
      return;
    }
    const entry = draftToEntry(entryDraft);
    if (formMode.type === 'new') {
      addEducation(entry);
    } else if (formMode.type === 'edit') {
      updateEducation(formMode.id, entry);
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
    removeEducation(id);
    if (formMode.type === 'edit' && formMode.id === id) {
      setFormMode({ type: 'idle' });
    }
  }

  function handleChange(updates: Partial<EntryDraft>) {
    setEntryDraft((prev) => ({ ...prev, ...updates }));
    if (updates.title !== undefined && entryErrors.title) {
      setEntryErrors((prev) => {
        const next = { ...prev };
        delete next.title;
        return next;
      });
    }
  }

  const isEmpty = draft.education.length === 0;

  return (
    <div className={styles.step}>
      <p className={styles.help}>{HELP[draft.mode]}</p>

      {/* Recomendación suave cuando no hay entradas */}
      {isEmpty && formMode.type === 'idle' && (
        <p className={styles.softNote}>
          Agregar al menos tus estudios más recientes ayuda a que tu CV sea más
          completo.
        </p>
      )}

      {/* Advertencia de formulario sin guardar */}
      {showUnsavedWarning && (
        <p role="alert" className={styles.unsavedWarning}>
          Tenés una educación sin guardar. Guardala o cancelala antes de
          continuar.
        </p>
      )}

      {/* Lista de entradas existentes */}
      {!isEmpty && (
        <ul className={styles.entryList}>
          {draft.education.map((entry) => (
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
          + Agregar educación
        </button>
      )}
    </div>
  );
});

export default EducationStep;
