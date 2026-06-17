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
  hasCertificate: boolean;
  certName: string;
  certInstitution: string;
  certYear: string;
  certVerificationUrl: string;
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
  hasCertificate: false,
  certName: '',
  certInstitution: '',
  certYear: '',
  certVerificationUrl: '',
};

function draftToEntry(d: EntryDraft): Omit<CourseEntry, 'id'> {
  return {
    name: d.name.trim(),
    institution: d.institution.trim() || undefined,
    year: d.year.trim() || undefined,
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

function entryToDraft(e: CourseEntry): EntryDraft {
  return {
    name: e.name,
    institution: e.institution ?? '',
    year: e.year ?? '',
    hasCertificate: e.certificate?.hasCertificate ?? false,
    certName: e.certificate?.name ?? '',
    certInstitution: e.certificate?.institution ?? '',
    certYear: e.certificate?.year ?? '',
    certVerificationUrl: e.certificate?.verificationUrl ?? '',
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
  const certLabel =
    entry.certificate?.hasCertificate && entry.certificate.name
      ? entry.certificate.name
      : null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <p className={styles.cardName}>{entry.name}</p>
          {meta && <p className={styles.cardMeta}>{meta}</p>}
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

      {/* Certificado */}
      <div className={styles.field}>
        <span className={styles.label}>
          ¿Tenés certificado o comprobante de este curso?
        </span>
        <div className={styles.certToggle}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="course-cert"
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
              name="course-cert"
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
            <label className={styles.label} htmlFor="course-cert-name">
              Nombre del certificado o comprobante{' '}
              <span className={styles.optional}>(opcional)</span>
            </label>
            <input
              id="course-cert-name"
              className={styles.input}
              type="text"
              value={draft.certName}
              onChange={(e) => onChange({ certName: e.target.value })}
              placeholder="Ej: Certificado de aprobación · Constancia de asistencia"
            />
          </div>

          <div className={styles.certRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="course-cert-inst">
                Institución emisora{' '}
                <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                id="course-cert-inst"
                className={styles.input}
                type="text"
                value={draft.certInstitution}
                onChange={(e) => onChange({ certInstitution: e.target.value })}
                placeholder="Ej: UTN · Coursera · Municipalidad"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="course-cert-year">
                Año <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                id="course-cert-year"
                className={styles.input}
                type="text"
                value={draft.certYear}
                onChange={(e) => onChange({ certYear: e.target.value })}
                placeholder="Ej: 2024"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="course-cert-url">
              Link o código de verificación{' '}
              <span className={styles.optional}>(opcional)</span>
            </label>
            <input
              id="course-cert-url"
              className={styles.input}
              type="text"
              value={draft.certVerificationUrl}
              onChange={(e) =>
                onChange({ certVerificationUrl: e.target.value })
              }
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
      <p className={styles.softNote}>
        Si querés indicar idiomas, más adelante vas a tener una sección específica para cargarlos con tu nivel.
      </p>

      {isEmpty && formMode.type === 'idle' && (
        <p className={styles.softNote}>
          Si no tenés cursos cargados no pasa nada, podés continuar igual.
        </p>
      )}

      {showUnsavedWarning && (
        <p role="alert" className={styles.unsavedWarning}>
          Tenés un curso sin guardar. Guardalo o cancelalo antes de continuar.
        </p>
      )}

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
        <button className={styles.addBtn} onClick={startNew} type="button">
          + Agregar curso
        </button>
      )}
    </div>
  );
});

export default CoursesStep;
