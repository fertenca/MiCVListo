import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useCVStore } from '../../cv-model';
import type { StepRef } from '..';
import styles from './PhotoStep.module.css';

// ─── Constantes ───────────────────────────────────────────────────────────────

const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
const OUTPUT_SIZE = 400;
// Base64 string length ≈ raw bytes * 4/3. 270 000 chars ≈ ~200 KB raw.
const MAX_B64_LEN = 270_000;

// ─── Procesamiento de imagen ──────────────────────────────────────────────────

async function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { naturalWidth: w, naturalHeight: h } = img;
      if (!w || !h) {
        reject(new Error('La imagen no se pudo leer correctamente.'));
        return;
      }

      // Recorte cuadrado centrado
      const size = Math.min(w, h);
      const sx = (w - size) / 2;
      const sy = (h - size) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo procesar la imagen.'));
        return;
      }

      // Fondo blanco para imágenes PNG con transparencia
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      ctx.drawImage(img, sx, sy, size, size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      let dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      if (dataUrl.length > MAX_B64_LEN) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.65);
      }
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo cargar la imagen.'));
    };

    img.src = objectUrl;
  });
}

// ─── Componente ───────────────────────────────────────────────────────────────

const PhotoStep = forwardRef<StepRef>(function PhotoStep(_, ref) {
  const draft = useCVStore((s) => s.draft)!;
  const updatePersonal = useCVStore((s) => s.updatePersonal);

  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    validate() {
      return true;
    },
  }));

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Resetear para que el mismo archivo pueda volver a seleccionarse
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;

    if (!ACCEPTED_MIME.includes(file.type)) {
      setError('El archivo debe ser una imagen JPG, PNG o WEBP.');
      return;
    }

    setError(null);
    setProcessing(true);
    try {
      const dataUrl = await processImage(file);
      updatePersonal({ photo: dataUrl });
    } catch {
      setError('No se pudo procesar la imagen. Intentá con otro archivo.');
    } finally {
      setProcessing(false);
    }
  }

  function handleRemove() {
    updatePersonal({ photo: undefined });
    setError(null);
  }

  const photo = draft.personal.photo;

  return (
    <div className={styles.step}>
      <p className={styles.optionalNote}>
        Esta sección es completamente opcional. Podés avanzar sin agregar foto.
      </p>

      {photo ? (
        <div className={styles.previewArea}>
          <img src={photo} alt="Tu foto de perfil" className={styles.preview} />
          <div className={styles.previewActions}>
            <button
              type="button"
              className={styles.changeBtn}
              onClick={() => inputRef.current?.click()}
              disabled={processing}
            >
              {processing ? 'Procesando...' : 'Cambiar foto'}
            </button>
            <button
              type="button"
              className={styles.removeBtn}
              onClick={handleRemove}
            >
              Eliminar foto
            </button>
          </div>
          {error && (
            <p role="alert" className={styles.errorMsg}>
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className={styles.uploadArea}>
          <p className={styles.uploadHint}>
            Usá una foto clara, reciente y con buena iluminación. Se recorta
            automáticamente en formato cuadrado.
          </p>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={() => inputRef.current?.click()}
            disabled={processing}
          >
            {processing ? 'Procesando...' : 'Elegir foto'}
          </button>
          {error && (
            <p role="alert" className={styles.errorMsg}>
              {error}
            </p>
          )}
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className={styles.hiddenInput}
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Aviso de privacidad */}
      <div className={styles.privacyBox}>
        <p className={styles.privacyLead}>
          La foto es opcional. Si decidís usar una, se procesa en tu navegador y
          queda guardada solo en este dispositivo.
        </p>
        <ul className={styles.privacyList}>
          <li>No se sube a ningún servidor.</li>
          <li>Queda guardada en el borrador local de este dispositivo.</li>
          <li>Podés eliminarla cuando quieras.</li>
        </ul>
      </div>
    </div>
  );
});

export default PhotoStep;
