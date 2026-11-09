import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import {
  AppBar, Toolbar, Typography, makeStyles, Button, MenuItem, Menu, IconButton, ListItemIcon, ListItemText, Divider,
} from '@material-ui/core';
import clsx from 'clsx';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { AmplifySignOut } from '@aws-amplify/ui-react';
import logo from '../images/Unacem2.png';
import { OPERACIONES, ALTAS, etiquetaRuta } from './navegacion';

const drawerWidth = 240;
const CESION = OPERACIONES[0];

const useStyles = makeStyles((theme) => ({
  appBar: {
    paddingLeft: theme.spacing(7),
    background: 'transparent',
    boxShadow: 'none',
    transition: theme.transitions.create(['width', 'margin'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }),
  },
  sinMenu: { paddingLeft: 0 },
  appBarShift: {
    paddingLeft: 0,
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
  },
  toolBar: { justifyContent: 'space-between', gap: theme.spacing(1) },
  izquierda: { display: 'flex', alignItems: 'center', minWidth: 0 },
  derecha: { display: 'flex', alignItems: 'center', gap: theme.spacing(1) },
  ruta: { color: theme.palette.text.primary },
  rutaBase: { color: theme.palette.text.secondary },
  boton: { borderRadius: 20, textTransform: 'none' },
  texto: { textTransform: 'none' },
  usuario: { color: theme.palette.secondary.main, [theme.breakpoints.down('xs')]: { display: 'none' } },
}));

// Botón que abre un menú de rutas.
function MenuRutas({ titulo, opciones }) {
  const classes = useStyles();
  const history = useHistory();
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <Button color="secondary" size="small" className={classes.texto} endIcon={<ArrowDropDownIcon />} aria-haspopup="true" onClick={(e) => setAnchor(e.currentTarget)}>
        {titulo}
      </Button>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        {opciones.map((o) => (
          <MenuItem key={o.path} onClick={() => { setAnchor(null); history.push(o.path); }}>
            <ListItemIcon>{o.icon}</ListItemIcon>
            <ListItemText primary={o.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default function Header({ acceso, usuario, conMenu, open, handleDrawer }) {
  const classes = useStyles();
  const history = useHistory();
  const { pathname } = useLocation();
  const [anchorCuenta, setAnchorCuenta] = useState(null);

  return (
    <AppBar position="absolute" className={clsx(classes.appBar, !conMenu && classes.sinMenu, conMenu && open && classes.appBarShift)}>
      <Toolbar className={classes.toolBar}>
        {conMenu ? (
          <div className={classes.izquierda}>
            <IconButton edge="start" color="primary" aria-label={open ? 'Contraer menú' : 'Expandir menú'} onClick={handleDrawer}>
              <MenuIcon />
            </IconButton>
            <Typography variant="caption" noWrap>
              <span className={classes.rutaBase}>Libro de Accionistas</span>
              {etiquetaRuta(pathname) && <span className={classes.ruta}> / {etiquetaRuta(pathname)}</span>}
            </Typography>
          </div>
        ) : (
          <div className={classes.izquierda}>
            <img src={logo} alt="UNACEM" width="50" height="50" style={{ marginRight: 15 }} />
            <Typography variant="caption" noWrap className={classes.ruta}>Portal de Accionistas</Typography>
          </div>
        )}

        <div className={classes.derecha}>
          {acceso.ingresa && (
            <>
              <Button variant="contained" color="primary" size="small" className={classes.boton} onClick={() => history.push(CESION.path)}>
                + Cesión
              </Button>
              <MenuRutas titulo="+ Operaciones" opciones={OPERACIONES.slice(1)} />
              <MenuRutas titulo="+ Accionista" opciones={ALTAS} />
            </>
          )}

          {conMenu && <Typography variant="caption" className={classes.usuario}>{usuario}</Typography>}
          <IconButton aria-label="Cuenta del usuario" aria-haspopup="true" color="primary" onClick={(e) => setAnchorCuenta(e.currentTarget)}>
            <AccountCircle />
          </IconButton>
          <Menu anchorEl={anchorCuenta} open={!!anchorCuenta} onClose={() => setAnchorCuenta(null)} getContentAnchorEl={null}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <MenuItem disabled><Typography variant="caption">{usuario}</Typography></MenuItem>
            <Divider />
            <MenuItem disableRipple><AmplifySignOut buttonText="Cerrar sesión" /></MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
}
