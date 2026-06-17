import { forwardRef, useImperativeHandle, useState } from 'react';
import { useCVStore } from '../../cv-model';
import type { CVMode, SkillEntry } from '../../cv-model';
import type { StepRef } from '..';
import styles from './SkillsStep.module.css';

// ─── Tipos locales ────────────────────────────────────────────────────────────

type FormMode =
  | { type: 'idle' }
  | { type: 'new' }
  | { type: 'edit'; id: string };

interface EntryDraft {
  label: string;
  category: string;
}

// ─── Textos y etiquetas ───────────────────────────────────────────────────────

const HELP: Record<CVMode, string> = {
  experiencia:
    'Agregá habilidades que usaste en tus trabajos o que pueden servir para el puesto que buscás.',
  'primer-empleo':
    'Aunque no hayas trabajado todavía, seguro tenés habilidades que suman: responsabilidad, puntualidad, trato con personas, uso de computadora o ganas de aprender.',
  informal:
    'Agregá habilidades que aprendiste haciendo changas, ayudando en comercios, cuidando personas, vendiendo o resolviendo tareas del día a día.',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_DRAFT: EntryDraft = { label: '', category: '' };

function draftToEntry(d: EntryDraft): Omit<SkillEntry, 'id'> {
  return {
    label: d.label.trim(),
    category: d.category.trim() || undefined,
  };
}

function entryToDraft(e: SkillEntry): EntryDraft {
  return {
    label: e.label,
    category: e.category ?? '',
  };
}

// ─── EntryCard ────────────────────────────────────────────────────────────────

interface CardProps {
  entry: SkillEntry;
  onEdit: () => void;
  onRemove: () => void;
}

function EntryCard({ entry, onEdit, onRemove }: CardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <p className={styles.cardLabel}>{entry.label}</p>
          {entry.category && (
            <p className={styles.cardCategory}>{entry.category}</p>
          )}
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
      {/* Habilidad */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="skill-label">
          Habilidad <span className={styles.required}>*</span>
        </label>
        <input
          id="skill-label"
          className={`${styles.input}${errors.label ? ' ' + styles.inputError : ''}`}
          type="text"
          value={draft.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Ej: Atención al cliente · Manejo de caja · Trabajo en equipo"
          autoFocus
        />
        {errors.label && (
          <span role="alert" className={styles.errorMsg}>
            {errors.label}
          </span>
        )}
      </div>

      {/* Categoría */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="skill-category">
          Categoría <span className={styles.optional}>(opcional)</span>
        </label>
        <input
          id="skill-category"
          className={styles.input}
          type="text"
          value={draft.category}
          onChange={(e) => onChange({ category: e.target.value })}
          placeholder="Ej: Informática · Atención al cliente · Personal"
        />
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

// ─── SkillsStep ───────────────────────────────────────────────────────────────

const SkillsStep = forwardRef<StepRef>(function SkillsStep(_, ref) {
  const draft = useCVStore((s) => s.draft)!;
  const addSkill = useCVStore((s) => s.addSkill);
  const updateSkill = useCVStore((s) => s.updateSkill);
  const removeSkill = useCVStore((s) => s.removeSkill);

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

  function startEdit(entry: SkillEntry) {
    setEntryDraft(entryToDraft(entry));
    setEntryErrors({});
    setShowUnsavedWarning(false);
    setFormMode({ type: 'edit', id: entry.id });
  }

  function handleSave() {
    if (!entryDraft.label.trim()) {
      setEntryErrors({ label: 'Escribí el nombre de la habilidad' });
      return;
    }
    const entry = draftToEntry(entryDraft);
    if (formMode.type === 'new') {
      addSkill(entry.label, entry.category);
    } else if (formMode.type === 'edit') {
      updateSkill(formMode.id, entry);
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
    removeSkill(id);
    if (formMode.type === 'edit' && formMode.id === id) {
      setFormMode({ type: 'idle' });
    }
  }

  function handleChange(updates: Partial<EntryDraft>) {
    setEntryDraft((prev) => ({ ...prev, ...updates }));
    if (updates.label !== undefined && entryErrors.label) {
      setEntryErrors((prev) => {
        const next = { ...prev };
        delete next.label;
        return next;
      });
    }
  }

  const isEmpty = draft.skills.length === 0;

  return (
    <div className={styles.step}>
      <p className={styles.help}>{HELP[draft.mode]}</p>

      {/* Nota suave cuando está vacío */}
      {isEmpty && formMode.type === 'idle' && (
        <p className={styles.softNote}>
          Agregar algunas habilidades ayuda a que quien lea tu CV entienda
          rápido qué sabés hacer.
        </p>
      )}

      {/* Advertencia de formulario sin guardar */}
      {showUnsavedWarning && (
        <p role="alert" className={styles.unsavedWarning}>
          Tenés una habilidad sin guardar. Guardala o cancelala antes de
          continuar.
        </p>
      )}

      {/* Lista de entradas existentes */}
      {!isEmpty && (
        <ul className={styles.entryList}>
          {draft.skills.map((entry) => (
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
          + Agregar habilidad
        </button>
      )}
    </div>
  );
});

export default SkillsStep;
