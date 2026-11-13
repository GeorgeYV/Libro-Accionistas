# Guía de demostración en vivo — Libro de Accionistas

Recorrido completo de la aplicación en **staging**, con datos ficticios: los 4 perfiles, las 8 operaciones, el ciclo de
aprobación (rechazo, reenvío y anulación), la asamblea, el reparto de dividendos y el pago, el certificado con QR y los reportes.
Duración estimada: **75–90 min**. Los IDs entre corchetes (OPE-02…) son los casos de [plan-de-pruebas.md](plan-de-pruebas.md).

> ⚠️ **Solo staging.** La demo deja datos en el libro: suben 10.000 acciones al emitido y quedan 5 accionistas DEMO.
> Las asambleas, operaciones y dividendos se borran después con `node scripts/limpiar-pruebas.js`. Los accionistas y los
> títulos DEMO quedan; si se quiere el libro como estaba antes, hacer un backup de DynamoDB antes de empezar.

---

## A. Preparación (el día anterior)

### A.1 Usuarios (Cognito staging)
| Usuario | Grupo | Nota |
|---|---|---|
| `demo.admin` | Administrador | |
| `demo.backoffice` | BackOffice | |
| `demo.aprobador` | Aprobador | |
| `9990000001` | Accionista | El username **debe ser** la cédula de Ana (accionista A) |

Tener **cuatro ventanas** de navegador (una por perfil; usar perfiles de Chrome o ventanas de incógnito separadas) y un **celular**.

### A.2 Archivos
`prueba.pdf` (pequeño), `foto.jpg`, `grande.pdf` (más de 10 MB) y `pago.pdf` (comprobante de pago).

### A.3 Personajes (datos ficticios)
| Clave | Nombre | Identificación | Tipo | Nacionalidad / residencia | Papel en la demo |
|---|---|---|---|---|---|
| **A** | DEMO Ana Pérez | 9990000001 | Natural | Ecuatoriana / Ecuador | Recibe el aumento y luego cede, dona y testa |
| **B** | DEMO Bruno Ruiz | 9990000002 | Natural | Colombiana / Colombia | Cesionario, bloqueado y heredero existente |
| **C** | DEMO Carla Díaz | 9990000003 | Natural | Ecuatoriana / Ecuador | Causante de la posesión efectiva |
| **D** | DEMO Diego Díaz | 9990000004 | (se crea solo) | — | Heredero nuevo |
| **E** | DEMO Comercial S.A. | 9990000005001 | Jurídica | Ecuatoriana / Ecuador | Beneficiaria del testamento |

### A.4 Línea base
Con `demo.admin`: Configuración → **Validar rangos**. Anotar el **total emitido** (`T`); al final debe ser `T + 10.000`.

---

## B. Guion

### 1. Perfiles y navegación · 5 min [AUT-01, AUT-02, AUT-05]
1. Ingresar con cada usuario y mostrar que el menú cambia:
   - el **Administrador** ve todo más Configuración;
   - **BackOffice** ve Accionistas, Dividendos, Reportes y el botón de ingreso de operaciones;
   - el **Aprobador** ve Blotter, Accionistas y Reportes;
   - el **Accionista** solo ve "Mis acciones".
2. En la ventana de BackOffice escribir `/blotter` en la URL → redirige a Accionistas.

### 2. Configuración · 5 min [PAR-01..04]
Con `demo.admin` → Configuración:
1. Mostrar el **Capital** (total emitido, valor nominal) y el **SBU**.
2. **Retención de dividendos**: mostrar las 8 reglas y usar el simulador con persona natural / Ecuador y luego con persona natural / exterior.
3. **Países**: abrir Colombia y mostrar el interruptor de paraíso fiscal (no cambiarlo). El nombre no es editable.
4. **Modelos de cartas**: verificar que hay modelos cargados (se descargan en el paso 13).

### 3. Altas de accionistas · 10 min [ACC-01..04, ACC-03]
Con `demo.backoffice` → Persona natural / Persona jurídica:
1. Crear **A**, **B** (residencia **Colombia**) y **E** (persona jurídica, RUC).
2. Crear **C** y, en su ficha, **Agregar heredero**:
   - `9990000004 – DEMO Diego Díaz`
   - `9990000002 – DEMO Bruno Ruiz`
3. **Negativo:** intentar crear otra vez `9990000001` → "El número de identificación ya existe."
4. En Accionistas, buscar "DEMO": los 5 en estado **Activo** con 0 acciones.

### 4. Aumento de capital · 5 min [OPE-01, NEG-01, NEG-02, NEG-11]
1. BackOffice → Aumento de capital, beneficiario **A**:
   - **Negativo:** acciones `0` → "Ingrese una cantidad de acciones mayor a 0."
   - **Negativo:** adjuntar `foto.jpg` y luego `grande.pdf` → los dos se rechazan.
   - Cargar `10000` acciones y adjuntar `prueba.pdf` → **Solicitar**. Mostrar que A **sigue con 0** (al ingresar no se mueve nada).
2. Aprobador → Blotter → abrir la operación, ver el documento → **Aprobar**.
3. Mostrar:
   - A tiene **10.000** acciones y un título nuevo al final de la numeración;
   - el total emitido es `T + 10.000`.

### 5. Certificado con QR (primera emisión) · 3 min [CER-01, CER-02]
1. Ventana Accionista (`9990000001`) → Mis acciones → **imprimir certificado**. Guardar el PDF como **cert-1**.
2. Escanear el QR de cert-1 con el celular (sin sesión): **Vigente**, identificación enmascarada, 10.000 acciones.

### 6. Cesión parcial · 5 min [OPE-02, NEG-03, NEG-05]
1. BackOffice → Cesión: cedente **A**, cesionario **A** → "El cedente y el cesionario deben ser distintos."
2. Cesionario **B**, sobre el título de A, `12000` acciones → error (no se pueden transferir más de 10.000).
3. Corregir a `2000` acciones, adjuntar el PDF → Solicitar.
4. Aprobador → **Aprobar**. Mostrar en el detalle de A:
   - el título se redujo a 8.000;
   - B tiene un título hijo de 2.000.

### 7. Donación: rechazo y reenvío · 5 min [OPE-04, OPE-12, OPE-13, NEG-06, NEG-12]
1. BackOffice → Donación: **A → C**, `3000` acciones → Solicitar.
2. **Negativo:** intentar otra cesión sobre el mismo título de A → "El título … ya está en otra operación pendiente."
3. Aprobador → **Rechazar** sin motivo → "Seleccione al menos un motivo de rechazo." Elegir un motivo y escribir una observación → la operación queda **Rechazada**; las acciones no se movieron.
4. **Volver a solicitar aprobación** → queda Pendiente → **Aprobar**. C tiene 3.000.

### 8. Testamento · 3 min [OPE-05]
BackOffice → Testamento: **A → E**, `1000` acciones → Aprobador aprueba. A queda con **4.000** acciones.

### 9. Canje · 2 min [OPE-06]
BackOffice → Canje sobre **A** → Aprobador aprueba → en Accionistas, A aparece con acciones **Desmaterializadas**.

### 10. Bloqueo y desbloqueo · 5 min [OPE-07, OPE-08, NEG-08]
1. Bloqueo de **B** → aprobar → B queda **Bloqueado** y sus títulos bloqueados.
2. BackOffice → Cesión: B **no aparece** como cedente.
3. Desbloqueo de **B** → aprobar → B vuelve a Activo.

### 11. Posesión efectiva, anulación y nueva solicitud · 12 min [OPE-09, OPE-10, OPE-14, NEG-07, NEG-10]
1. BackOffice → Posesión efectiva: causante **C**, su título de 3.000. La columna **Registro** muestra:
   - D: "Se creará como heredero";
   - B: "Accionista registrado".
2. Reparto: D `2500`, B `1000` → "Se asignaron 500 acciones de más". Corregir a D `2000`, B `1000` → Solicitar.
3. **Negativo:** intentar otra posesión de C → "El causante ya tiene una posesión efectiva pendiente de aprobación."
4. Aprobador → **Aprobar**. Mostrar:
   - C queda **Inactivo** con 0 acciones;
   - **D se creó en estado Heredero** con 2.000;
   - B tiene 4.000.
5. Aprobador → **Anular** la posesión. Mostrar:
   - C recupera sus 3.000;
   - D queda Inactivo con 0;
   - B vuelve a 3.000.
6. BackOffice → ingresar **otra vez** la misma posesión: D muestra "**Recibirá como heredero (ficha incompleta)**". Aprobar.
7. Accionistas → editar **D**, completar su ficha (nombres, nacionalidad, país) y guardar → D pasa a **Activo** [ACC-07].

**Libro DEMO al terminar:** A 4.000 · B 3.000 · C 0 (inactivo) · D 2.000 · E 1.000 = **10.000** ✔

### 12. Validación del libro · 2 min [PAR-05, invariantes]
Configuración → **Validar rangos**: emitido `T + 10.000`, sin rangos solapados, sin errores.

### 13. Asamblea · 12 min [ASA-01..11, DAS-02, DAS-03]
1. Admin → Asambleas → **Crear asamblea**:
   - lugar, enlace, fecha de hoy y hora;
   - temas, con el tema de dividendos marcado como **tema de dividendo**.

   Queda en **Convocatoria**.
2. Ventana Accionista:
   - aparece en "Convocatorias abiertas" → registrarse;
   - descargar un **Modelo de carta** (no hay opción de modificarlo).
3. Admin → Asistencia:
   - buscar "DEMO" y marcar presentes **A, B y D**, uno a uno;
   - mostrar el botón **"Marcar todos presentes"** sin presionarlo, porque incluiría a todos los accionistas de staging en el reparto;
   - agregar a **E con representante** (nombre e identificación ficticios).
4. **Quórum**: mostrar el gráfico → **Imprimir quórum**.
5. **Votaciones**: votar **Sí** al tema de dividendo con los presentes → "Aprobado". Imprimir la votación.
6. **Cerrar quórum** → **Finalizar asamblea** → estado **Realizada**. Mostrar que la asistencia ya no se puede cambiar.

### 14. Reparto y pago de dividendos · 12 min [DIV-01..06, DIV-10]
1. Admin → Dividendos → reparto desde asamblea:
   - Período `2026`, asamblea DEMO → Consultar;
   - Dividendo total del período `10.797.140,80`, % a repartir `50`, fecha de pago de hoy;
   - **Calcular** → revisar → **Confirmar reparto**.

   Con un emitido de 107.971.408 acciones, eso da 0,10 USD por acción en el año; el 50 % es 0,05 por acción. Valores brutos aproximados: A 200, B 150, D 100, E 50. Si `T` es otro, cambian.
2. Abrir el **detalle del reparto**:
   - tarjetas, búsqueda "Bruno", filtro por estado y **Excel**;
   - mostrar que la **retención de B (exterior)** es distinta de la de A [DIV-04];
   - pestaña **Cuadre y fórmula**: el monto cuadra al centavo y muestra las reglas usadas.
3. **Pagar** a B con `pago.pdf` → Pagado; ver el comprobante.
4. Reporte por accionista **A** → **Pagar todo lo pendiente** con un solo PDF → todo Pagado → Descargar Excel.
5. **Negativo:** repetir el reparto con la misma asamblea → "Las acciones de esta asamblea ya cobraron el porcentaje declarado."

### 15. Certificado sin vigencia · 3 min [CER-03, CER-05]
1. Escanear de nuevo el QR de **cert-1**: ahora **Sin vigencia**, porque A cedió, donó y testó después de emitirlo.
2. Accionista → imprimir el certificado **cert-2** → su QR muestra **Vigente** con 4.000 acciones.

### 16. Reportes · 3 min [REP-01..03]
Con `demo.aprobador` (o BackOffice) → Reportes:
- **Libro** a la fecha de hoy → Generar → Descargar;
- **Listado** de accionistas;
- **Operaciones**: aparecen las 9 de la demo con su estado (Aprobada, Anulada, etc.).

### 17. Cierre · 2 min
- Resumen: 8 tipos de operación, el ciclo completo (aprobar, rechazar, reenviar, anular), la asamblea, el reparto y el pago, y el certificado verificable.
- Configuración → Validar rangos en verde.

---

## C. Después de la demo
1. Anotar los resultados en la tabla de incidencias de [plan-de-pruebas.md](plan-de-pruebas.md).
2. Opcional: limpiar asambleas, operaciones y dividendos de staging. Primero en simulación, revisar la salida y después aplicar:
   ```bash
   node scripts/limpiar-pruebas.js
   ```
   ```bash
   node scripts/limpiar-pruebas.js --aplicar
   ```

## D. Plan B durante la demo
| Problema | Qué hacer |
|---|---|
| No se ve una operación en el blotter | Recargar el blotter (F5) |
| La aprobación da un mensaje de validación | Leerlo en voz alta: es parte de la demo (los controles funcionan) y seguir con el siguiente paso |
| El QR no abre en el celular | En una ventana de incógnito, abrir `<dominio>/verificar/<código>` con el código de verificación impreso en el certificado |
| La asamblea no muestra a un DEMO | Debe estar Activo y con acciones (D solo aparece después del paso 11.7) |
