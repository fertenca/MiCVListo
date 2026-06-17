import { Link } from 'react-router-dom';
import styles from './Guia.module.css';

/**
 * Guía simple para personas que nunca hicieron un CV.
 * Tono cercano, sin lenguaje académico ni corporativo.
 */
function Guia() {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Guía para tu CV</h1>
      <p className={styles.lead}>
        Si nunca hiciste un CV, no te preocupes. Acá te contamos qué poner y
        cómo aprovechar la herramienta.
      </p>

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Qué es un CV</h2>
        <p>
          Un CV es un resumen de quién sos, qué sabés hacer y qué experiencia
          tenés. No tiene que contar toda tu vida: tiene que ayudar a que una
          persona entienda rápido si podés servir para un trabajo.
        </p>
      </div>

      <hr className={styles.divider} />

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Qué no puede faltar</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>Nombre y datos de contacto.</li>
          <li className={styles.listItem}>Una frase breve sobre vos.</li>
          <li className={styles.listItem}>Experiencia, si tenés.</li>
          <li className={styles.listItem}>Educación.</li>
          <li className={styles.listItem}>Cursos o capacitaciones.</li>
          <li className={styles.listItem}>Habilidades.</li>
          <li className={styles.listItem}>Idiomas, si corresponde.</li>
          <li className={styles.listItem}>Disponibilidad, si suma.</li>
        </ul>
      </div>

      <hr className={styles.divider} />

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Si buscás tu primer empleo</h2>
        <p>
          No tener experiencia laboral no significa no tener nada para mostrar.
          Podés incluir estudios, cursos, habilidades, tareas familiares,
          voluntariados, changas, conocimientos de computación o buena
          predisposición para aprender.
        </p>
      </div>

      <hr className={styles.divider} />

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Si trabajaste informalmente</h2>
        <p>
          Las changas, ventas, cuidado de personas, atención al público,
          reparto, limpieza, cocina o tareas administrativas informales también
          cuentan. Lo importante es explicarlas de forma clara y profesional.
        </p>
      </div>

      <hr className={styles.divider} />

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Cómo escribir la experiencia</h2>
        <p>
          No hace falta poner todo. Elegí las tareas más importantes. Entre 3 y
          6 tareas suele estar bien, pero podés agregar más si lo necesitás.
        </p>
      </div>

      <hr className={styles.divider} />

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Errores comunes</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>Poner textos demasiado largos.</li>
          <li className={styles.listItem}>Usar frases muy informales.</li>
          <li className={styles.listItem}>No revisar errores de escritura.</li>
          <li className={styles.listItem}>Poner datos de contacto incorrectos.</li>
          <li className={styles.listItem}>Cargar demasiadas tareas repetidas.</li>
          <li className={styles.listItem}>
            Usar una foto poco clara, si decidís poner foto.
          </li>
        </ul>
      </div>

      <hr className={styles.divider} />

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Consejo final</h2>
        <p>
          Antes de enviar tu CV, descargalo en PDF y revisalo como si fueras la
          persona que lo va a recibir. ¿Se entiende rápido quién sos y qué podés
          hacer?
        </p>
      </div>

      <div className={styles.cta}>
        <Link to="/crear" className={styles.ctaBtn}>
          Crear mi CV gratis
        </Link>
      </div>
    </section>
  );
}

export default Guia;
