import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

/**
 * Página amigable para rutas inexistentes y errores de navegación.
 * Se usa como ruta catch-all y como errorElement del router, para que el
 * usuario nunca vea el mensaje técnico por defecto de React Router.
 */
function NotFound() {
  return (
    <section className={styles.page}>
      <p className={styles.code} aria-hidden="true">
        404
      </p>
      <h1 className={styles.title}>Página no encontrada</h1>
      <p className={styles.text}>
        El enlace que abriste no existe o ya no está disponible.
      </p>
      <Link to="/" className={styles.btn}>
        Volver al inicio
      </Link>
    </section>
  );
}

export default NotFound;
