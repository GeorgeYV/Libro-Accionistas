// Página pública (sin inicio de sesión) para verificar un certificado de acciones por su código QR.
import React, { useState, useEffect } from 'react';
import { Paper, Typography, CircularProgress, Box, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import HelpIcon from '@material-ui/icons/Help';
import logo from '../images/logoUNACEMmedMarco2.png';
import { verificarCertificado } from '../services/certificados';

const useStyles = makeStyles((theme) => ({
  fondo: { minHeight: '100vh', backgroundColor: theme.palette.background.default, padding: theme.spacing(4, 2) },
  tarjeta: { maxWidth: 520, margin: '0 auto', padding: theme.spacing(4), textAlign: 'center' },
  estado: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: theme.spacing(1), margin: theme.spacing(3, 0, 2) },
  dato: { display: 'flex', justifyContent: 'space-between', gap: theme.spacing(2), padding: theme.spacing(1, 0), textAlign: 'left' },
}));

const enteros = (n) => new Intl.NumberFormat('en-US').format(n || 0);
const ID_VALIDO = /^[0-9a-f-]{36}$/i;

function Dato({ titulo, valor }) {
  const classes = useStyles();
  return (
    <div className={classes.dato}>
      <Typography variant="body2" color="textSecondary">{titulo}</Typography>
      <Typography variant="body2" style={{ fontWeight: 500 }}>{valor}</Typography>
    </div>
  );
}

export default function Verificacion({ id }) {
  const classes = useStyles();
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [certificado, setCertificado] = useState(null);

  useEffect(() => {
    // Un código mal formado no consulta al servidor.
    if (!ID_VALIDO.test(id || '')) { setEstado('listo'); return; }
    verificarCertificado(id)
      .then((c) => { setCertificado(c); setEstado('listo'); })
      .catch((err) => { console.log('Error al verificar el certificado:', err); setEstado('error'); });
  }, [id]);

  const vigente = certificado && certificado.cer_estado === 'Vigente';

  return (
    <div className={classes.fondo}>
      <Paper variant="outlined" className={classes.tarjeta}>
        <img src={logo} alt="UNACEM Ecuador" style={{ height: 90 }} />
        <Typography variant="subtitle1" color="textSecondary">Verificación de certificado de acciones</Typography>

        {estado === 'cargando' && <Box mt={4}><CircularProgress /></Box>}

        {estado === 'error' && (
          <div className={classes.estado}>
            <HelpIcon color="disabled" />
            <Typography>No se pudo consultar el certificado. Intente nuevamente más tarde.</Typography>
          </div>
        )}

        {estado === 'listo' && !certificado && (
          <div className={classes.estado}>
            <HelpIcon color="disabled" fontSize="large" />
            <Typography variant="h6">Certificado no encontrado</Typography>
          </div>
        )}

        {estado === 'listo' && certificado && (
          <>
            <div className={classes.estado}>
              {vigente
                ? <CheckCircleIcon style={{ color: '#2e7d32' }} fontSize="large" />
                : <ErrorIcon color="primary" fontSize="large" />}
              <Typography variant="h6">{vigente ? 'Certificado válido' : 'Certificado sin vigencia'}</Typography>
            </div>
            {!vigente && (
              <Typography variant="body2" color="textSecondary" paragraph>
                Las acciones o el estado del accionista cambiaron{certificado.cer_fecha_baja ? ` el ${certificado.cer_fecha_baja}` : ''}.
                Solicite un certificado actualizado.
              </Typography>
            )}
            <Divider />
            <Dato titulo="Accionista" valor={certificado.cer_nombre} />
            <Dato titulo="Identificación" valor={certificado.cer_identificacion} />
            <Dato titulo="Acciones" valor={enteros(certificado.cer_acciones)} />
            {certificado.cer_valor_nominal != null && (
              <Dato titulo="Capital (USD)" valor={new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(certificado.cer_acciones * certificado.cer_valor_nominal)} />
            )}
            <Dato titulo="Fecha de emisión" valor={certificado.cer_fecha_emision} />
            <Divider />
            <Typography variant="caption" color="textSecondary" component="p" style={{ marginTop: 12, wordBreak: 'break-all' }}>
              Código: {certificado.id}
            </Typography>
          </>
        )}

        <Typography variant="caption" color="textSecondary" component="p" style={{ marginTop: 16 }}>
          UNACEM ECUADOR S.A. · Plataforma de Accionistas
        </Typography>
      </Paper>
    </div>
  );
}
