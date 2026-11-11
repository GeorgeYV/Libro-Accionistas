// Capa de espera a pantalla completa: bloquea clics y teclado mientras haya un proceso en curso.
import React, { useState, useEffect } from 'react';
import { Modal, Paper, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  // Por encima de diálogos (1300) y avisos (1400).
  modal: { zIndex: theme.zIndex.snackbar + 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fondo: { backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(2px)' },
  fondoInvisible: { backgroundColor: 'transparent' },
  tarjeta: {
    outline: 'none', padding: theme.spacing(4, 5), maxWidth: 360, textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.spacing(2),
  },
}));

// Las esperas muy cortas no muestran la tarjeta (evita parpadeos), pero la pantalla se bloquea desde el inicio.
const RETRASO_MS = 300;

export default function Cargando({ abierto, mensaje = 'Estamos procesando su solicitud' }) {
  const classes = useStyles();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!abierto) { setVisible(false); return undefined; }
    const t = setTimeout(() => setVisible(true), RETRASO_MS);
    return () => clearTimeout(t);
  }, [abierto]);

  return (
    <Modal
      open={!!abierto}
      disableEscapeKeyDown
      className={classes.modal}
      BackdropProps={{ className: visible ? classes.fondo : classes.fondoInvisible }}
    >
      <Paper elevation={visible ? 8 : 0} className={classes.tarjeta} tabIndex={-1} aria-busy="true"
        style={{ visibility: visible ? 'visible' : 'hidden' }}>
        <CircularProgress size={56} thickness={4} aria-label="Cargando" />
        <Typography variant="subtitle1" role="status" aria-live="polite">{mensaje}…</Typography>
        <Typography variant="body2" color="textSecondary">
          Esto puede tardar unos segundos. Por favor, no cierre ni recargue la página.
        </Typography>
      </Paper>
    </Modal>
  );
}
