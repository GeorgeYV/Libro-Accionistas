// Perfiles (grupos Cognito), menús y rutas permitidas: única fuente para App, sidebar y header.
// El control de acceso es solo de interfaz; el API sigue siendo público (API_KEY).
import React from 'react';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import PeopleIcon from '@material-ui/icons/People';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import SettingsIcon from '@material-ui/icons/Settings';
import DescriptionIcon from '@material-ui/icons/Description';
import GroupOutlinedIcon from '@material-ui/icons/GroupOutlined';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import CardGiftcardOutlinedIcon from '@material-ui/icons/CardGiftcardOutlined';
import SyncOutlinedIcon from '@material-ui/icons/SyncOutlined';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined';
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';
import BusinessOutlinedIcon from '@material-ui/icons/BusinessOutlined';
import FunctionsIcon from '@material-ui/icons/Functions';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

// Primer grupo Cognito del usuario autenticado (o null si no tiene).
export function perfilDe(usuario) {
  const sesion = usuario && usuario.signInUserSession;
  const grupos = sesion && sesion.accessToken && sesion.accessToken.payload['cognito:groups'];
  return (grupos && grupos[0]) || null;
}

export const SECCIONES = {
  blotter: { label: 'Blotter', path: '/blotter', icon: <AssignmentTurnedInIcon /> },
  accionistas: { label: 'Accionistas', path: '/accionistas', icon: <PeopleIcon /> },
  dividendos: { label: 'Dividendos', path: '/dividendos', icon: <AttachMoneyIcon /> },
  reportes: { label: 'Reportes', path: '/reportes', icon: <DescriptionIcon /> },
  asambleas: { label: 'Asambleas', path: '/asambleas', icon: <GroupWorkIcon /> },
};
export const CONFIGURACION = { label: 'Configuración', path: '/parametros', icon: <SettingsIcon /> };
export const AYUDA = { label: 'Ayuda', path: '/ayuda', icon: <HelpOutlineIcon /> };

export const OPERACIONES = [
  { label: 'Cesión', path: '/cesion', icon: <SwapHorizIcon color="primary" /> },
  { label: 'Aumento de capital', path: '/aumentocapital', icon: <FunctionsIcon color="primary" /> },
  { label: 'Bloqueo', path: '/bloqueo', icon: <LockOutlinedIcon color="primary" /> },
  { label: 'Canje', path: '/canje', icon: <SyncOutlinedIcon color="primary" /> },
  { label: 'Desbloqueo', path: '/desbloqueo', icon: <LockOpenOutlinedIcon color="primary" /> },
  { label: 'Donación', path: '/donacion', icon: <CardGiftcardOutlinedIcon color="primary" /> },
  { label: 'Posesión efectiva', path: '/posesionefectiva', icon: <GroupOutlinedIcon color="primary" /> },
  { label: 'Testamento', path: '/testamento', icon: <DescriptionOutlinedIcon color="primary" /> },
];

export const ALTAS = [
  { label: 'Persona natural', path: '/personanatural', icon: <PersonAddOutlinedIcon color="primary" /> },
  { label: 'Persona jurídica', path: '/personajuridica', icon: <BusinessOutlinedIcon color="primary" /> },
];

const ETIQUETAS = {
  '/accionistadashboard': 'Mis acciones',
  [CONFIGURACION.path]: CONFIGURACION.label,
  [AYUDA.path]: AYUDA.label,
  ...Object.fromEntries([...Object.values(SECCIONES), ...OPERACIONES, ...ALTAS].map((s) => [s.path, s.label])),
};
export const etiquetaRuta = (path) => ETIQUETAS[path] || '';

const rutas = (lista) => lista.map((s) => s.path);
const ALTAS_RUTAS = rutas(ALTAS); // también se abren desde "Editar" en Accionistas

// Menú lateral, botones del header y rutas que puede abrir cada perfil (incluye las que se abren desde una vista).
export const ACCESO = {
  Administrador: {
    menu: [SECCIONES.blotter, SECCIONES.accionistas, SECCIONES.dividendos, SECCIONES.reportes, SECCIONES.asambleas],
    configuracion: true,
    ingresa: true,
    rutas: [...rutas(Object.values(SECCIONES)), CONFIGURACION.path, ...rutas(OPERACIONES), ...ALTAS_RUTAS],
    inicio: '/accionistas',
  },
  Aprobador: {
    menu: [SECCIONES.blotter, SECCIONES.accionistas, SECCIONES.reportes],
    rutas: [SECCIONES.blotter.path, SECCIONES.accionistas.path, SECCIONES.reportes.path, ...ALTAS_RUTAS],
    inicio: '/accionistas',
  },
  BackOffice: {
    menu: [SECCIONES.accionistas, SECCIONES.dividendos, SECCIONES.reportes],
    ingresa: true,
    rutas: [SECCIONES.accionistas.path, SECCIONES.dividendos.path, SECCIONES.reportes.path, ...rutas(OPERACIONES), ...ALTAS_RUTAS],
    inicio: '/accionistas',
  },
  Accionista: { menu: [], rutas: ['/accionistadashboard'], inicio: '/accionistadashboard' },
};

// Todos los perfiles pueden abrir la ayuda.
Object.values(ACCESO).forEach((a) => a.rutas.push(AYUDA.path));

export const accesoDe = (perfil) => ACCESO[perfil] || null;
