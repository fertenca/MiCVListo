import { Link } from 'react-router-dom';
import styles from './Landing.module.css';

const trustPoints = [
  'Podés crear tu CV sin cuenta.',
  'No vendemos tus datos.',
  'No hay anuncios.',
  'La foto se procesa en tu navegador.',
];

/**
 * Pantalla inicial. En la Fase 0 muestra la propuesta de valor y el acceso
 * al wizard. Los modos ("tengo experiencia" / "primer trabajo" / "informal")
 * y los mensajes de confianza se desarrollan en fases posteriores.
 */
function Landing() {
  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>Armá tu CV profesional, gratis</h1>
      <p className={styles.subtitle}>
        Te guiamos paso a paso con preguntas simples. Tengas o no experiencia,
        te ayudamos a contar lo que sabés hacer y a descargar tu CV en PDF.
      </p>

      <div className={styles.actions}>
        <Link to="/crear" className={styles.cta}>
          Empezá tu CV
        </Link>
        <span className={styles.ctaNote}>No necesitás registrarte.</span>
      </div>

      <ul className={styles.trust}>
        {trustPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </section>
  );
}

export default Landing;
