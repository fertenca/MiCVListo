import { forwardRef, useImperativeHandle, useState } from 'react';
import { useCVStore } from '../../cv-model';
import type { CVMode, ExperienceEntry, ReferenceEntry } from '../../cv-model';
import type { StepRef } from '..';
import styles from './ReferencesStep.module.css';

// ─── Tipos locales ────────────────────────────────────────────────────────────

type FormMode =
  | { type: 'idle' }
  | { type: 'new' }
  | { type: 'edit'; id: string };

interface EntryDraft {
  name: string;
  relation: string;
  phone: string;
  relatedExperienceId: string;
}

// ─── Textos y etiquetas ───────────────────────────────────────────────────────

const HELP: Record<CVMode, string> = {
  experiencia:
    'Si tenés personas que puedan dar una referencia sobre tu trabajo, podés agregarlas. Si no, podés saltear este paso.',
  'primer-empleo':
    'No pasa nada si todavía no tenés referencias laborales. Si querés, podés agregar un profesor, referente o persona que pueda hablar bien de tu responsabilidad.',
  informal:
    'Podés agregar personas para quienes trabajaste, clientes, encargados o alguien que pueda confirmar tus tareas. Si no tenés, seguí sin problema.',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_DRAFT: EntryDraft = {
  name: '',
  relation: '',
  phone: '',
  relatedExperienceId: '',
};

function draftToEntry(d: EntryDraft): Omit<ReferenceEntry, 'id'> {
  return {
    name: d.name.trim(),
    relation: d.relation.trim() || undefined,
    phone: d.phone.trim() || undefined,
    relatedExperienceId: d.relatedExperienceId || undefined,
  };
}

function entryToDraft(e: ReferenceEntry): EntryDraft {
  return {
    name: e.name,
    relation: e.relation ?? '',
    phone: e.phone ?? '',
    relatedExperienceId: e.relatedExperienceId ?? '',
  };
}

function expLabel(e: ExperienceEntry): string {
  return e.org ? `${e.role} — ${e.org}` : e.role;
}

// ─── EntryCard ────────────────────────────────────────────────────────────────

interface CardProps {
  entry: ReferenceEntry;
  experiences: ExperienceEntry[];
  onEdit: () => void;
  onRemove: () => void;
}

function EntryCard({ entry, experiences, onEdit, onRemove }: CardProps) {
  const meta = [entry.relation, entry.phone].filter(Boolean).join(' · ');
  const linkedExp = entry.relatedExperienceId
    ? experiences.find((e) => e.id === entry.relatedExperienceId)
    : null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <p className={styles.cardName}>{entry.name}</p>
          {meta && <p className={styles.cardMeta}>{meta}</p>}
          {linkedExp && (
            <p className={styles.cardLinked}>
              Referencia de: {expLabel(linkedExp)}
            </p>
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
  experiences: ExperienceEntry[];
  onChange: (updates: Partial<EntryDraft>) => void;
  onSave: () => void;
  onCancel: () => void;
}

function EntryForm({
  draft,
  errors,
  isNew,
  experiences,
  onChange,
  onSave,
  onCancel,
}: FormProps) {
  return (
    <div className={styles.entryForm}>
      {/* Nombre */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="ref-name">
          Nombre <span className={styles.required}>*</span>
        </label>
        <input
          id="ref-name"
          className={`${styles.input}${errors.name ? ' ' + styles.inputError : ''}`}
          type="text"
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Ej: María González · Juan Pérez"
          autoFocus
        />
        {errors.name && (
          <span role="alert" className={styles.errorMsg}>
            {errors.name}
          </span>
        )}
      </div>

      {/* Relación + Teléfono */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ref-relation">
            Relación <span className={styles.optional}>(opcional)</span>
          </label>
          <input
            id="ref-relation"
            className={styles.input}
            type="text"
            value={draft.relation}
            onChange={(e) => onChange({ relation: e.target.value })}
            placeholder="Ej: Ex jefa · Encargado · Clienta"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="ref-phone">
            Teléfono <span className={styles.optional}>(opcional)</span>
          </label>
          <input
            id="ref-phone"
            className={styles.input}
            type="tel"
            value={draft.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="Ej: 11 5555-1234"
          />
        </div>
      </div>

      {/* Experiencia vinculada (solo si hay experiencias cargadas) */}
      {experiences.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ref-exp">
            ¿De qué trabajo es esta referencia?{' '}
            <span className={styles.optional}>(opcional)</span>
          </label>
          <select
            id="ref-exp"
            className={styles.select}
            value={draft.relatedExperienceId}
            onChange={(e) => onChange({ relatedExperienceId: e.target.value })}
          >
            <option value="">Ninguno en particular</option>
            {experiences.map((e) => (
              <option key={e.id} value={e.id}>
                {expLabel(e)}
              </option>
            ))}
          </select>
        </div>
      )}

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

// ─── ReferencesStep ───────────────────────────────────────────────────────────

const ReferencesStep = forwardRef<StepRef>(function ReferencesStep(_, ref) {
  const draft = useCVStore((s) => s.draft)!;
  const addReference = useCVStore((s) => s.addReference);
  const updateReference = useCVStore((s) => s.updateReference);
  const removeReference = useCVStore((s) => s.removeReference);

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

  function startEdit(entry: ReferenceEntry) {
    setEntryDraft(entryToDraft(entry));
    setEntryErrors({});
    setShowUnsavedWarning(false);
    setFormMode({ type: 'edit', id: entry.id });
  }

  function handleSave() {
    if (!entryDraft.name.trim()) {
      setEntryErrors({ name: 'Escribí el nombre de la referencia' });
      return;
    }
    const entry = draftToEntry(entryDraft);
    if (formMode.type === 'new') {
      addReference(entry);
    } else if (formMode.type === 'edit') {
      updateReference(formMode.id, entry);
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
    removeReference(id);
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

  const isEmpty = draft.references.length === 0;

  return (
    <div className={styles.step}>
      <p className={styles.help}>{HELP[draft.mode]}</p>

      {isEmpty && formMode.type === 'idle' && (
        <p className={styles.softNote}>
          Si no cargás referencias podés seguir igual. No es obligatorio.
        </p>
      )}

      {showUnsavedWarning && (
        <p role="alert" className={styles.unsavedWarning}>
          Tenés una referencia sin guardar. Guardala o cancelala antes de
          continuar.
        </p>
      )}

      {!isEmpty && (
        <ul className={styles.entryList}>
          {draft.references.map((entry) => (
            <li key={entry.id}>
              {formMode.type === 'edit' && formMode.id === entry.id ? (
                <EntryForm
                  draft={entryDraft}
                  errors={entryErrors}
                  isNew={false}
                  experiences={draft.experience}
                  onChange={handleChange}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              ) : (
                <EntryCard
                  entry={entry}
                  experiences={draft.experience}
                  onEdit={() => startEdit(entry)}
                  onRemove={() => handleRemove(entry.id)}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {formMode.type === 'new' && (
        <EntryForm
          draft={entryDraft}
          errors={entryErrors}
          isNew={true}
          experiences={draft.experience}
          onChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {formMode.type === 'idle' && (
        <button className={styles.addBtn} onClick={startNew} type="button">
          + Agregar referencia
        </button>
      )}

      <p className={styles.privacyNote}>
        Agregá referencias solo si tenés permiso para compartir sus datos. Todo
        queda guardado localmente en tu dispositivo.
      </p>
    </div>
  );
});

export default ReferencesStep;
