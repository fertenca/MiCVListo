import styles from './TrustBanner.module.css';

const MESSAGES = [
  'Podés crear tu CV sin cuenta.',
  'No vendemos tus datos.',
  'No mostramos anuncios.',
  'La foto se procesa en tu navegador.',
  'El PDF se genera en tu dispositivo.',
  'El borrador queda guardado en este dispositivo mientras no inicies sesión.',
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
