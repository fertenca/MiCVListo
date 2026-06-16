import styles from './placeholder.module.css';

/**
 * Página de privacidad. En la Fase 0 deja asentados los mensajes de confianza
 * acordados. La versión completa se pule en la Fase 10.
 */
function Privacy() {
  return (
    <section className={styles.placeholder}>
      <span className={styles.badge}>Borrador · se completa en Fase 10</span>
      <h1>Privacidad</h1>
      <p className={styles.text}>
        Podés crear tu CV sin cuenta. No vendemos tus datos y no mostramos
        anuncios. La foto se procesa en tu navegador. Si iniciás sesión,
        guardamos tus CVs para que puedas editarlos después.
      </p>
    </section>
  );
}

export default Privacy;
