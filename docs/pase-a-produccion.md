# Plan de pase a producción — develop → main / entorno Amplify `prod`

Alcance: todo lo que está en `develop` y no en `main` (118 archivos). Incluye cambios de **schema** (uno destructivo),
**scripts de datos**, **configuración en Parámetros** y el **frontend**.

> Regla de oro: cada script se corre primero **sin `--aplicar`** (simulación) y se revisa la salida antes de aplicar.
> Los scripts usan el entorno de `src/aws-exports.js`, que cambia con `amplify env checkout`.

---

## 0. Preparación (día anterior)

- [ ] Avisar a BackOffice y Aprobadores la ventana de pase: **no ingresar ni aprobar operaciones**, no pagar dividendos.
- [ ] Revisar en el blotter de prod las operaciones **Pendientes**. Pueden quedar, pero conviene aprobarlas o rechazarlas antes.
      Una posesión efectiva pendiente se valida con la nueva regla de herederos al aprobarla.
- [ ] Revisar en Cognito (prod) si hay usuarios en el grupo **`Accionista_Aux`**. Ese perfil se eliminó: moverlos a `Accionista` o
      a otro grupo. Si no, verán "Usuario sin perfil asignado".
- [ ] Confirmar cómo se publica hoy el frontend de prod (Amplify Hosting conectado a `main` o build manual).

## 1. Respaldos de prod (obligatorio)

- [ ] DynamoDB: backup bajo demanda de **todas** las tablas `*-<apiId>-prod`, o confirmar que tienen PITR activo.
- [ ] S3 (`imagestorage` prod): confirmar que tiene versionado, o copiar el bucket.
- [ ] **Tablas que el push va a BORRAR**: `DividendosAccionista`, `Solicitudes`, `TituloArchive`. Contar los registros en prod:
      ```bash
      aws dynamodb scan --table-name DividendosAccionista-<apiId>-prod --select COUNT --profile <perfil-prod>
      ```
      En staging estaban vacías. Si en prod tienen datos, **exportarlas antes** (scan a JSON o export a S3) y decidir si se pueden borrar.
      El push las elimina sin pedir más confirmación.

## 2. Verificaciones de datos en prod (solo lectura)

- [ ] `DividendosTitulos` sin registros con `div_tit_accionista_id` vacío (`''`). El nuevo índice `byAccionista` no indexa
      esos registros: el reporte por accionista no los vería.
- [ ] Parámetros → **Validar rangos**: el libro cuadra (emitido = raíz = suma de acciones) y no hay rangos solapados.
      Anotar los totales para compararlos después del pase.

## 3. Código: merge a main

- [ ] PR `develop → main`, revisión y merge. (No hay cambios sin commitear en develop.)
- [ ] Local: `git checkout main && git pull`, `npm ci`, `npm test` (81 tests) y `npm run build` sin errores.

## 4. Backend: push del schema a prod

```bash
amplify env checkout prod
```
```bash
amplify status
```
Revisar que `amplify status` muestre **solo** `api libroaccionistas` en *Update*. Lo que entra:

| Cambio | Tipo |
|---|---|
| Modelo `Certificado` + índice `byAccionista` (QR / verificación) | nuevo |
| Modelo `TituloxJunta` + índice `byAsamblea` (foto del quórum) | nuevo (si prod aún no lo tiene) |
| Índice `byAccionista` en `DividendosTitulos` | GSI nuevo (backfill sobre datos existentes) |
| `queryField` en `AccionistasxJunta.byAsamblea` | sin cambio de tabla |
| `Parametro.reglasRetencion`, `DetalleDividendo.ddiv_reglas_retencion` (AWSJSON), `Pais.paraisoFiscal`, campos de dividendos por reparto | campos nuevos |
| 71 campos sin uso quitados de `Parametro` y `Asamblea` | solo del API; los datos quedan en DynamoDB |
| Se eliminan `DividendosAccionista`, `Solicitudes`, `TituloArchive` | **destructivo** (ver paso 1) |

```bash
amplify push --allow-destructive-graphql-schema-updates
```
- Los cambios de índices se despliegan en varias etapas: puede tardar. No cortar la terminal.
- Si queda trabado ("A deployment is in progress"): `amplify push --force` (fue lo que funcionó en staging).
- Al terminar, `src/aws-exports.js` y `src/graphql/*` quedan apuntando a prod.

## 5. Datos: scripts en prod (en este orden)

Cada uno: primero **sin** `--aplicar`, revisar la salida y luego con `--aplicar`. Los respaldos quedan en `scripts/respaldos/`.

1. [ ] `node scripts/normalizar-tipos-accionistas.js`: números guardados como texto. Es la causa de que la asamblea listara
       solo 17 accionistas en staging.
2. [ ] `node scripts/cargar-paises.js`: catálogo de 199 países en la tabla `Pais`.
3. [ ] `node scripts/normalizar-paises.js`: nombres de país de los accionistas, personas jurídicas y cónyuges ajustados al catálogo.
4. [ ] `node scripts/cargar-paises.js --inactivar-sin-uso`: deja activos solo los países que usan los accionistas.

**No correr en prod:**
- `scripts/limpiar-pruebas.js` borra datos de prueba y se niega a correr fuera de staging.
- `scripts/corregir-titulos.js` tiene IDs de títulos de staging. Si "Validar rangos" detecta errores en prod, se analizan aparte.

## 6. Configuración en la aplicación (perfil Administrador)

- [ ] **Parámetros → Retenciones**: revisar las 8 reglas iniciales y **Guardar** (así quedan persistidas) y confirmar el SBU vigente.
      Probar el simulador con un caso de persona natural y otro de persona jurídica.
- [ ] **Parámetros → Países**: marcar los **paraísos fiscales**. Los países se cargan sin esa marca.
- [ ] **Parámetros → Modelos de cartas**: volver a subir los 4 modelos si aparecen con valores antiguos (`{filename=…}`).
      Esos archivos no existen en S3; tras subirlos el dashboard del accionista podrá descargarlos.
- [ ] Asambleas futuras: definir `temaDividendo` al crear una asamblea que reparta dividendos.

## 7. Frontend

- [ ] Publicar el build de `main` como se hace hoy.
- [ ] **Regla de reescritura SPA** (Amplify Hosting → Rewrites and redirects). Sin ella, `/verificar/<id>` del QR da 404:
      `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|pdf)$)([^.]+$)/>` → `/index.html` (200).
- [ ] Confirmar que `robots.txt` publicado bloquea la indexación.

## 8. Pruebas de humo en prod

| Perfil | Probar |
|---|---|
| Administrador | Login, menú, Parámetros (reglas, países, modelos), Validar rangos con los mismos totales del paso 2 |
| BackOffice | Abrir cada pantalla de operación **sin guardar**. Subir un archivo no PDF (debe rechazarse) y uno de más de 10 MB |
| Aprobador | Blotter: abrir el detalle de una operación |
| Accionista | Dashboard, **imprimir certificado** y escanear el QR desde un celular sin sesión: debe abrir la verificación. Descargar un modelo de carta |
| Dividendos | Reporte por accionista y detalle de un reparto (búsqueda, Excel, pestaña de cuadre). **No pagar** |
| Asambleas | Abrir la lista de asistencia: deben aparecer todos los accionistas activos con acciones, no solo 17 |

## 9. Cierre

- [ ] **Volver el entorno local a staging**, para que nadie corra scripts contra prod por error:
      ```bash
      amplify env checkout staging
      ```
- [ ] Avisar a los usuarios que pueden operar de nuevo.
- [ ] Merge de `main` a `develop` si el PR generó un commit de merge.

## Rollback

| Qué falla | Cómo volver |
|---|---|
| Frontend | Volver a publicar el build anterior (el último deploy en Amplify Hosting o el commit anterior de `main`) |
| Schema | Volver `schema.graphql` al de `main` anterior y hacer `amplify push`. Las tablas borradas **no vuelven**: restaurarlas del backup del paso 1 |
| Scripts de datos | Cada script guarda un JSON de respaldo en `scripts/respaldos/` con los valores previos. Si no basta, restaurar el backup de DynamoDB |
