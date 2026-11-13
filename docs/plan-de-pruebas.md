# Plan de pruebas — Libro de Accionistas (UNACEM Ecuador)

**Entorno:** staging. Nunca en prod, porque las pruebas crean y aprueban operaciones reales sobre el libro.
**Ejecución guiada:** [guia-demo-en-vivo.md](guia-demo-en-vivo.md) recorre la mayoría de estos casos en orden, con datos de ejemplo.
**Resultado por caso:** ✅ OK · ❌ Falla (anotar el mensaje) · ⏭ No aplica.

---

## 1. Preparación

| Recurso | Detalle |
|---|---|
| Usuarios Cognito (staging) | Uno por grupo: `Administrador`, `BackOffice`, `Aprobador`, `Accionista`. El usuario del grupo `Accionista` debe tener como **username la identificación** del accionista (el dashboard lo busca así). Un quinto usuario **sin grupo** para la prueba AUT-04 |
| Archivos | `prueba.pdf` (menos de 1 MB), `grande.pdf` (más de 10 MB), `foto.jpg`, `falso.pdf` (un .txt renombrado a .pdf) y un `.docx` (modelos de carta) |
| Navegadores | Chrome en escritorio, y un celular **sin sesión** para escanear el QR |
| Línea base | Parámetros → **Validar rangos**: anotar el total emitido, la suma de acciones y si hay errores |

---

## 2. Matriz de perfiles

| Pantalla / acción | Administrador | BackOffice | Aprobador | Accionista |
|---|:-:|:-:|:-:|:-:|
| Accionistas (listar, ver, editar ficha) | ✔ | ✔ | ✔ | ✘ |
| Alta de persona natural / jurídica | ✔ | ✔ | ✔ | ✘ |
| Ingresar operaciones (8 tipos) | ✔ | ✔ | ✘ | ✘ |
| Blotter (aprobar / rechazar / anular / reenviar) | ✔ | ✘ | ✔ | ✘ |
| Dividendos | ✔ | ✔ | ✘ | ✘ |
| Reportes | ✔ | ✔ | ✔ | ✘ |
| Asambleas | ✔ | ✘ | ✘ | ✘ |
| Configuración (Parámetros) | ✔ | ✘ | ✘ | ✘ |
| Mis acciones (dashboard) | ✘ | ✘ | ✘ | ✔ |
| `/verificar/<id>` (público, sin login) | ✔ | ✔ | ✔ | ✔ |

---

## 3. Casos de prueba

### 3.1 Autenticación y navegación (AUT)
| ID | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| AUT-01 | Login de cada perfil | Ingresar con los 4 usuarios | Cada uno ve el menú de la matriz y llega a su pantalla de inicio (Accionistas, o Mis acciones para el accionista) |
| AUT-02 | Ruta no permitida | BackOffice escribe `/blotter` y Accionista escribe `/accionistas` en la URL | Redirige a su pantalla de inicio; no muestra la vista |
| AUT-03 | Cerrar sesión | Botón de salida del header | Vuelve al login; "atrás" no muestra datos |
| AUT-04 | Usuario sin grupo | Ingresar con el usuario sin grupo | "Usuario sin perfil asignado" |
| AUT-05 | Overlay de carga | Ejecutar cualquier operación lenta (aprobar, generar libro) | Overlay con el mensaje "Estamos procesando su solicitud…"; no deja hacer clic detrás |

### 3.2 Accionistas (ACC)
| ID | Caso | Resultado esperado |
|---|---|---|
| ACC-01 | Alta de persona natural con cónyuge y herederos | Se guarda; aparece en el listado en estado **Activo** con 0 acciones |
| ACC-02 | Alta de persona jurídica (RUC) | Se guarda; el RUC no es editable al editar |
| ACC-03 | Identificación duplicada | "El número de identificación ya existe." |
| ACC-04 | País y nacionalidad | El selector muestra solo los países **activos** del catálogo y conserva el valor actual al editar |
| ACC-05 | Buscar por nombre o identificación | Filtra; el botón Limpiar restablece |
| ACC-06 | Ver detalle (pestañas Información, Documentos, Certificado) | Muestra títulos, documentos y certificado sin errores |
| ACC-07 | Heredero completa su ficha | Un accionista en estado **Heredero** pasa a **Activo** al guardar su ficha (o a Inactivo si tiene 0 acciones) |

### 3.3 Operaciones: ingreso (BackOffice) y blotter (Aprobador)
Ciclo común a todas: **ingreso → Pendiente → aprobar / rechazar → (rechazada) reenviar → (aprobada) anular**.
Al ingresar **no** se mueven acciones; los efectos ocurren al aprobar.

| ID | Operación | Caso | Resultado esperado al aprobar |
|---|---|---|---|
| OPE-01 | Aumento de capital (0) | Beneficiario + acciones + escrituras | Nuevo título a continuación del último emitido; sube el **total emitido** (raíz y Parámetros); se recalcula la participación de todos |
| OPE-02 | Cesión (3), parcial | Un título, menos acciones que las que tiene | El título origen se reduce y nace un título hijo (`tit_padre`) para el cesionario |
| OPE-03 | Cesión (3), varios títulos completos | Dos títulos completos | Los títulos cambian de dueño |
| OPE-04 | Donación (5) | Donante → donatario | Igual que la cesión |
| OPE-05 | Testamento (7) | Testador → beneficiario | Igual que la cesión |
| OPE-06 | Canje (2) | Accionista con acciones ordinarias | El accionista pasa a **desmaterializadas**; las acciones no cambian |
| OPE-07 | Bloqueo (1) | Accionista activo | Accionista **Bloqueado** y todos sus títulos bloqueados |
| OPE-08 | Desbloqueo (4) | Accionista bloqueado | Vuelve a Activo y sus títulos se desbloquean |
| OPE-09 | Posesión efectiva (6) | Causante con herederos registrados; reparto entre 2 herederos | Un título por heredero; el causante queda **Inactivo** si queda en 0; un heredero nuevo se crea en estado **Heredero** |
| OPE-10 | Posesión: chips de registro | Ver la columna "Registro" | "Se creará como heredero" / "Accionista registrado" / "Recibirá como heredero (ficha incompleta)" |
| OPE-11 | Cedente sin acciones | Cesión total | El cedente pasa a **Inactivo** |
| OPE-12 | Rechazo | Rechazar con motivo y observación | Estado **Rechazada**; no se mueven acciones |
| OPE-13 | Reenvío | "Volver a solicitar aprobación" sobre una rechazada | Vuelve a **Pendiente** |
| OPE-14 | Anulación de cada tipo | Anular una aprobada de cada tipo (0–7) | Se revierte exactamente; estado **Anulada**; el libro cuadra |
| OPE-15 | Anulación imposible | Anular una cesión cuyo título ya se volvió a ceder | Mensaje claro ("…no se puede anular automáticamente"), sin cambios |
| OPE-16 | Documentos en el blotter | Ver los documentos de la operación | Abre el PDF en una pestaña nueva |
| OPE-17 | Certificados sin vigencia | Aprobar o anular una operación de un accionista con certificado emitido | Su certificado pasa a **Sin vigencia** |

### 3.4 Validaciones negativas (NEG)
| ID | Caso | Mensaje / comportamiento esperado |
|---|---|---|
| NEG-01 | Subir `foto.jpg` o `falso.pdf` | "Solo se permiten documentos PDF…" |
| NEG-02 | Subir `grande.pdf` (más de 10 MB) | Rechazado por tamaño |
| NEG-03 | Cedente = cesionario | "El cedente y el cesionario deben ser distintos." |
| NEG-04 | Transferencia parcial sobre 2 títulos | "Una transferencia parcial solo puede hacerse sobre un título…" |
| NEG-05 | Transferir más acciones de las que tiene el título | "El título X tiene N acciones; no se pueden transferir M." |
| NEG-06 | Título ya en otra operación pendiente | "El título X ya está en otra operación pendiente." |
| NEG-07 | Segunda posesión efectiva pendiente del mismo causante | "El causante ya tiene una posesión efectiva pendiente de aprobación." |
| NEG-08 | Accionista bloqueado como cedente | No aparece en el selector |
| NEG-09 | Heredero bloqueado o activo con ficha incompleta | Chip rojo "Accionista no válido: …"; el botón Solicitar queda deshabilitado |
| NEG-10 | Reparto de herederos que no suma el título | "Faltan asignar N acciones" o "Se asignaron N acciones de más" |
| NEG-11 | Aumento con 0 o decimales | "Ingrese una cantidad de acciones mayor a 0." |
| NEG-12 | Rechazar sin motivo | "Seleccione al menos un motivo de rechazo." |
| NEG-13 | Anular el aumento si hubo un aumento posterior o sus acciones ya cobraron dividendo | Se rechaza con un mensaje explicativo |

### 3.5 Asambleas (ASA), perfil Administrador
| ID | Caso | Resultado esperado |
|---|---|---|
| ASA-01 | Crear asamblea (lugar, enlace, fecha, hora, temas, tema de dividendo) | Estado **Convocatoria**; visible en el dashboard del accionista |
| ASA-02 | Lista de asistencia | Muestra **todos** los accionistas activos con acciones (no solo 17); búsqueda por nombre o identificación |
| ASA-03 | Marcar presente uno a uno | Sube el contador de registrados |
| ASA-04 | Agregar con representante | Registro con el nombre y la identificación del representante |
| ASA-05 | "Marcar todos presentes" | Marca en lotes; si alguno falla indica cuántos y permite reintentar |
| ASA-06 | Quórum | Gráfico y porcentaje de las acciones presentes; "Imprimir quórum" |
| ASA-07 | Votaciones | Votar Sí/No por tema; el tema de dividendo muestra **Aprobado** con mayoría de acciones presentes |
| ASA-08 | Cerrar quórum | Guarda la foto de los títulos; registra la hora de cierre |
| ASA-09 | Finalizar asamblea | Estado **Realizada**; ya no permite cambiar la asistencia ni los votos |
| ASA-10 | Documentos de la asamblea | Solo PDF; ver y quitar |
| ASA-11 | Imprimir listado y votación | PDF correcto |

### 3.6 Dividendos (DIV)
| ID | Caso | Resultado esperado |
|---|---|---|
| DIV-01 | Reparto desde una asamblea Realizada con el tema de dividendo aprobado | Período, dividendo total, %, fecha de pago → Calcular → Confirmar reparto. Solo cobran los **presentes** |
| DIV-02 | Detalle del reparto | Tarjetas de resumen, barra de pagado, búsqueda, filtro por estado y Excel |
| DIV-03 | Pestaña "Cuadre y fórmula" | Monto = Σ pagos (al centavo); muestra la fórmula y las reglas de retención usadas |
| DIV-04 | Retención | Distinta por persona, residencia y nacionalidad según las reglas de Parámetros (comparar residente / exterior / jurídica) |
| DIV-05 | Pagar un beneficiario con un PDF | Estado **Pagado**; ver el comprobante |
| DIV-06 | Reporte por accionista + "Pagar todo lo pendiente" | Un solo PDF marca pagados todos sus repartos pendientes; Excel |
| DIV-07 | Accionista o título bloqueado al corte | El tramo queda **Retenido**; Pagar exige aprobación |
| DIV-08 | Ausente que asiste a un reparto posterior | Se pone al día con el % acumulado; nunca cobra dos veces |
| DIV-09 | Cambio de dueño con dividendo pendiente | El tramo pendiente pasa al nuevo dueño; los pagados no cambian |
| DIV-10 | Repetir el % ya cobrado | "Las acciones de esta asamblea ya cobraron el porcentaje declarado." |

### 3.7 Certificados y verificación (CER)
| ID | Caso | Resultado esperado |
|---|---|---|
| CER-01 | El accionista imprime su certificado | PDF con QR y código de verificación |
| CER-02 | Escanear el QR desde un celular sin sesión | `/verificar/<id>` muestra **Vigente**, la identificación **enmascarada** y las acciones; no pide login |
| CER-03 | Operación posterior aprobada | El mismo QR muestra **Sin vigencia** |
| CER-04 | id inexistente en la URL | Mensaje de certificado no encontrado, sin errores |
| CER-05 | Recargar la página de verificación | No repite la consulta (sessionStorage) |

### 3.8 Dashboard del accionista (DAS)
| ID | Caso | Resultado esperado |
|---|---|---|
| DAS-01 | Ver mis acciones | Cantidad, participación y títulos coinciden con Accionistas |
| DAS-02 | Registrarse en una convocatoria (con o sin representante y documento PDF) | Queda registrado; el administrador lo ve en la asistencia |
| DAS-03 | Modelos de cartas | Ver o descargar; no hay opción de modificar |

### 3.9 Reportes y Parámetros (REP / PAR)
| ID | Caso | Resultado esperado |
|---|---|---|
| REP-01 | Libro a una fecha → Generar → Descargar | Excel con totales que cuadran con el emitido |
| REP-02 | Listado de accionistas | Excel |
| REP-03 | Operaciones | Excel con los estados correctos |
| PAR-01 | Capital, valor nominal y SBU | Guardar y volver a cargar conserva los valores |
| PAR-02 | Reglas de retención | Editar, simular y guardar. Las 8 reglas cargan completas (la **regla 8 con residencia**) |
| PAR-03 | Países | Crear (código ISO de 2 letras), marcar paraíso fiscal, desactivar. El nombre no es editable; un país duplicado da error |
| PAR-04 | Modelos de cartas | Subir (PDF o Word), ver y descargar |
| PAR-05 | Validar rangos | Sin errores al final de la jornada de pruebas |

---

## 4. Invariantes (verificar al final de cada bloque)

1. Σ acciones de todos los accionistas = total emitido (raíz) = `Parametro.cantidadEmitida` → Parámetros → Validar rangos.
2. Para cada accionista tocado: Σ acciones de sus títulos activos = sus acciones.
3. No hay rangos solapados.
4. Cada operación anulada dejó el libro como antes de aprobarla.
5. En cada reparto, la pestaña de cuadre cuadra al centavo.

## 5. Criterio de aceptación

Todos los casos ✅, o ❌ con una incidencia registrada y aceptada. Las invariantes de la sección 4 en verde y sin errores en la consola del navegador.

## 6. Registro de incidencias

| # | Caso | Descripción / mensaje | Severidad | Estado |
|---|---|---|---|---|
| | | | | |
