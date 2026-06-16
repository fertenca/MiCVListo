import { Link, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

/**
 * Layout base de la app: header con marca + navegación, área de contenido
 * (Outlet de las rutas) y footer con la línea de confianza.
 */
function Layout() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand}>
            MiCV<span className={styles.brandAccent}>Listo</span>
          </Link>
          <nav className={styles.nav} aria-label="Navegación principal">
            <Link to="/">Inicio</Link>
            <Link to="/privacidad">Privacidad</Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.mainInner}>
          <Outlet />
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>Gratis · Sin anuncios · Sin vender tus datos</span>
          <span>Podés crear tu CV sin cuenta.</span>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
