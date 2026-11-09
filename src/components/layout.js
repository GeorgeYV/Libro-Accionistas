import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core';
import Header from './header';
import SideBar from './sidebar';
import { accesoDe } from './navegacion';

const useStyles = makeStyles({
  root: { display: 'flex' },
  page: { width: '100%', minWidth: 0 },
});

export default function Layout({ perfil, usuario, children }) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const acceso = accesoDe(perfil);
  const conMenu = acceso.menu.length > 0;

  return (
    <div className={classes.root}>
      <Header acceso={acceso} usuario={usuario} conMenu={conMenu} open={open} handleDrawer={() => setOpen(!open)} />
      {conMenu && <SideBar acceso={acceso} open={open} />}
      <div className={classes.page}>{children}</div>
    </div>
  );
}
