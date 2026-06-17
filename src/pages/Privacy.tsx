import styles from './Privacy.module.css';

function Privacy() {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Privacidad</h1>
      <p className={styles.lead}>
        Queremos que sepas exactamente qué hace esta app con tus datos.
      </p>

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Sin cuenta</h2>
        <p>
          Podés crear y descargar tu CV sin registrarte ni dejar tu email.
          No hace falta ninguna cuenta para usar la app.
        </p>
      </div>

      <hr className={styles.divider} />

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Tus datos personales</h2>
        <p>
          La información que ingresás (nombre, experiencia, formación, etc.) se
          guarda en este dispositivo, en el almacenamiento local del navegador.
        </p>
        <p>
          Mientras no inicies sesión, el borrador queda guardado localmente y
          no se envía a ningún servidor. Si borrás los datos del navegador, el
          borrador se pierde.
        </p>
      </div>

      <hr className={styles.divider} />

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Tu foto</h2>
        <p>
          La foto se procesa completamente en tu navegador: se recorta y
          comprime de forma local, y no se sube a ningún servidor.
        </p>
        <p>
          Podés eliminarla en cualquier momento desde el paso de foto del
          formulario.
        </p>
      </div>

      <hr className={styles.divider} />

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>El PDF</h2>
        <p>
          El PDF se genera en tu dispositivo. No lo subimos a ningún servidor.
          La descarga no requiere cuenta ni login.
        </p>
      </div>

      <hr className={styles.divider} />

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Publicidad y datos</h2>
        <p>
          No hay anuncios en esta app. No vendemos, compartimos ni usamos tus
          datos con fines publicitarios.
        </p>
      </div>

      <hr className={styles.divider} />

      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Resumen</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>Podés crear tu CV sin cuenta.</li>
          <li className={styles.listItem}>No vendemos tus datos.</li>
          <li className={styles.listItem}>No mostramos anuncios.</li>
          <li className={styles.listItem}>
            La foto se procesa en tu navegador.
          </li>
          <li className={styles.listItem}>
            El PDF se genera en tu dispositivo.
          </li>
          <li className={styles.listItem}>
            El borrador queda guardado en este dispositivo mientras no inicies
            sesión.
          </li>
        </ul>
      </div>
    </section>
  );
}

export default Privacy;
