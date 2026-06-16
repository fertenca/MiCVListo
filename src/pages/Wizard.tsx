import styles from './placeholder.module.css';

function Wizard() {
  return (
    <section className={styles.placeholder}>
      <span className={styles.badge}>Próximamente · Fase 3</span>
      <h1>Asistente para armar tu CV</h1>
      <p className={styles.text}>
        Acá vas a responder preguntas simples, paso a paso, y la app va a
        transformar tus respuestas en frases profesionales. Tu progreso se
        guardará en tu navegador, sin necesidad de cuenta.
      </p>
    </section>
  );
}

export default Wizard;
