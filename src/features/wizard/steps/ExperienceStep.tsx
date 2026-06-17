import { forwardRef, useImperativeHandle, useState } from 'react';
import { useCVStore } from '../../cv-model';
import type { CVMode, ExperienceEntry } from '../../cv-model';
import type { StepRef } from '..';
import { NoIdeaHelper } from '../../phrase-engine';
import { validateExperienceDates } from '../softValidation';
import styles from './ExperienceStep.module.css';

const BULLETS_LONG_THRESHOLD = 7;

// ─── Tipos locales ────────────────────────────────────────────────────────────

type FormMode =
  | { type: 'idle' }
  | { type: 'new' }
  | { type: 'edit'; id: string };

type RefAction = 'keep' | 'edit' | 'unlink';

interface EntryDraft {
  role: string;
  org: string;
  isInformal: boolean;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
  bulletsText: string;
}

interface RefDraft {
  addRef: boolean;
  name: string;
  relation: string;
  phone: string;
}

const DEFAULT_REF_DRAFT: RefDraft = {
  addRef: false,
  name: '',
  relation: '',
  phone: '',
};

// ─── Textos por modo ──────────────────────────────────────────────────────────

const HELP: Record<CVMode, string> = {
  experiencia:
    'Agregá trabajos anteriores o actuales. No hace falta que sea perfecto: después podés corregirlo.',
  'primer-empleo':
    'Si todavía no tuviste trabajo, podés saltear este paso. Si ayudaste en un negocio familiar, hiciste changas o tareas para alguien, también podés cargarlo.',
  informal:
    'Acá podés cargar changas, trabajos sin registrar, ayuda en comercios, cuidado de personas, reparto, ventas u otras tareas que hayas hecho.',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultDraft(mode: CVMode): EntryDraft {
  return {
    role: '',
    org: '',
    isInformal: mode === 'informal',
    startDate: '',
    endDate: '',
    isCurrentJob: false,
    bulletsText: '',
  };
}

function draftToEntry(d: EntryDraft): Omit<ExperienceEntry, 'id'> {
  return {
    role: d.role.trim(),
    org: d.org.trim() || undefined,
    isInformal: d.isInformal,
    startDate: d.startDate.trim() || undefined,
    endDate: d.isCurrentJob ? 'Actualidad' : d.endDate.trim() || undefined,
    bullets: d.bulletsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

function entryToDraft(e: ExperienceEntry): EntryDraft {
  return {
    role: e.role,
    org: e.org ?? '',
    isInformal: e.isInformal,
    startDate: e.startDate ?? '',
    endDate: e.endDate === 'Actualidad' ? '' : (e.endDate ?? ''),
    isCurrentJob: e.endDate === 'Actualidad',
    bulletsText: e.bullets.join('\n'),
  };
}

// ─── EntryCard ────────────────────────────────────────────────────────────────

interface CardProps {
  entry: ExperienceEntry;
  onEdit: () => void;
  onRemove: () => void;
}

function EntryCard({ entry, onEdit, onRemove }: CardProps) {
  const dateRange = [entry.startDate, entry.endDate]
    .filter(Boolean)
    .join(' – ');
  const typeLabel = entry.isInformal ? 'Informal' : 'Formal';
  const meta = [dateRange, typeLabel].filter(Boolean).join(' · ');

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <p className={styles.cardRole}>{entry.role}</p>
          {entry.org && <p className={styles.cardOrg}>{entry.org}</p>}
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
      {entry.bullets.length > 0 && (
        <ul className={styles.cardBullets}>
          {entry.bullets.slice(0, 3).map((b, i) => (
            <li key={i}>{b}</li>
          ))}
          {entry.bullets.length > 3 && (
            <li className={styles.cardBulletsMore}>
              +{entry.bullets.length - 3} más…
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

// ─── RefSection ───────────────────────────────────────────────────────────────

interface RefSectionProps {
  existingRefName: string | null;
  refAction: RefAction;
  onRefAction: (a: RefAction) => void;
  refDraft: RefDraft;
  onRefChange: (updates: Partial<RefDraft>) => void;
}

function RefSection({
  existingRefName,
  refAction,
  onRefAction,
  refDraft,
  onRefChange,
}: RefSectionProps) {
  const showFields =
    existingRefName !== null ? refAction === 'edit' : refDraft.addRef;

  return (
    <div className={styles.refSection}>
      {existingRefName !== null ? (
        // Edición con referencia existente → tres opciones
        <>
          <p className={styles.refExistingInfo}>
            Esta experiencia tiene una referencia vinculada:{' '}
            <strong>{existingRefName}</strong>
          </p>
          <div className={styles.refActionGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="exp-ref-action"
                checked={refAction === 'keep'}
                onChange={() => onRefAction('keep')}
              />
              Dejar referencia como está
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="exp-ref-action"
                checked={refAction === 'edit'}
                onChange={() => onRefAction('edit')}
              />
              Editar referencia
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="exp-ref-action"
                checked={refAction === 'unlink'}
                onChange={() => onRefAction('unlink')}
              />
              Desvincular referencia
            </label>
          </div>
          {refAction === 'unlink' && (
            <p className={styles.unlinkNote}>
              La referencia no se borra, solo deja de estar vinculada a esta
              experiencia.
            </p>
          )}
        </>
      ) : (
        // Nueva experiencia o edición sin referencia existente → No / Sí
        <div className={styles.field}>
          <span className={styles.label}>
            ¿Querés agregar una referencia relacionada con esta experiencia?{' '}
            <span className={styles.optional}>(opcional)</span>
          </span>
          <div className={styles.typeToggle}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="exp-ref"
                checked={!refDraft.addRef}
                onChange={() =>
                  onRefChange({
                    addRef: false,
                    name: '',
                    relation: '',
                    phone: '',
                  })
                }
              />
              No
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="exp-ref"
                checked={refDraft.addRef}
                onChange={() => onRefChange({ addRef: true })}
              />
              Sí
            </label>
          </div>
        </div>
      )}

      {showFields && (
        <div className={styles.refFields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="exp-ref-name">
              Nombre de la referencia{' '}
              <span className={styles.optional}>(opcional)</span>
            </label>
            <input
              id="exp-ref-name"
              className={styles.input}
              type="text"
              value={refDraft.name}
              onChange={(e) => onRefChange({ name: e.target.value })}
              placeholder="Ej: María González · Juan Pérez"
            />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="exp-ref-relation">
                Relación{' '}
                <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                id="exp-ref-relation"
                className={styles.input}
                type="text"
                value={refDraft.relation}
                onChange={(e) => onRefChange({ relation: e.target.value })}
                placeholder="Ej: Ex jefa · Encargado · Cliente"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="exp-ref-phone">
                Teléfono{' '}
                <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                id="exp-ref-phone"
                className={styles.input}
                type="tel"
                value={refDraft.phone}
                onChange={(e) => onRefChange({ phone: e.target.value })}
                placeholder="Ej: 11 5555-1234"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EntryForm ────────────────────────────────────────────────────────────────

interface FormProps {
  draft: EntryDraft;
  errors: Record<string, string>;
  isNew: boolean;
  existingRefName: string | null;
  refAction: RefAction;
  onRefAction: (a: RefAction) => void;
  refDraft: RefDraft;
  onRefChange: (updates: Partial<RefDraft>) => void;
  onChange: (updates: Partial<EntryDraft>) => void;
  onNoIdeaAdd: (bullets: string[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

function EntryForm({
  draft,
  errors,
  isNew,
  existingRefName,
  refAction,
  onRefAction,
  refDraft,
  onRefChange,
  onChange,
  onNoIdeaAdd,
  onSave,
  onCancel,
}: FormProps) {
  const dateHints = validateExperienceDates(
    draft.startDate,
    draft.endDate,
    draft.isCurrentJob,
  );
  const bulletCount = draft.bulletsText
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean).length;

  return (
    <div className={styles.entryForm}>
      {/* Rol */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="exp-role">
          Puesto, tarea o rol <span className={styles.required}>*</span>
        </label>
        <input
          id="exp-role"
          className={`${styles.input}${errors.role ? ' ' + styles.inputError : ''}`}
          type="text"
          value={draft.role}
          onChange={(e) => onChange({ role: e.target.value })}
          placeholder="Ej: Cajero · Atención al cliente · Cuidado de niños · Reparto"
          autoFocus
        />
        {errors.role && (
          <span role="alert" className={styles.errorMsg}>
            {errors.role}
          </span>
        )}
      </div>

      {/* Lugar + tipo */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="exp-org">
            Lugar, empresa, comercio o persona{' '}
            <span className={styles.optional}>(opcional)</span>
          </label>
          <input
            id="exp-org"
            className={styles.input}
            type="text"
            value={draft.org}
            onChange={(e) => onChange({ org: e.target.value })}
            placeholder="Ej: Supermercado La Estrella · Familia García"
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Tipo</span>
          <div className={styles.typeToggle}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="exp-type"
                checked={!draft.isInformal}
                onChange={() => onChange({ isInformal: false })}
              />
              Formal
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="exp-type"
                checked={draft.isInformal}
                onChange={() => onChange({ isInformal: true })}
              />
              Informal
            </label>
          </div>
        </div>
      </div>

      {/* Fechas */}
      <div className={styles.datesRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="exp-start">
            Inicio <span className={styles.optional}>(opcional)</span>
          </label>
          <input
            id="exp-start"
            className={styles.input}
            type="text"
            value={draft.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            placeholder="Ej: 2022"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="exp-end">
            Fin <span className={styles.optional}>(opcional)</span>
          </label>
          <input
            id="exp-end"
            className={styles.input}
            type="text"
            value={draft.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            placeholder="Ej: 2024"
            disabled={draft.isCurrentJob}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.labelSpacer} aria-hidden="true" />
          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={draft.isCurrentJob}
              onChange={(e) =>
                onChange({ isCurrentJob: e.target.checked, endDate: '' })
              }
            />
            Actualidad
          </label>
        </div>
      </div>

      {dateHints.length > 0 && (
        <ul className={styles.softHints}>
          {dateHints.map((hint) => (
            <li key={hint} className={styles.softHint}>
              {hint}
            </li>
          ))}
        </ul>
      )}

      {/* Tareas */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="exp-bullets">
          Tareas principales{' '}
          <span className={styles.optional}>(opcional · una por línea)</span>
        </label>
        <textarea
          id="exp-bullets"
          className={styles.textarea}
          value={draft.bulletsText}
          onChange={(e) => onChange({ bulletsText: e.target.value })}
          placeholder={
            'Ej:\nAtención al cliente\nManejo de caja\nOrganización de stock'
          }
          rows={4}
        />
        {bulletCount === 0 && (
          <p className={styles.softHint}>
            Si querés, podés agregar 2 o 3 tareas para explicar mejor qué hacías
            en esta experiencia.
          </p>
        )}
        {bulletCount > BULLETS_LONG_THRESHOLD && (
          <p className={styles.softHint}>
            Vas muy bien. Si esta experiencia queda muy larga, podés dejar solo
            las tareas que mejor muestran lo que sabés hacer.
          </p>
        )}
      </div>

      <NoIdeaHelper onAdd={onNoIdeaAdd} />

      {/* Referencia relacionada */}
      <RefSection
        existingRefName={existingRefName}
        refAction={refAction}
        onRefAction={onRefAction}
        refDraft={refDraft}
        onRefChange={onRefChange}
      />

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

// ─── ExperienceStep ───────────────────────────────────────────────────────────

const ExperienceStep = forwardRef<StepRef>(function ExperienceStep(_, ref) {
  const draft = useCVStore((s) => s.draft)!;
  const addExperience = useCVStore((s) => s.addExperience);
  const updateExperience = useCVStore((s) => s.updateExperience);
  const removeExperience = useCVStore((s) => s.removeExperience);
  const addReference = useCVStore((s) => s.addReference);
  const updateReference = useCVStore((s) => s.updateReference);

  const [formMode, setFormMode] = useState<FormMode>({ type: 'idle' });
  const [entryDraft, setEntryDraft] = useState<EntryDraft>(() =>
    defaultDraft(draft.mode),
  );
  const [refDraft, setRefDraft] = useState<RefDraft>(DEFAULT_REF_DRAFT);
  const [refAction, setRefAction] = useState<RefAction>('keep');
  const [existingLinkedRefId, setExistingLinkedRefId] = useState<string | null>(
    null,
  );
  const [existingLinkedRefName, setExistingLinkedRefName] = useState<
    string | null
  >(null);
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
    setEntryDraft(defaultDraft(draft.mode));
    setRefDraft(DEFAULT_REF_DRAFT);
    setRefAction('keep');
    setExistingLinkedRefId(null);
    setExistingLinkedRefName(null);
    setEntryErrors({});
    setShowUnsavedWarning(false);
    setFormMode({ type: 'new' });
  }

  function startEdit(entry: ExperienceEntry) {
    setEntryDraft(entryToDraft(entry));
    const existing = draft.references.find(
      (r) => r.relatedExperienceId === entry.id,
    );
    if (existing) {
      setExistingLinkedRefId(existing.id);
      setExistingLinkedRefName(existing.name);
      setRefDraft({
        addRef: true,
        name: existing.name,
        relation: existing.relation ?? '',
        phone: existing.phone ?? '',
      });
      setRefAction('keep');
    } else {
      setExistingLinkedRefId(null);
      setExistingLinkedRefName(null);
      setRefDraft(DEFAULT_REF_DRAFT);
      setRefAction('keep');
    }
    setEntryErrors({});
    setShowUnsavedWarning(false);
    setFormMode({ type: 'edit', id: entry.id });
  }

  function handleSave() {
    if (!entryDraft.role.trim()) {
      setEntryErrors({ role: 'Contanos qué hacías o cuál era tu tarea' });
      return;
    }
    const entry = draftToEntry(entryDraft);

    if (formMode.type === 'new') {
      const expId = addExperience(entry);
      if (refDraft.addRef && refDraft.name.trim()) {
        addReference({
          name: refDraft.name.trim(),
          relation: refDraft.relation.trim() || undefined,
          phone: refDraft.phone.trim() || undefined,
          relatedExperienceId: expId,
        });
      }
    } else if (formMode.type === 'edit') {
      updateExperience(formMode.id, entry);

      if (existingLinkedRefId) {
        if (refAction === 'edit' && refDraft.name.trim()) {
          updateReference(existingLinkedRefId, {
            name: refDraft.name.trim(),
            relation: refDraft.relation.trim() || undefined,
            phone: refDraft.phone.trim() || undefined,
            relatedExperienceId: formMode.id,
          });
        } else if (refAction === 'unlink') {
          const existing = draft.references.find(
            (r) => r.id === existingLinkedRefId,
          );
          if (existing) {
            updateReference(existingLinkedRefId, {
              name: existing.name,
              relation: existing.relation,
              phone: existing.phone,
              relatedExperienceId: undefined,
            });
          }
        }
        // refAction === 'keep': don't touch
      } else if (refDraft.addRef && refDraft.name.trim()) {
        addReference({
          name: refDraft.name.trim(),
          relation: refDraft.relation.trim() || undefined,
          phone: refDraft.phone.trim() || undefined,
          relatedExperienceId: formMode.id,
        });
      }
    }

    setFormMode({ type: 'idle' });
    setEntryErrors({});
    setRefDraft(DEFAULT_REF_DRAFT);
    setExistingLinkedRefId(null);
    setExistingLinkedRefName(null);
  }

  function handleCancel() {
    setFormMode({ type: 'idle' });
    setEntryErrors({});
    setRefDraft(DEFAULT_REF_DRAFT);
    setRefAction('keep');
    setExistingLinkedRefId(null);
    setExistingLinkedRefName(null);
    setShowUnsavedWarning(false);
  }

  function handleRemove(id: string) {
    removeExperience(id);
    if (formMode.type === 'edit' && formMode.id === id) {
      setFormMode({ type: 'idle' });
      setRefDraft(DEFAULT_REF_DRAFT);
      setExistingLinkedRefId(null);
      setExistingLinkedRefName(null);
    }
  }

  function handleChange(updates: Partial<EntryDraft>) {
    setEntryDraft((prev) => ({ ...prev, ...updates }));
    if (updates.role !== undefined && entryErrors.role) {
      setEntryErrors((prev) => {
        const next = { ...prev };
        delete next.role;
        return next;
      });
    }
  }

  function handleRefChange(updates: Partial<RefDraft>) {
    setRefDraft((prev) => ({ ...prev, ...updates }));
  }

  function handleNoIdeaAdd(bullets: string[]) {
    setEntryDraft((prev) => {
      const existing = prev.bulletsText.trim();
      const toAdd = bullets.join('\n');
      return {
        ...prev,
        bulletsText: existing ? `${existing}\n${toAdd}` : toAdd,
      };
    });
  }

  return (
    <div className={styles.step}>
      {draft.mode === 'primer-empleo' && (
        <div className={styles.reassurance}>
          No pasa nada si todavía no trabajaste. Más adelante vamos a destacar
          tus estudios, habilidades y disponibilidad.
        </div>
      )}

      <p className={styles.help}>{HELP[draft.mode]}</p>

      {showUnsavedWarning && (
        <p role="alert" className={styles.unsavedWarning}>
          Tenés una experiencia sin guardar. Guardala o cancelala antes de
          continuar.
        </p>
      )}

      {draft.experience.length > 0 && (
        <ul className={styles.entryList}>
          {draft.experience.map((entry) => (
            <li key={entry.id}>
              {formMode.type === 'edit' && formMode.id === entry.id ? (
                <EntryForm
                  draft={entryDraft}
                  errors={entryErrors}
                  isNew={false}
                  existingRefName={existingLinkedRefName}
                  refAction={refAction}
                  onRefAction={setRefAction}
                  refDraft={refDraft}
                  onRefChange={handleRefChange}
                  onChange={handleChange}
                  onNoIdeaAdd={handleNoIdeaAdd}
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
          existingRefName={null}
          refAction={refAction}
          onRefAction={setRefAction}
          refDraft={refDraft}
          onRefChange={handleRefChange}
          onChange={handleChange}
          onNoIdeaAdd={handleNoIdeaAdd}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {formMode.type === 'idle' && (
        <button className={styles.addBtn} onClick={startNew} type="button">
          + Agregar experiencia
        </button>
      )}
    </div>
  );
});

export default ExperienceStep;
