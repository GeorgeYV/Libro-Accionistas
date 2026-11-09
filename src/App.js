import React, { useState, useEffect } from 'react';
import { AmplifyAuthContainer, AmplifyAuthenticator, AmplifySignIn, AmplifySignOut } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Box, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import logo from './images/logoUNACEMmedMarco2.png';
import './components/estilosCustomAmplify.css';

import Layout from './components/layout';
import { perfilDe, accesoDe } from './components/navegacion';
import Accionistas from './views/accionistas';
import Cesion from './views/cesion';
import Operaciones from './views/blotter';
import PersonaNatural from './views/personanatural';
import PersonaJuridica from './views/personajuridica';
import PosesionEfectiva from './views/posesionefectiva';
import Canje from './views/canje';
import Bloqueo from './views/bloqueo';
import Desbloqueo from './views/desbloqueo';
import Testamento from './views/testamento';
import Donacion from './views/donacion';
import Parametros from './views/parametros';
import Reportes from './views/reportes';
import Asambleas from './views/asambleas';
import Dividendos from './views/dividendos';
import AccionistaDashboard from './views/accionista-dashboard';
import AumentoCapital from './views/aumentocapital';

// Vista de cada ruta; qué rutas ve cada perfil se define en components/navegacion.js.
const VISTAS = {
  '/blotter': Operaciones,
  '/accionistas': Accionistas,
  '/dividendos': Dividendos,
  '/reportes': Reportes,
  '/asambleas': Asambleas,
  '/parametros': Parametros,
  '/cesion': Cesion,
  '/aumentocapital': AumentoCapital,
  '/bloqueo': Bloqueo,
  '/canje': Canje,
  '/desbloqueo': Desbloqueo,
  '/donacion': Donacion,
  '/posesionefectiva': PosesionEfectiva,
  '/testamento': Testamento,
  '/personanatural': PersonaNatural,
  '/personajuridica': PersonaJuridica,
  '/accionistadashboard': AccionistaDashboard,
};

const PARRAFOS = [
  'Bienvenidos a la plataforma de representación de acciones en formato tokenizado de UNACEM ECUADOR S.A. Sus acciones permanecen en estatus desmaterializado, conforme lo indica la Ley de Modernización a la Ley de Compañías.',
  'El sistema al que usted está accediendo es una tecnología de registro o archivo de información virtual tokenizada, los datos se encuentran en bloques organizados cronológicamente, la información es distribuida, encriptada y verificable en tiempo real.',
  'Este portal permitirá que sus transacciones sean más eficientes debido al ahorro en costos y tiempos, son seguras porque los registros distribuidos permiten verificación y aseguran su autenticidad, su identidad está protegida criptográficamente y el sistema es completamente transparente.',
  'Puede acceder a la información de sus acciones en cualquier momento, haciendo uso de las credenciales que le han sido asignadas.',
  'En UNACEM ECUADOR S.A. estamos comprometidos con la innovación y la eficiencia, por eso desarrollamos este aplicativo digital que le permitirá tener un canal de acceso a la información amplio y directo.',
];

const useStyles = makeStyles((theme) => ({
  ingreso: {
    minHeight: '100vh', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: theme.spacing(4), padding: theme.spacing(4, 6),
    [theme.breakpoints.down('sm')]: { flexDirection: 'column', padding: theme.spacing(3, 2) },
  },
  bienvenida: { maxWidth: 640, '& p': { textAlign: 'justify', marginBottom: theme.spacing(1.5) } },
  lema: { color: '#dd3f5bd6', fontWeight: 600, fontSize: 18, marginTop: theme.spacing(3) },
  sinPerfil: { maxWidth: 480, margin: '15vh auto', padding: theme.spacing(4), textAlign: 'center' },
}));

function Ingreso() {
  const classes = useStyles();
  return (
    <div className={classes.ingreso}>
      <div className={classes.bienvenida}>
        <img src={logo} alt="UNACEM Ecuador" style={{ height: 150, marginBottom: 16 }} />
        {PARRAFOS.map((p) => <Typography key={p.slice(0, 20)} variant="body1" component="p">{p}</Typography>)}
        <Typography className={classes.lema}>¡Continuamos construyendo oportunidades juntos!</Typography>
      </div>
      <AmplifyAuthContainer>
        <AmplifyAuthenticator>
          <AmplifySignIn hideSignUp="true" slot="sign-in" headerText="Ingreso al Libro de Accionistas" submitButtonText="Iniciar Sesión" />
        </AmplifyAuthenticator>
      </AmplifyAuthContainer>
    </div>
  );
}

function SinPerfil() {
  const classes = useStyles();
  return (
    <Paper variant="outlined" className={classes.sinPerfil}>
      <img src={logo} alt="UNACEM Ecuador" style={{ height: 90 }} />
      <Typography variant="h6" gutterBottom>Usuario sin perfil asignado</Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Su usuario no tiene un perfil habilitado en el Libro de Accionistas. Comuníquese con la administración.
      </Typography>
      <Box display="flex" justifyContent="center"><AmplifySignOut buttonText="Cerrar sesión" /></Box>
    </Paper>
  );
}

export default function App() {
  const [authState, setAuthState] = useState();
  const [usuario, setUsuario] = useState();

  useEffect(() => onAuthUIStateChange((estado, datos) => {
    setAuthState(estado);
    setUsuario(datos);
  }), []);

  if (authState !== AuthState.SignedIn || !usuario) return <Ingreso />;

  const perfil = perfilDe(usuario);
  const acceso = accesoDe(perfil);
  if (!acceso) return <SinPerfil />;

  return (
    <Layout perfil={perfil} usuario={usuario.username}>
      <Switch>
        {acceso.rutas.map((path) => <Route key={path} path={path} component={VISTAS[path]} />)}
        <Redirect to={acceso.inicio} />
      </Switch>
    </Layout>
  );
}
