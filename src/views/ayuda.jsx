import React, { useMemo, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import {
  Paper, Grid, Typography, TextField, InputAdornment, List, ListItem, ListItemText, ListSubheader, Chip, Button, Divider,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, MenuItem, Avatar, Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';
import SearchIcon from '@material-ui/icons/Search';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import CheckIcon from '@material-ui/icons/Check';
import RemoveIcon from '@material-ui/icons/Remove';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { perfilDe, accesoDe } from '../components/navegacion';
import {
  SECCIONES_AYUDA, PERFILES, DESCRIPCION_PERFILES, GLOSARIO, FILAS_PERMISOS, seccionesDe, buscarAyuda, matrizPermisos,
} from '../ayuda/contenido';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: { ...theme.mixins.toolbar },
  content: { flexGrow: 1, padding: theme.spacing(2) },
  encabezado: { display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), marginBottom: theme.spacing(2), flexWrap: 'wrap' },
  avatar: { backgroundColor: theme.palette.primary.main },
  indice: { position: 'sticky', top: theme.spacing(9), maxHeight: `calc(100vh - ${theme.spacing(12)}px)`, overflow: 'auto' },
  subheader: { backgroundColor: theme.palette.background.paper, lineHeight: '32px', fontWeight: 600 },
  articulo: { padding: theme.spacing(3) },
  bloque: { marginTop: theme.spacing(2.5) },
  lista: { margin: theme.spacing(1, 0, 0), paddingLeft: theme.spacing(3), '& li': { marginBottom: theme.spacing(0.75) } },
  chips: { display: 'flex', gap: theme.spacing(0.5), flexWrap: 'wrap', marginTop: theme.spacing(1) },
  si: { color: theme.palette.success.main },
  no: { color: theme.palette.text.disabled },
}));

function Bloque({ titulo, children }) {
  const classes = useStyles();
  return (
    <div className={classes.bloque}>
      <Typography variant="subtitle2" color="primary">{titulo}</Typography>
      {children}
    </div>
  );
}

function Lista({ items, numerada }) {
  const classes = useStyles();
  const Tag = numerada ? 'ol' : 'ul';
  return <Tag className={classes.lista}>{items.map((t) => <li key={t}><Typography variant="body2">{t}</Typography></li>)}</Tag>;
}

function Roles() {
  const classes = useStyles();
  const matriz = matrizPermisos(FILAS_PERMISOS);
  return (
    <>
      <Bloque titulo="Perfiles">
        {PERFILES.map((p) => (
          <Typography key={p} variant="body2" style={{ marginTop: 8 }}><strong>{p}:</strong> {DESCRIPCION_PERFILES[p]}</Typography>
        ))}
      </Bloque>
      <Bloque titulo="Matriz de permisos">
        <TableContainer>
          <Table size="small" aria-label="Matriz de permisos por perfil">
            <TableHead>
              <TableRow>
                <TableCell>Pantalla / acción</TableCell>
                {PERFILES.map((p) => <TableCell key={p} align="center">{p}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {matriz.map((f) => (
                <TableRow key={f.path}>
                  <TableCell>{f.label}</TableCell>
                  {PERFILES.map((p) => (
                    <TableCell key={p} align="center">
                      {f.perfiles[p] ? <CheckIcon fontSize="small" className={classes.si} aria-label="Sí" /> : <RemoveIcon fontSize="small" className={classes.no} aria-label="No" />}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow>
                <TableCell>Verificación pública de certificados (sin sesión)</TableCell>
                {PERFILES.map((p) => <TableCell key={p} align="center"><CheckIcon fontSize="small" className={classes.si} aria-label="Sí" /></TableCell>)}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Bloque>
      <MuiAlert severity="info" style={{ marginTop: 16 }}>
        Los perfiles corresponden a los grupos de usuario. Para asignar o cambiar el perfil de un usuario, solicítelo al administrador del sistema.
      </MuiAlert>
    </>
  );
}

function Glosario() {
  return (
    <TableContainer className={useStyles().bloque}>
      <Table size="small" aria-label="Glosario">
        <TableBody>
          {GLOSARIO.map(([termino, definicion]) => (
            <TableRow key={termino}>
              <TableCell style={{ width: '30%', fontWeight: 600, verticalAlign: 'top' }}>{termino}</TableCell>
              <TableCell>{definicion}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function Seccion({ seccion, puedeAbrir, onAbrir }) {
  const classes = useStyles();
  const ruta = seccion.rutas.find(puedeAbrir);
  return (
    <Paper className={classes.articulo}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" style={{ gap: 8 }} flexWrap="wrap">
        <div>
          <Typography variant="overline" color="textSecondary">{seccion.grupo}</Typography>
          <Typography variant="h5">{seccion.titulo}</Typography>
        </div>
        {ruta && <Button variant="outlined" color="primary" size="small" endIcon={<OpenInNewIcon />} onClick={() => onAbrir(ruta)}>Ir a la pantalla</Button>}
      </Box>
      <div className={classes.chips}>
        {seccion.perfiles.map((p) => <Chip key={p} size="small" variant="outlined" color="primary" label={p} />)}
      </div>
      <Typography variant="body1" style={{ marginTop: 16 }}>{seccion.resumen}</Typography>

      {seccion.especial === 'roles' && <Roles />}
      {seccion.especial === 'glosario' && <Glosario />}
      {seccion.pasos && <Bloque titulo="Paso a paso"><Lista items={seccion.pasos} numerada /></Bloque>}
      {seccion.documentos && <Bloque titulo="Documentos de respaldo"><Lista items={seccion.documentos} /></Bloque>}
      {seccion.notas && <Bloque titulo="Reglas y consideraciones"><Lista items={seccion.notas} /></Bloque>}
      {seccion.errores && (
        <Bloque titulo="Mensajes frecuentes">
          <TableContainer>
            <Table size="small" aria-label="Mensajes frecuentes">
              <TableHead><TableRow><TableCell>Mensaje</TableCell><TableCell>Qué hacer</TableCell></TableRow></TableHead>
              <TableBody>
                {seccion.errores.map((e) => (
                  <TableRow key={e.mensaje}><TableCell style={{ width: '50%' }}><em>{e.mensaje}</em></TableCell><TableCell>{e.solucion}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Bloque>
      )}
    </Paper>
  );
}

export default function Ayuda() {
  const classes = useStyles();
  const history = useHistory();
  const { hash, search } = useLocation();
  const perfilUsuario = perfilDe(Auth.user);
  const acceso = accesoDe(perfilUsuario) || { rutas: [] };
  const esAdmin = perfilUsuario === 'Administrador';
  const params = new URLSearchParams(search);
  // El Administrador puede ver la ayuda como otro perfil (para capacitar); los demás ven solo la suya.
  const perfil = esAdmin && PERFILES.includes(params.get('perfil')) ? params.get('perfil') : perfilUsuario;
  const verPerfil = params.get('perfil');
  const texto = params.get('q') || '';
  const contenidoRef = useRef(null);

  const propias = useMemo(() => (esAdmin && !verPerfil ? SECCIONES_AYUDA : seccionesDe(perfil)), [esAdmin, perfil, verPerfil]);
  const visibles = useMemo(() => buscarAyuda(propias, texto), [propias, texto]);
  const id = hash.replace('#', '');
  const actual = visibles.find((s) => s.id === id) || visibles[0] || null;

  useEffect(() => { if (contenidoRef.current) contenidoRef.current.scrollIntoView({ block: 'nearest' }); }, [id]);

  const navegar = (cambios, nuevoId = id) => {
    const p = new URLSearchParams(search);
    Object.entries(cambios).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    const q = p.toString();
    history.replace(`/ayuda${q ? `?${q}` : ''}${nuevoId ? `#${nuevoId}` : ''}`);
  };

  const grupos = visibles.reduce((m, s) => m.set(s.grupo, [...(m.get(s.grupo) || []), s]), new Map());

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <div className={classes.encabezado}>
        <Avatar className={classes.avatar}><HelpOutlineIcon /></Avatar>
        <div style={{ flexGrow: 1 }}>
          <Typography variant="h6">Ayuda y manuales de usuario</Typography>
          <Typography variant="body2" color="textSecondary">
            {perfil ? `Contenido para el perfil ${perfil}.` : 'Su usuario no tiene un perfil asignado.'}
            {' '}Use el botón ? del encabezado para abrir la ayuda de la pantalla en la que está.
          </Typography>
        </div>
        {esAdmin && (
          <TextField select size="small" variant="outlined" label="Ver como perfil" style={{ minWidth: 200 }}
            value={verPerfil || ''} onChange={(e) => navegar({ perfil: e.target.value }, '')}>
            <MenuItem value="">Todos (completo)</MenuItem>
            {PERFILES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
        )}
      </div>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper className={classes.indice}>
            <Box p={1.5}>
              <TextField fullWidth size="small" variant="outlined" placeholder="Buscar en la ayuda" value={texto}
                onChange={(e) => navegar({ q: e.target.value }, '')}
                inputProps={{ 'aria-label': 'Buscar en la ayuda' }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
            </Box>
            <Divider />
            <List dense component="nav" aria-label="Índice de la ayuda">
              {[...grupos].map(([grupo, secciones]) => (
                <li key={grupo}>
                  <ul style={{ padding: 0 }}>
                    <ListSubheader className={classes.subheader}>{grupo}</ListSubheader>
                    {secciones.map((s) => (
                      <ListItem key={s.id} button selected={actual && actual.id === s.id} onClick={() => navegar({}, s.id)}>
                        <ListItemText primary={s.titulo} />
                      </ListItem>
                    ))}
                  </ul>
                </li>
              ))}
            </List>
            {visibles.length === 0 && <Box p={2}><Typography variant="body2" color="textSecondary">Sin resultados para "{texto}".</Typography></Box>}
          </Paper>
        </Grid>
        <Grid item xs={12} md={9} ref={contenidoRef}>
          {actual
            ? <Seccion seccion={actual} puedeAbrir={(r) => acceso.rutas.includes(r)} onAbrir={(r) => history.push(r)} />
            : <MuiAlert severity="info">No hay contenido que coincida con la búsqueda.</MuiAlert>}
        </Grid>
      </Grid>
    </main>
  );
}
