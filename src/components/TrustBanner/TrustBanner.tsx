import styles from './TrustBanner.module.css';

const MESSAGES = [
  'Podés crear tu CV sin cuenta.',
  'No vendemos tus datos.',
  'No hay anuncios.',
  'La descarga del PDF no requiere login.',
  'Si más adelante iniciás sesión, será solo para guardar y editar después.',
];

function TrustBanner() {
  return (
    <aside className={styles.banner} aria-label="Garantías de privacidad">
      <ul className={styles.list}>
        {MESSAGES.map((msg) => (
          <li key={msg} className={styles.item}>
            {msg}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default TrustBanner;
