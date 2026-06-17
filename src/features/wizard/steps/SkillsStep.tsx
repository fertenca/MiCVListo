import { forwardRef, useImperativeHandle, useState } from 'react';
import { useCVStore } from '../../cv-model';
import type { CVMode, SkillEntry } from '../../cv-model';
import type { StepRef } from '..';
import { SkillsHelper } from '../../phrase-engine';
import styles from './SkillsStep.module.css';

// ─── Tipos locales ────────────────────────────────────────────────────────────

type FormMode =
  | { type: 'idle' }
  | { type: 'new' }
  | { type: 'edit'; id: string };

interface EntryDraft {
  label: string;
  category: string;
  hasCertificate: boolean;
  certName: string;
  certInstitution: string;
  certYear: string;
  certVerificationUrl: string;
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

const DEFAULT_DRAFT: EntryDraft = {
  label: '',
  category: '',
  hasCertificate: false,
  certName: '',
  certInstitution: '',
  certYear: '',
  certVerificationUrl: '',
};

function draftToEntry(d: EntryDraft): Omit<SkillEntry, 'id'> {
  return {
    label: d.label.trim(),
    category: d.category.trim() || undefined,
    certificate: d.hasCertificate
      ? {
          hasCertificate: true,
          name: d.certName.trim() || undefined,
          institution: d.certInstitution.trim() || undefined,
          year: d.certYear.trim() || undefined,
          verificationUrl: d.certVerificationUrl.trim() || undefined,
        }
      : undefined,
  };
}

function entryToDraft(e: SkillEntry): EntryDraft {
  return {
    label: e.label,
    category: e.category ?? '',
    hasCertificate: e.certificate?.hasCertificate ?? false,
    certName: e.certificate?.name ?? '',
    certInstitution: e.certificate?.institution ?? '',
    certYear: e.certificate?.year ?? '',
    certVerificationUrl: e.certificate?.verificationUrl ?? '',
  };
}

// ─── EntryCard ────────────────────────────────────────────────────────────────

interface CardProps {
  entry: SkillEntry;
  onEdit: () => void;
  onRemove: () => void;
}

function EntryCard({ entry, onEdit, onRemove }: CardProps) {
  const certLabel =
    entry.certificate?.hasCertificate && entry.certificate.name
      ? entry.certificate.name
      : null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <p className={styles.cardLabel}>{entry.label}</p>
          {entry.category && (
            <p className={styles.cardCategory}>{entry.category}</p>
          )}
          {certLabel && (
            <p className={styles.cardCert}>Certificado: {certLabel}</p>
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

      {/* Certificado */}
      <div className={styles.field}>
        <span className={styles.label}>
          ¿Tenés certificado, curso o título relacionado?
        </span>
        <div className={styles.certToggle}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="skill-cert"
              checked={!draft.hasCertificate}
              onChange={() =>
                onChange({
                  hasCertificate: false,
                  certName: '',
                  certInstitution: '',
                  certYear: '',
                  certVerificationUrl: '',
                })
              }
            />
            No
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="skill-cert"
              checked={draft.hasCertificate}
              onChange={() => onChange({ hasCertificate: true })}
            />
            Sí
          </label>
        </div>
      </div>

      {draft.hasCertificate && (
        <div className={styles.certFields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="skill-cert-name">
              Nombre del certificado, curso o título{' '}
              <span className={styles.optional}>(opcional)</span>
            </label>
            <input
              id="skill-cert-name"
              className={styles.input}
              type="text"
              value={draft.certName}
              onChange={(e) => onChange({ certName: e.target.value })}
              placeholder="Ej: Curso de Excel inicial · Capacitación en atención al cliente"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="skill-cert-inst">
                Institución{' '}
                <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                id="skill-cert-inst"
                className={styles.input}
                type="text"
                value={draft.certInstitution}
                onChange={(e) => onChange({ certInstitution: e.target.value })}
                placeholder="Ej: UTN · Coursera · Municipalidad"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="skill-cert-year">
                Año <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                id="skill-cert-year"
                className={styles.input}
                type="text"
                value={draft.certYear}
                onChange={(e) => onChange({ certYear: e.target.value })}
                placeholder="Ej: 2024"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="skill-cert-url">
              Link o código de verificación{' '}
              <span className={styles.optional}>(opcional)</span>
            </label>
            <input
              id="skill-cert-url"
              className={styles.input}
              type="text"
              value={draft.certVerificationUrl}
              onChange={(e) => onChange({ certVerificationUrl: e.target.value })}
              placeholder="Ej: https://... o código del certificado"
            />
          </div>
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
      addSkill(entry);
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

  function handleHelperAdd(skills: Omit<SkillEntry, 'id'>[]) {
    for (const skill of skills) {
      addSkill(skill);
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

      {isEmpty && formMode.type === 'idle' && (
        <p className={styles.softNote}>
          Agregar algunas habilidades ayuda a que quien lea tu CV entienda
          rápido qué sabés hacer.
        </p>
      )}

      {showUnsavedWarning && (
        <p role="alert" className={styles.unsavedWarning}>
          Tenés una habilidad sin guardar. Guardala o cancelala antes de
          continuar.
        </p>
      )}

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

      {formMode.type === 'idle' && (
        <>
          <SkillsHelper
            existingSkills={draft.skills}
            onAdd={handleHelperAdd}
          />
          <button className={styles.addBtn} onClick={startNew} type="button">
            + Agregar habilidad
          </button>
        </>
      )}
    </div>
  );
});

export default SkillsStep;
