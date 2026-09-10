# Analytics privado — configuración en Cloudflare

Métricas anónimas de uso de MiCVListo. Backend: **Cloudflare Pages Functions**
(`/functions/api/analytics/*`) + **Cloudflare D1**. No usa servicios externos,
cookies, ni Google Analytics. Nunca guarda contenido del CV ni datos personales.

El código ya está en el repo. Faltan unos pasos manuales (una sola vez) en la
cuenta de Cloudflare, porque dependen de credenciales que no van al repositorio.

---

## Resumen de lo que hay que crear

| Recurso | Nombre / valor |
| --- | --- |
| Base D1 | `micvlisto-analytics` |
| Binding D1 en el proyecto Pages | **`DB`** |
| Secret (token del dashboard) | **`ADMIN_ANALYTICS_TOKEN`** |

> El binding **debe** llamarse `DB` y el secret **debe** llamarse
> `ADMIN_ANALYTICS_TOKEN`: así los esperan las Functions.

---

## 1. Crear la base D1

Con [wrangler](https://developers.cloudflare.com/workers/wrangler/) autenticado
en la cuenta correcta:

```bash
wrangler d1 create micvlisto-analytics
```

Anotá el `database_id` que devuelve (lo vas a necesitar si configurás el binding
por wrangler en vez de por el panel).

## 2. Aplicar el esquema

El esquema está en [`schema.sql`](../schema.sql):

```bash
wrangler d1 execute micvlisto-analytics --remote --file=./schema.sql
```

## 3. Conectar el binding `DB` al proyecto Pages

En el **panel de Cloudflare**:

1. Workers & Pages → proyecto **micvlisto** → Settings → **Functions** →
   **D1 database bindings**.
2. Agregá un binding:
   - Variable name: **`DB`**
   - D1 database: **micvlisto-analytics**
3. Hacelo tanto en **Production** como en **Preview** (si querés métricas en
   ramas de preview).

## 4. Definir el secret del dashboard

Generá un token largo y aleatorio (ej. `openssl rand -hex 24`) y cargalo como
variable de entorno **encriptada**:

- Panel: Workers & Pages → micvlisto → Settings → **Environment variables** →
  agregar `ADMIN_ANALYTICS_TOKEN` (marcar como *Encrypt*), en Production (y
  Preview si corresponde).
- O por CLI:

```bash
wrangler pages secret put ADMIN_ANALYTICS_TOKEN --project-name micvlisto
```

> El token **no** se guarda en el repo (el repo es público). Solo vive como
> variable de entorno en Cloudflare y, del lado del navegador, en
> `sessionStorage` mientras usás el dashboard.

## 5. Desplegar

No hay que cambiar el comando de deploy. El CI corre:

```
wrangler pages deploy dist --project-name micvlisto --branch <rama>
```

Wrangler detecta automáticamente la carpeta `functions/` del repo y la compila
junto con el sitio estático. Los endpoints quedan en:

- `POST /api/analytics/event` — ingesta de eventos anónimos.
- `GET  /api/analytics/summary` — resumen para el dashboard (requiere token).

---

## Acceder al dashboard

1. Entrá a `https://micvlisto.fertenca.com.ar/admin` (la ruta **no** está linkeada en
   la navegación pública).
2. Ingresá la clave (`ADMIN_ANALYTICS_TOKEN`).
3. El navegador la guarda solo en `sessionStorage` y la manda como
   `Authorization: Bearer <token>` al endpoint, que la valida antes de
   responder. Sin clave válida no se devuelven datos.

---

## Notas

- **En desarrollo local** (`npm run dev`, Vite) no corren las Functions ni hay
  D1: los eventos se envían igual pero se ignoran, y el dashboard mostrará que
  la base "todavía no está configurada". La app funciona normal.
- Si el endpoint de analytics falla, **la app nunca se rompe**: la creación del
  CV y la descarga del PDF siguen funcionando.
- Para probar Functions + D1 localmente se puede usar
  `wrangler pages dev dist --d1 DB=micvlisto-analytics` luego de `npm run build`.
