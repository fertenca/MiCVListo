import { Link } from 'react-router-dom';
import TrustBanner from '../components/TrustBanner/TrustBanner';
import { useTrackPageView } from '../features/analytics';
import styles from './Landing.module.css';

const PILLARS = [
  {
    title: 'Sin cuenta',
    desc: 'Creás y descargás tu CV sin registrarte ni dejar tu email.',
  },
  {
    title: 'PDF listo para enviar',
    desc: 'Descargás el PDF directo desde la app, sin pasos extra ni esperas.',
  },
  {
    title: 'Sin anuncios',
    desc: 'La app es limpia y enfocada. Nada que te distraiga.',
  },
  {
    title: 'Tus datos son tuyos',
    desc: 'No vendemos ni compartimos tu información con nadie.',
  },
];

const FOR_WHOM = [
  {
    label: 'Tengo experiencia laboral',
    desc: 'Actualizá tu CV o armá uno nuevo para cambiar de trabajo.',
  },
  {
    label: 'Busco mi primer empleo',
    desc: 'Te ayudamos a mostrar lo que sabés aunque no hayas trabajado antes.',
  },
  {
    label: 'Trabajé de forma informal',
    desc: 'Las changas, el cuidado de personas y las ventas también cuentan.',
  },
];

function Landing() {
  useTrackPageView('landing_viewed');
  return (
    <>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Tu CV profesional, listo en minutos. Gratis.
        </h1>
        <p className={styles.subtitle}>
          Respondés preguntas simples y en minutos tenés un CV prolijo, listo
          para descargar en PDF. Sin cuenta, sin costo, sin rodeos.
        </p>
        <div className={styles.actions}>
          <Link to="/crear" className={styles.cta}>
            Crear mi CV gratis
          </Link>
          <span className={styles.ctaNote}>No necesitás registrarte.</span>
        </div>
      </section>

      <section className={styles.pillars}>
        <h2 className={styles.pillarsTitle}>¿Por qué MiCVListo?</h2>
        <ul className={styles.pillarsList}>
          {PILLARS.map((p) => (
            <li key={p.title} className={styles.pillarItem}>
              <strong className={styles.pillarHead}>{p.title}</strong>
              <span className={styles.pillarDesc}>{p.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.forWhom}>
        <h2 className={styles.forWhomTitle}>Está hecha para vos si…</h2>
        <ul className={styles.forWhomList}>
          {FOR_WHOM.map((item) => (
            <li key={item.label} className={styles.forWhomItem}>
              <span className={styles.forWhomLabel}>{item.label}</span>
              <span className={styles.forWhomDesc}>{item.desc}</span>
            </li>
          ))}
        </ul>
        <Link to="/crear" className={styles.ctaSecondary}>
          Crear mi CV gratis
        </Link>
      </section>

      <TrustBanner />
    </>
  );
}

export default Landing;
