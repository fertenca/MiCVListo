import styles from './placeholder.module.css';

/**
 * Ruta de vista previa + descarga. En la Fase 0 es un placeholder navegable.
 * La preview y la exportación a PDF (misma plantilla para ver y descargar,
 * buscando consistencia visual) llegan en las Fases 6–8.
 */
function Preview() {
  return (
    <section className={styles.placeholder}>
      <span className={styles.badge}>Próximamente · Fases 6–8</span>
      <h1>Vista previa de tu CV</h1>
      <p className={styles.text}>
        Vas a ver tu CV antes de descargarlo y vas a poder elegir entre las
        plantillas Clásica, Moderna y Primer empleo. La vista previa y la
        descarga usan la misma plantilla, buscando consistencia visual.
      </p>
    </section>
  );
}

export default Preview;
