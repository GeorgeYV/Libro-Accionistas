# Libro de Accionistas — UNACEM Ecuador S.A.

Aplicación web para llevar el **libro de accionistas desmaterializado/tokenizado**: registro de accionistas,
títulos (rangos de acciones), operaciones sobre acciones con flujo de aprobación, asambleas, dividendos y reportes.

Idioma del proyecto: **español** (UI, nombres de variables, mensajes y commits).

---

## Stack real (no asumir otro)

- **Create React App 4** (`react-scripts 4.0.3`) — sin Vite, sin TypeScript en `src/`.
- **React 17** + `ReactDOM.render`, componentes funcionales con hooks. **React Router v5** (`Switch`, `Route`, `Redirect`).
- **Material-UI v4** (`@material-ui/core`, `@material-ui/lab`, `@material-ui/icons`) + `makeStyles`.
  `@mui/x-data-grid` v4 para tablas. **No** mezclar con MUI v5 (`@mui/material`) ni Tailwind.
- **AWS Amplify v4**: Cognito (auth), AppSync GraphQL (datos, backend DynamoDB), S3 vía `Storage` (documentos de respaldo).
- Formularios: estado local con `useState`.
- Documentos: `jspdf` + `jspdf-autotable` (certificados/títulos PDF), `exceljs` (exportaciones), `qrcode.react`.
- Gráficos: `react-minimal-pie-chart` (quórum en asambleas).
- No hay gestor de estado global: cada vista carga sus datos con `API.graphql` en `useEffect`.

## Comandos

```bash
npm start          # dev server en http://localhost:3000
npm run build      # build de producción
npm test           # Jest (react-scripts); actualmente no hay tests escritos
```

No existen scripts de lint/format ni `tsc`. El lint lo ejecuta CRA (`eslintConfig: react-app`) al compilar.
Verificar cambios con `npm run build` (falla si hay errores de sintaxis/imports).

## Estructura

```text
src/
├── App.js                  # Login Amplify + rutas según grupo Cognito
├── index.js                # Amplify.configure(aws-exports), ThemeProvider, BrowserRouter
├── components/             # layout, header, sidebar (menú por perfil), utilidades
│   └── manejoAccionistas.js  # helpers: obtener accionista completo (PN/PJ/cónyuge), validaciones
├── views/                  # una vista = una pantalla/operación (archivos .jsx grandes, 300–2200 líneas)
├── graphql/                # queries/mutations/subscriptions GENERADOS por Amplify codegen
├── services/               # acceso a datos (API/Storage) por dominio
├── utils/                  # lógica pura con tests (*.test.js)
└── images/                 # logos, fondos de certificado, logobase64.js para PDFs
amplify/backend/api/libroaccionistas/schema.graphql   # FUENTE DE VERDAD del modelo de datos
```

### Archivos generados / sensibles — no editar a mano
- `src/graphql/*.js`, `src/graphql/schema.json`: se regeneran con `amplify codegen` / `amplify push`
  tras cambiar `schema.graphql`. Si se necesita una query personalizada, crearla en un archivo aparte
  (p. ej. `src/graphql/customQueries.js`), no dentro de los generados.
- `src/aws-exports.js`, `src/amplifyconfiguration.json`: config del entorno (gitignored). No commitear ni imprimir su contenido.
- `amplify/#current-cloud-backend`, `amplify-meta.json`, `team-provider-info.json`: estado de Amplify CLI.
- **Nunca** ejecutar `amplify push`, `amplify publish` ni cambiar recursos AWS sin confirmación explícita: afecta datos reales.

## Perfiles (grupos Cognito)

El perfil se lee con `perfilDe(usuario)` (`cognito:groups[0]`) en `App.js`; menús y rutas por perfil están en `src/components/navegacion.js` (`ACCESO`).

| Perfil | Acceso |
|---|---|
| `Administrador` | Mantenimiento completo, parámetros |
| `BackOffice` | Ingreso de operaciones (quedan *Pendiente*) |
| `Aprobador` | Revisa en `blotter` y aprueba / rechaza / anula |
| `Accionista` | Solo `accionista-dashboard` (sus acciones, certificado y registro en asambleas) |

El control de acceso es **solo en el frontend**; el API usa `@auth(rules: [{allow: public}])` (API_KEY).
Al agregar pantallas: registrar la vista en `VISTAS` (`App.js`) y su ruta/menú en `ACCESO` de `navegacion.js` para cada perfil que la use. Un usuario sin grupo ve "Usuario sin perfil asignado".

---

## Modelo de dominio

Prefijos de campos por entidad: `acc_` Accionista, `tit_` Titulo, `ope_` Operacion, `pn_` PersonaNatural,
`pj_` PersonaJuridica, `her_` Heredero, `tit_ope_` TituloPorOperacion, `acc_ope_` AccionistaOperacion. Respetarlos.

- **Accionista** (`id` = número de identificación). `acc_tipo_persona`: 0 natural, 1 jurídica (datos extra en
  `PersonaNatural`/`PersonaJuridica`/`Conyuge` con el mismo `id`). `acc_cantidad_acciones`, `acc_participacion`
  (= acciones / `cantidadEmitida`). `acc_tipo_acciones`: 0 ordinarias sin canjear, 1 canjeadas.
  `acc_estado`: 1 activo, 3 bloqueado.
- **Titulo**: bloque contiguo de acciones `tit_desde`..`tit_hasta` (`tit_acciones`) de un accionista.
  Árbol jerárquico vía `tit_padre` / `tit_nivel`. El título raíz tiene id fijo **`IDTituloPadreDeTodos`** y su
  `tit_hasta` = total emitido. `tit_estado`: 1 activo, 0 bloqueado.
- **Operacion** + tablas puente `AccionistaOperacion` (quién participa, `acc_ope_detalle`) y `TituloPorOperacion`
  (qué títulos y cuántas acciones).
- **Parametro** (id `'1'`): `cantidadEmitida`, moneda, etc. `ParametroArchive`, `AccionistaArchive`, `TituloArchive`: históricos.
- Otros: `Asamblea`, `AccionistasxJunta` (índice `byAsamblea`), `DividendoNuevo`, `DetalleDividendo`,
  `DividendosAccionista`, `DividendosTitulos`, `Heredero`, `Solicitudes`, `Pais`/`Provincia`/`Ciudad`.

### Códigos de operación (`ope_tipo`) — vista de ingreso

| Código | Tipo | Vista |
|---|---|---|
| 0 | Aumento de Capital | `aumentocapital.jsx` |
| 1 | Bloqueo | `bloqueo.jsx` |
| 2 | Canje | `canje.jsx` |
| 3 | Cesión | `cesion.jsx` |
| 4 | Desbloqueo | `desbloqueo.jsx` |
| 5 | Donación | `donacion.jsx` |
| 6 | Posesión Efectiva | `posesionefectiva.jsx` |
| 7 | Testamento | `testamento.jsx` |

`ope_estado`: 0 Pendiente, 1 Aprobada, 2 Rechazada, 3 Anulada. `ope_motivo_rechazo`: -1 sin rechazo, 1..n según
`motivoRechazo` en `blotter.jsx`.

### Ciclo de vida de una operación
1. **Ingreso** (vista de la operación): crea `Operacion` con `ope_estado: 0`, `ope_ingresador = Auth.user.username`,
   + `AccionistaOperacion` + `TituloPorOperacion`. Los documentos se suben a S3 con `Storage.put(uuid() + nombre)` y se
   guarda la key en `ope_documento`. **Al ingresar no se mueven acciones.**
2. **Aprobación** (`blotter.jsx`, perfil Aprobador): aquí se aplican los efectos — se parten títulos (se reduce el
   título origen y se crea uno hijo con `tit_padre`/`tit_nivel + 1` para el cesionario), se actualizan
   `acc_cantidad_acciones`, `acc_participacion` de todos los accionistas y `Parametro.cantidadEmitida` cuando cambia el capital.
3. **Rechazo**: solo cambia `ope_estado: 2` + motivo/observación.
4. **Anulación** (`ope_estado: 3`): debe revertir exactamente los efectos de la aprobación (funciones `operacionAnular*`).

Al agregar o modificar un tipo de operación, tocar siempre: vista de ingreso, `ope_tipo_letras` y los `switch` de
aprobar/anular en `blotter.jsx`, documentos requeridos mostrados en el diálogo de revisión, y el sidebar.

## Invariantes de negocio (verificar en cada cambio)

- Suma de `tit_acciones` de títulos activos de un accionista = `acc_cantidad_acciones`.
- Suma de acciones de todos los accionistas = `IDTituloPadreDeTodos.tit_hasta` = `Parametro.cantidadEmitida`.
- Los rangos `tit_desde..tit_hasta` no se solapan y `tit_hasta - tit_desde + 1 = tit_acciones`.
- Toda aprobación tiene su anulación simétrica; nunca dejar una operación aprobada sin forma de revertirse.
- No se opera sobre accionistas/títulos bloqueados (`acc_estado 3` / `tit_estado 0`), salvo Desbloqueo.
- Las acciones son enteros (`Int`); participación es `Float` — evitar redondeos al mostrar/calcular dividendos.

## Dividendos (varios repartos por año)

- Cada reparto (`DetalleDividendo`) nace de una asamblea `Realizada` cuya votación del tema `Asamblea.temaDividendo`
  resultó aprobada (`votacionResultadoN`).
- Al **cerrar el quórum** se guarda una foto de todo el libro en `TituloxJunta` (rango, acciones, estados); si no
  existe, se toma al finalizar la asamblea. El reparto usa **solo los títulos de los accionistas presentes**; los
  ausentes se ponen al día con el % acumulado en un reparto posterior al que asistan.
- Asambleas en `Realizada` o `DividendoGenerado` no permiten cambiar asistencia ni votos (`asambleaCerrada`).
- Asistencia (`asambleas.jsx`): lista virtual de accionistas activos con acciones > 0; solo se crea un registro
  `AccionistasxJunta` al marcar Presente o agregar con representante. Leer registros con `accionistasxJuntaByAsamblea`
  (índice), nunca con `listAccionistasxJuntas` + filtro (recorre toda la tabla).
- Tramos (`DividendosTitulos`) de un accionista: leer con `dividendosTitulosByAccionista` (índice `byAccionista`), no con
  `listDividendosTitulos` + filtro. `div_tit_accionista_id` nunca debe quedar vacío (`''`): DynamoDB rechaza la escritura.
- Cambios de dueño (cesión, donación, testamento, posesión efectiva y anulaciones) pasan al nuevo dueño los tramos de
  dividendo **pendientes** de esas acciones (`actualizarDividendosPorTransferencia`); los pagados no se tocan.
- El control es **por rango de acciones y porcentaje**: `DividendosTitulos` guarda `div_tit_periodo`/`desde`/`hasta`/
  `acciones`/`porcentaje` (% del dividendo anual que ese tramo pagó; null = 100).
- Cada reparto declara un % del dividendo anual (`DetalleDividendo.ddiv_porcentaje`; puede ser 0). Cada acción de la
  foto cobra lo que le falta para llegar al % acumulado declarado: quien faltó a un reparto se pone al día en el
  siguiente, y una acción nunca cobra dos veces aunque cambie de dueño. Cálculo puro en `src/utils/dividendos.js`.
- Meta: 100% declarado y 100% cubierto (acciones × %) de `DividendoNuevo.div_acciones_base` en el año.
- `Parametro.valorNominal` se usa para mostrar el capital (acciones × valor nominal); el reparto es proporcional a acciones.
- El flujo antiguo "Nuevo Dividendo" (por porcentaje sin títulos) se eliminó; sus repartos solo se consultan y pagan.
- **Aumento de capital en el año:** se actualiza `div_acciones_base` y los repartos restantes se calculan con el
  nuevo valor por acción.
- **Accionistas o títulos bloqueados:** se calculan, pero quedan `div_tit_estado = 'Retenido'`; el pago requiere
  aprobación en el botón Pagar de la vista dividendos.
- Retención: sobre lo acumulado del beneficiario en el año (la reducción de 3 salarios básicos se aplica una vez).

## Convenciones y cuidados al escribir código

- Seguir el patrón existente de la vista que se edita (MUI v4 `makeStyles`, `Snackbar` + `Alert` para feedback,
  `CircularProgress`/`LinearProgress` para carga). No introducir nuevas librerías de UI/estado sin pedirlo.
- Llamadas al API: `await API.graphql({ query, variables })` o `graphqlOperation(...)`, importando de `../graphql/*`.
  Siempre `await` (o `await Promise.all(...)`) en mutaciones que modifican acciones: hay código heredado que lanza
  `Promise.all` sin `await` (ej. `canje.jsx`) — no copiar ese patrón.
- Listados: se usa `limit: 1000` sin paginar. Para datos que pueden crecer (operaciones, títulos, archivos históricos)
  paginar con `nextToken`.
- No hay transacciones: una aprobación son varias mutaciones secuenciales. Ordenar las escrituras para minimizar
  estados inconsistentes y devolver `true/false` como hacen las funciones `operacion*` del blotter.
- Fechas: se guardan como string `d-m-yyyy` (`ope_fecha`). Mantener el formato al crear registros existentes.
- Comparaciones: el código heredado usa `==`; en código nuevo usar `===` cuidando que los valores comparados tengan el
  mismo tipo (algunos códigos llegan como string, p. ej. `motivoRechazo.value`).
- Quitar `console.log` de datos personales (identificaciones, cuentas bancarias) en código nuevo.
- Las vistas son muy grandes: hacer cambios acotados y leer la sección relevante antes de editar; extraer helpers
  reutilizables a `src/components/` (como `manejoAccionistas.js`) en vez de duplicar lógica.
- Datos personales y bancarios de accionistas: no exponerlos en logs, URLs ni mensajes de error.

## Git

- Rama de trabajo: `develop`; principal: `main`. Commits cortos en español.
