// Contenido de la ayuda (/ayuda). Los perfiles de cada sección se calculan con ACCESO (navegacion.js): una sección
// se muestra a quien puede abrir alguna de sus rutas; sin rutas, a todos. Los documentos requeridos salen de
// DOCUMENTOS_POR_TIPO (los mismos que pide cada pantalla y revisa el blotter).
import { ACCESO, SECCIONES as MENU, CONFIGURACION, OPERACIONES, ALTAS } from '../components/navegacion';
import { DOCUMENTOS_POR_TIPO, MOTIVOS_RECHAZO } from '../services/aprobacion';
import { TAMANO_MAXIMO_MB } from '../utils/archivos';

export const PERFILES = Object.keys(ACCESO);

export const DESCRIPCION_PERFILES = {
  Administrador: 'Acceso completo: mantenimiento de accionistas, ingreso y aprobación de operaciones, asambleas, dividendos, reportes y parámetros del sistema.',
  BackOffice: 'Registra accionistas e ingresa operaciones, que quedan Pendientes hasta que un Aprobador las revise. Gestiona dividendos y consulta reportes.',
  Aprobador: 'Revisa en el Blotter las operaciones ingresadas y las aprueba, rechaza, reenvía o anula. Consulta accionistas y reportes.',
  Accionista: 'Consulta sus acciones, imprime su certificado con código QR, se registra en las asambleas convocadas y descarga los modelos de cartas.',
};

const ARCHIVOS = `Los documentos se cargan solo en PDF, de hasta ${TAMANO_MAXIMO_MB} MB (los modelos de cartas de Parámetros también aceptan Word).`;
const PENDIENTE = 'Al ingresar, la operación queda Pendiente y no mueve acciones: los cambios se aplican cuando un Aprobador la aprueba en el Blotter.';

const ERROR_PDF = { mensaje: 'Solo se permiten documentos PDF…', solucion: `Convierta el archivo a PDF. El tamaño máximo es ${TAMANO_MAXIMO_MB} MB.` };
const ERROR_PENDIENTE = { mensaje: 'El título … ya está en otra operación pendiente.', solucion: 'Espere a que el Aprobador resuelva la operación anterior, o pídale que la rechace.' };

// Manual de una transferencia (cesión, donación, testamento).
const transferencia = (id, ruta, tipo, titulo, cedente, cesionario, descripcion) => ({
  id, ruta, tipo, titulo, grupo: 'Operaciones',
  resumen: `${descripcion} El ${cedente.toLowerCase()} entrega acciones de uno o varios títulos al ${cesionario.toLowerCase()}.`,
  pasos: [
    `Abra + Operaciones → ${titulo} (o el botón + Cesión del encabezado).`,
    `Seleccione el ${cedente.toLowerCase()} (solo aparecen accionistas activos) y el ${cesionario.toLowerCase()}; puede ser un accionista inactivo.`,
    'Marque los títulos a transferir e indique las acciones de cada uno.',
    'Cargue los documentos de respaldo.',
    'Presione Solicitar.',
  ],
  notas: [
    PENDIENTE,
    'Una transferencia parcial (menos acciones que las del título) solo se permite sobre un título; si son varios, deben ir completos.',
    `Al aprobarse, un título parcial se divide: el original se reduce y se crea un título hijo para el ${cesionario.toLowerCase()}.`,
    `Si el ${cedente.toLowerCase()} queda sin acciones pasa a Inactivo; un ${cesionario.toLowerCase()} inactivo vuelve a Activo.`,
    'Los dividendos pendientes de esas acciones pasan al nuevo dueño; los ya pagados no cambian.',
    ARCHIVOS,
  ],
  errores: [
    { mensaje: `El ${cedente.toLowerCase()} y el ${cesionario.toLowerCase()} deben ser distintos.`, solucion: 'Seleccione otro accionista.' },
    { mensaje: 'Una transferencia parcial solo puede hacerse sobre un título…', solucion: 'Transfiera los demás títulos completos o registre otra operación.' },
    { mensaje: 'El título X tiene N acciones; no se pueden transferir M.', solucion: 'Corrija la cantidad.' },
    ERROR_PENDIENTE,
    ERROR_PDF,
  ],
});

const sobreTitulos = (id, ruta, tipo, titulo, resumen, quien, efecto) => ({
  id, ruta, tipo, titulo, grupo: 'Operaciones', resumen,
  pasos: [
    `Abra + Operaciones → ${titulo}.`,
    `Seleccione el accionista (${quien}). Se muestran sus títulos.`,
    'Opcional: cargue el documento de respaldo.',
    'Presione Solicitar.',
  ],
  notas: [PENDIENTE, efecto, 'Al anularse, el cambio se revierte.', ARCHIVOS],
  errores: [{ mensaje: 'ya tiene una solicitud … pendiente de aprobación.', solucion: 'Espere a que el Aprobador resuelva la solicitud anterior.' }, ERROR_PDF],
});

const SECCIONES = [
  // ---- Primeros pasos ------------------------------------------------------------------------
  {
    id: 'inicio', titulo: 'Cómo usar el sistema', grupo: 'Primeros pasos',
    resumen: 'El Libro de Accionistas registra a los accionistas de UNACEM Ecuador S.A., sus títulos (rangos de acciones) y todas las operaciones sobre ellas, con un flujo de ingreso y aprobación.',
    pasos: [
      'Ingrese con el usuario y la contraseña asignados. El menú lateral y los botones del encabezado dependen de su perfil (vea Perfiles y permisos).',
      'El encabezado muestra en qué pantalla está. El botón ? abre la ayuda de esa pantalla.',
      'Mientras el sistema procesa aparece un aviso "Estamos procesando su solicitud…": espere a que termine antes de continuar.',
      'Para salir use el icono de usuario → Cerrar sesión.',
    ],
    notas: [
      'Si al ingresar ve "Usuario sin perfil asignado", su usuario no tiene un grupo: solicite a un Administrador que se lo asigne.',
      'Si escribe en el navegador la dirección de una pantalla que su perfil no tiene, el sistema lo devuelve a su inicio.',
      ARCHIVOS,
    ],
  },
  { id: 'roles', titulo: 'Perfiles y permisos', grupo: 'Primeros pasos', especial: 'roles', resumen: 'Qué puede ver y hacer cada perfil. La tabla se genera con la configuración real de accesos del sistema.' },
  {
    id: 'ciclo', titulo: 'Ciclo de una operación', grupo: 'Primeros pasos',
    resumen: 'Toda operación sobre acciones pasa por ingreso y aprobación. Nada cambia en el libro hasta que se aprueba.',
    pasos: [
      'Ingreso (BackOffice o Administrador): se registra la operación con sus documentos. Estado Pendiente.',
      'Revisión (Aprobador o Administrador) en el Blotter: revisa los datos y los documentos.',
      'Aprobar: se aplican los efectos (títulos, acciones, participación, capital). Estado Aprobada.',
      'Rechazar: solo cambia el estado a Rechazada, con los motivos y la observación. Se puede Volver a solicitar aprobación y queda Pendiente otra vez.',
      'Anular una aprobada: revierte exactamente lo que hizo la aprobación. Estado Anulada.',
    ],
    notas: [
      'Si los títulos cambiaron después de aprobar (por ejemplo, se volvieron a ceder), la anulación se rechaza con un mensaje en vez de forzarla.',
      'Al aprobar o anular, los certificados vigentes de los accionistas involucrados pasan a Sin vigencia.',
      'No se opera sobre accionistas o títulos bloqueados, salvo con un Desbloqueo.',
    ],
  },

  // ---- Accionistas -----------------------------------------------------------------------------
  {
    id: 'accionistas', rutas: ['/accionistas'], titulo: 'Consulta de accionistas', grupo: 'Accionistas',
    resumen: 'Listado de accionistas por estado, con su detalle de títulos, documentos y certificado.',
    pasos: [
      'Elija el estado (Activos, Bloqueados, Inactivos, Herederos) y busque por nombre o identificación.',
      'El icono Ver detalle muestra las pestañas Información, Documentos y Certificado.',
      'El icono Editar abre la ficha de persona natural o jurídica.',
    ],
    notas: [
      'Estados: Activo (con acciones), Inactivo (sin acciones), Bloqueado (no puede operar), Heredero (creado por una posesión efectiva, con la ficha incompleta).',
      'Desmaterializadas / Ordinarias indica si el accionista ya canjeó sus acciones.',
    ],
  },
  {
    id: 'persona-natural', rutas: ['/personanatural'], titulo: 'Alta y edición de persona natural', grupo: 'Accionistas',
    resumen: 'Ficha de un accionista persona natural: datos personales, contacto, cuenta bancaria, cónyuge, herederos y documentos.',
    pasos: [
      'Abra + Accionista → Persona natural, o Editar desde Accionistas.',
      'Complete los campos obligatorios: código DECEVALE, identificación (cédula o pasaporte), primer nombre y apellido paterno.',
      'Seleccione la nacionalidad y el país de residencia del catálogo: se usan para calcular la retención de dividendos.',
      'Si es casado o vive en unión de hecho, registre al cónyuge.',
      'Use Agregar heredero para registrar a los herederos (identificación y nombre): son los que aparecen en la posesión efectiva.',
      'Cargue los documentos (PDF) y guarde.',
    ],
    notas: [
      'La identificación es el código del accionista y no se cambia al editar.',
      'Un accionista en estado Heredero pasa a Activo al guardar su ficha completa (o a Inactivo si no tiene acciones).',
      'Los datos personales y bancarios son confidenciales.',
    ],
    errores: [{ mensaje: 'El número de identificación ya existe.', solucion: 'El accionista ya está registrado: búsquelo en Accionistas y edítelo.' }, ERROR_PDF],
  },
  {
    id: 'persona-juridica', rutas: ['/personajuridica'], titulo: 'Alta y edición de persona jurídica', grupo: 'Accionistas',
    resumen: 'Ficha de un accionista persona jurídica (RUC): razón social, representante legal, cuenta bancaria y documentos.',
    pasos: [
      'Abra + Accionista → Persona jurídica, o Editar desde Accionistas.',
      'Complete los campos obligatorios: código DECEVALE, RUC y razón social.',
      'Seleccione la nacionalidad y el país de residencia del catálogo.',
      'Cargue el nombramiento del representante legal, el certificado bancario y la carta de actualización de datos (PDF), y guarde.',
    ],
    notas: ['El RUC no se puede cambiar al editar.'],
    errores: [{ mensaje: 'El número de identificación ya existe.', solucion: 'Busque el accionista y edítelo.' }, ERROR_PDF],
  },

  // ---- Operaciones -----------------------------------------------------------------------------
  {
    id: 'aumento-capital', ruta: '/aumentocapital', tipo: 0, titulo: 'Aumento de capital', grupo: 'Operaciones',
    resumen: 'Emite acciones nuevas a favor de un accionista. Al aprobarse crea un título a continuación del último emitido y aumenta el capital.',
    pasos: [
      'Abra + Operaciones → Aumento de capital.',
      'Seleccione el beneficiario.',
      'Ingrese la cantidad de acciones (número entero mayor a 0); se muestra el capital según el valor nominal.',
      'Suba las escrituras (PDF) y presione Solicitar.',
    ],
    notas: [
      PENDIENTE,
      'Al aprobarse se actualiza el total emitido y se recalcula la participación de todos los accionistas.',
      'Si en el año hay repartos de dividendo pendientes, los siguientes repartos se calculan con el nuevo total de acciones.',
      'Solo se puede anular si no hubo aumentos posteriores y si esas acciones aún no cobraron dividendo.',
    ],
    errores: [{ mensaje: 'Ingrese una cantidad de acciones mayor a 0.', solucion: 'Use un número entero positivo.' }, ERROR_PDF],
  },
  transferencia('cesion', '/cesion', 3, 'Cesión', 'Cedente', 'Cesionario', 'Transfiere acciones de un accionista a otro.'),
  transferencia('donacion', '/donacion', 5, 'Donación', 'Donante', 'Donatario', 'Dona acciones a otro accionista.'),
  transferencia('testamento', '/testamento', 7, 'Testamento', 'Testador', 'Beneficiario', 'Transfiere por testamento las acciones del testador.'),
  sobreTitulos('canje', '/canje', 2, 'Canje', 'Convierte las acciones ordinarias (sin canjear) de un accionista en desmaterializadas. No cambia la cantidad de acciones.',
    'activo y con acciones ordinarias', 'Al aprobarse, el accionista queda con acciones desmaterializadas.'),
  sobreTitulos('bloqueo', '/bloqueo', 1, 'Bloqueo', 'Bloquea a un accionista y todos sus títulos: no podrá ceder, donar ni testar hasta que se desbloquee.',
    'activo', 'Al aprobarse, el accionista pasa a Bloqueado y sus títulos se bloquean. Sus dividendos se calculan, pero quedan Retenidos.'),
  sobreTitulos('desbloqueo', '/desbloqueo', 4, 'Desbloqueo', 'Levanta el bloqueo de un accionista y de todos sus títulos.',
    'solo aparecen los bloqueados', 'Al aprobarse, el accionista vuelve a Activo y sus títulos se desbloquean.'),
  {
    id: 'posesion-efectiva', ruta: '/posesionefectiva', tipo: 6, titulo: 'Posesión efectiva', grupo: 'Operaciones',
    resumen: 'Reparte un título de un accionista fallecido (causante) entre sus herederos registrados.',
    pasos: [
      'Verifique que los herederos estén registrados en la ficha del causante (Persona natural → Agregar heredero).',
      'Abra + Operaciones → Posesión efectiva y seleccione el causante y el título.',
      'Asigne las acciones de cada heredero: la suma debe ser igual a las acciones del título.',
      'Revise la columna Registro: "Se creará como heredero" (no es accionista), "Accionista registrado" o "Recibirá como heredero (ficha incompleta)".',
      'Cargue los documentos y presione Solicitar.',
    ],
    notas: [
      PENDIENTE,
      'Se aprueba un título por operación; si el causante tiene varios, registre una posesión por título.',
      'Los herederos nuevos se crean en estado Heredero; pasan a Activo al completar su ficha.',
      'Un heredero que ya es accionista activo debe tener la ficha completa (tipo de persona, ficha natural/jurídica y datos básicos). Los que siguen como Heredero o están Inactivos sin acciones reciben igual, en estado Heredero.',
      'Un heredero bloqueado, o el mismo causante, no puede recibir.',
      'Al aprobarse, el causante que queda sin acciones pasa a Inactivo. La anulación devuelve las acciones al causante.',
    ],
    errores: [
      { mensaje: 'Accionista no válido: … (en la columna Registro)', solucion: 'Complete la ficha del heredero en Accionistas o desbloquéelo, y vuelva a abrir la pantalla.' },
      { mensaje: 'Faltan asignar N acciones / Se asignaron N acciones de más.', solucion: 'Ajuste las cantidades hasta que sumen el título.' },
      { mensaje: 'El causante ya tiene una posesión efectiva pendiente de aprobación.', solucion: 'Espere la revisión de la anterior.' },
      ERROR_PENDIENTE,
    ],
  },

  // ---- Aprobación ------------------------------------------------------------------------------
  {
    id: 'blotter', rutas: ['/blotter'], titulo: 'Blotter: aprobación de operaciones', grupo: 'Aprobación',
    resumen: 'Bandeja de todas las operaciones con su estado. Desde aquí se revisan, aprueban, rechazan, reenvían y anulan.',
    pasos: [
      'Filtre o busque la operación y ábrala para ver el detalle: accionistas, títulos, acciones, herederos y documentos.',
      'Abra cada documento para revisarlo (se abre en otra pestaña).',
      'Pendiente → Aprobar o Rechazar (el rechazo exige al menos un motivo; la observación es opcional).',
      'Rechazada → Volver a solicitar aprobación: queda Pendiente otra vez.',
      'Aprobada → Anular: revierte la operación.',
      'Si falta un documento, puede cargarlo desde el detalle con Guardar documentos.',
    ],
    notas: [
      `Motivos de rechazo: ${MOTIVOS_RECHAZO.map((m) => m.etiqueta).join(', ')}.`,
      'Cada acción pide confirmación. Mientras procesa no cierre la ventana: una aprobación son varias escrituras seguidas.',
      'Antes de aprobar, el sistema vuelve a validar que los títulos sigan perteneciendo al accionista y no estén bloqueados.',
    ],
    errores: [
      { mensaje: 'Alguno de los títulos ya no pertenece al cedente / está bloqueado.', solucion: 'La situación cambió después del ingreso: rechace la operación.' },
      { mensaje: '… no se puede anular automáticamente.', solucion: 'Las acciones ya se movieron después. Anule primero las operaciones posteriores, en orden inverso.' },
      { mensaje: 'Seleccione al menos un motivo de rechazo.', solucion: 'Elija uno o más motivos.' },
    ],
  },

  // ---- Asambleas y dividendos ------------------------------------------------------------------
  {
    id: 'asambleas', rutas: ['/asambleas'], titulo: 'Asambleas', grupo: 'Asambleas y dividendos',
    resumen: 'Convocatoria, asistencia, quórum, votaciones y cierre de las juntas de accionistas.',
    pasos: [
      'Crear asamblea: tipo, lugar, enlace, fecha, hora y temas. Marque cuál tema decide el reparto de dividendos. Queda en Convocatoria y la ven los accionistas.',
      'Asistencia: lista de accionistas activos con acciones. Use Marcar presentes uno a uno, Marcar todos presentes o Agregar con representante.',
      'Quórum: muestra el porcentaje de acciones presentes; Imprimir quórum. Cerrar quórum guarda la foto de los títulos.',
      'Votaciones: registre el voto de cada presente por tema; se indica si el tema resulta Aprobado (mayoría de las acciones presentes). Imprimir votación.',
      'Documentos: cargue el acta y los demás respaldos (PDF).',
      'Finalizar asamblea: pasa a Realizada. Ya no se puede cambiar la asistencia ni los votos.',
    ],
    notas: [
      'Los accionistas también pueden registrarse desde su portal (Mis acciones).',
      'El reparto de dividendos usa solo los títulos de los accionistas presentes.',
    ],
    errores: [{ mensaje: 'La asamblea está Realizada; no se puede modificar la asistencia ni los votos.', solucion: 'Es el comportamiento esperado una vez finalizada.' }],
  },
  {
    id: 'dividendos', rutas: ['/dividendos'], titulo: 'Dividendos: reparto y pago', grupo: 'Asambleas y dividendos',
    resumen: 'Repartos de dividendo (varios por año) generados desde asambleas, con su detalle, cuadre contable y pago con comprobante.',
    pasos: [
      '+ Reparto desde asamblea: elija el período (año) y una asamblea Realizada con el tema de dividendo aprobado → Consultar.',
      'Ingrese el dividendo total del período, el % del dividendo anual a repartir y la fecha de pago → Calcular → revise → Confirmar reparto.',
      'Abra un reparto para ver el detalle: resumen, beneficiarios (búsqueda, filtro y Excel) y la pestaña Cuadre y fórmula.',
      'Pagar: seleccione al beneficiario y cargue el comprobante (PDF).',
      'Dividendos por accionista: todo lo que tiene por cobrar un accionista; Pagar todo lo pendiente usa un solo comprobante.',
      'Sincronizar pendientes con dueños actuales: asigna los tramos pendientes a quien hoy tiene esas acciones.',
    ],
    notas: [
      'Cada acción cobra lo que le falta para llegar al % acumulado declarado en el año: quien faltó a un reparto se pone al día en el siguiente, y una acción nunca cobra dos veces.',
      'La retención se calcula con las reglas de Parámetros (persona, residencia, nacionalidad) sobre lo acumulado en el año; cada reparto guarda las reglas con que se calculó.',
      'Los accionistas o títulos bloqueados al corte quedan Retenidos: el pago requiere aprobación.',
    ],
    errores: [
      { mensaje: 'Las acciones de esta asamblea ya cobraron el porcentaje declarado.', solucion: 'Declare un % acumulado mayor o use otra asamblea.' },
      { mensaje: 'No se puede pagar: el dividendo está retenido.', solucion: 'Requiere aprobación del pago retenido.' },
      { mensaje: 'La fecha de corte no puede ser futura.', solucion: 'Use la fecha de hoy o una anterior.' },
    ],
  },

  // ---- Consultas -------------------------------------------------------------------------------
  {
    id: 'reportes', rutas: ['/reportes'], titulo: 'Reportes', grupo: 'Consultas',
    resumen: 'Reportes de solo lectura, en Excel: no modifican ningún dato.',
    pasos: [
      'Libro de accionistas: elija la fecha de corte → Generar → Descargar. Reconstruye el libro a esa fecha.',
      'Listado de accionistas: datos actuales de contacto y acciones → Descargar.',
      'Operaciones: elija el rango de fechas de registro → Descargar.',
    ],
  },
  {
    id: 'mis-acciones', rutas: ['/accionistadashboard'], titulo: 'Mis acciones (portal del accionista)', grupo: 'Consultas',
    resumen: 'Portal del accionista: sus acciones y participación, su certificado, las asambleas convocadas y los modelos de cartas.',
    pasos: [
      'Revise su cantidad de acciones, su participación y sus títulos.',
      'Imprimir certificado: genera un PDF con código QR y código de verificación.',
      'Convocatorias abiertas: Registrarse en la asamblea, en persona o con un representante (nombre, identificación y carta poder en PDF).',
      'Modelos de cartas: ver o descargar los formatos vigentes (no se pueden modificar).',
    ],
    notas: ['Cada certificado deja de estar vigente cuando cambian sus acciones: imprima uno nuevo después de cualquier operación.'],
  },
  {
    id: 'verificacion', titulo: 'Verificación de certificados (QR)', grupo: 'Consultas',
    resumen: 'Cualquier persona puede comprobar la validez de un certificado escaneando su código QR, sin iniciar sesión.',
    pasos: [
      'Escanee el QR del certificado con la cámara del celular, o abra <dirección del sistema>/verificar/<código de verificación>.',
      'La página muestra si el certificado está Vigente o Sin vigencia, el titular, la identificación enmascarada y las acciones a la fecha de emisión.',
    ],
    notas: ['Un certificado pasa a Sin vigencia cuando se aprueba o anula una operación del accionista.'],
  },

  // ---- Configuración ---------------------------------------------------------------------------
  {
    id: 'parametros', rutas: ['/parametros'], titulo: 'Parámetros del sistema', grupo: 'Configuración',
    resumen: 'Capital, salario básico, reglas de retención, catálogo de países, modelos de cartas y validación del libro.',
    pasos: [
      'Capital: total emitido (se actualiza solo con los aumentos de capital) y valor nominal.',
      'Salario básico (SBU): se usa en las reglas de retención.',
      'Retención de dividendos: lista ordenada de reglas por tipo de persona, residencia y nacionalidad (se aplica la primera que coincide: % y SBU a restar). Use el simulador antes de guardar.',
      'Países: catálogo para nacionalidad y residencia. Marque los paraísos fiscales. Un país no se renombra ni se borra: se desactiva.',
      'Modelos de cartas: suba, vea o reemplace los formatos que descargan los accionistas (PDF o Word).',
      'Validación de títulos: revisa que el libro no tenga huecos, solapes ni descuadres.',
    ],
    notas: [
      'Los cambios de las reglas de retención aplican a los repartos nuevos; los anteriores conservan sus reglas.',
      'Ejecute la validación de títulos después de cada jornada de aprobaciones.',
    ],
    errores: [
      { mensaje: 'El código del país debe tener 2 letras (ISO), por ejemplo EC.', solucion: 'Use el código ISO de 2 letras.' },
      { mensaje: 'El país "…" ya existe.', solucion: 'Búsquelo en la tabla y actívelo.' },
    ],
  },

  { id: 'glosario', titulo: 'Glosario', grupo: 'Referencia', especial: 'glosario', resumen: 'Términos y estados usados en el sistema.' },
];

export const GLOSARIO = [
  ['Accionista', 'Persona natural o jurídica dueña de acciones. Su código es su número de identificación.'],
  ['Título', 'Bloque contiguo de acciones (desde–hasta) de un accionista. Al transferir una parte se divide en un título hijo.'],
  ['Total emitido', 'Cantidad total de acciones de la compañía. Solo cambia con un aumento de capital.'],
  ['Participación', 'Acciones del accionista divididas para el total emitido.'],
  ['Acciones ordinarias / desmaterializadas', 'Ordinarias: aún no canjeadas. Desmaterializadas: canjeadas (operación Canje).'],
  ['Estado Activo', 'Accionista con acciones que puede operar.'],
  ['Estado Inactivo', 'Accionista sin acciones. Vuelve a Activo si recibe acciones.'],
  ['Estado Bloqueado', 'Accionista que no puede operar hasta un Desbloqueo. Sus dividendos quedan Retenidos.'],
  ['Estado Heredero', 'Accionista creado por una posesión efectiva, con la ficha incompleta. Pasa a Activo al completar su ficha.'],
  ['Operación Pendiente / Aprobada / Rechazada / Anulada', 'Estados del ciclo de una operación (vea Ciclo de una operación).'],
  ['Causante', 'Accionista fallecido cuyas acciones se reparten en una posesión efectiva.'],
  ['Cedente / cesionario', 'Quien entrega y quien recibe acciones en una cesión (en donación: donante/donatario; en testamento: testador/beneficiario).'],
  ['Quórum', 'Porcentaje de acciones presentes en una asamblea.'],
  ['Reparto', 'Pago de una parte (%) del dividendo anual, aprobado en una asamblea. Puede haber varios por año.'],
  ['Tramo', 'Rango de acciones de un accionista que cobra un reparto (Pendiente, Retenido o Pagado).'],
  ['Retención', 'Impuesto descontado del dividendo según las reglas de Parámetros.'],
  ['SBU', 'Salario básico unificado, usado en las reglas de retención.'],
  ['Paraíso fiscal', 'País marcado en el catálogo como de menor imposición; tiene su propia regla de retención.'],
  ['Certificado', 'PDF con las acciones del accionista y un QR de verificación. Sin vigencia cuando cambian sus acciones.'],
  ['DECEVALE', 'Código del accionista en el depósito centralizado de valores.'],
];

// ---- Funciones -----------------------------------------------------------------------------------

const rutasDe = (s) => s.rutas || (s.ruta ? [s.ruta] : []);

// Perfiles que ven la sección: los que pueden abrir alguna de sus rutas (sin rutas: todos).
export const perfilesDe = (s) => (rutasDe(s).length ? PERFILES.filter((p) => rutasDe(s).some((r) => ACCESO[p].rutas.includes(r))) : PERFILES);

export const SECCIONES_AYUDA = SECCIONES.map((s) => ({
  ...s,
  rutas: rutasDe(s),
  perfiles: perfilesDe(s),
  documentos: s.tipo != null ? DOCUMENTOS_POR_TIPO[s.tipo] : undefined,
}));

export const seccionesDe = (perfil) => SECCIONES_AYUDA.filter((s) => s.perfiles.includes(perfil));

// Sección de ayuda de una pantalla (para el botón ? del encabezado).
export const seccionDeRuta = (path) => (SECCIONES_AYUDA.find((s) => s.rutas.includes(path)) || {}).id || null;

const normal = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const textoDe = (s) => normal([s.titulo, s.resumen, ...(s.pasos || []), ...(s.notas || []), ...(s.documentos || []),
  ...(s.errores || []).flatMap((e) => [e.mensaje, e.solucion]), ...(s.especial === 'glosario' ? GLOSARIO.flat() : [])].join(' '));

// Filtra secciones que contienen todas las palabras buscadas (sin tildes ni mayúsculas).
export function buscarAyuda(secciones, texto) {
  const palabras = normal(texto).split(/\s+/).filter(Boolean);
  if (!palabras.length) return secciones;
  return secciones.filter((s) => { const t = textoDe(s); return palabras.every((p) => t.includes(p)); });
}

// Filas de la matriz de permisos (la primera operación y la primera alta representan a su grupo: mismos permisos).
export const FILAS_PERMISOS = [
  ...Object.values(MENU).map((m) => ({ label: m.label, path: m.path })),
  { label: 'Ingresar operaciones (8 tipos)', path: OPERACIONES[0].path },
  { label: 'Alta y edición de accionistas', path: ALTAS[0].path },
  { label: CONFIGURACION.label, path: CONFIGURACION.path },
  { label: 'Mis acciones (portal)', path: '/accionistadashboard' },
];

// Matriz de permisos: filas = pantallas/acciones, columnas = perfiles (true si el perfil puede abrir la ruta).
export function matrizPermisos(filas) {
  return filas.map((f) => ({ ...f, perfiles: Object.fromEntries(PERFILES.map((p) => [p, ACCESO[p].rutas.includes(f.path)])) }));
}
