import React from 'react';
import { ListItem, ListItemIcon, ListItemText, makeStyles, Drawer, List, Divider, Tooltip } from '@material-ui/core';
import clsx from 'clsx';
import { useHistory, useLocation } from 'react-router';
import logo from '../images/Unacem2.png';
import { CONFIGURACION, AYUDA } from './navegacion';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  drawer: { width: drawerWidth, flexShrink: 0, whiteSpace: 'nowrap' },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: { width: theme.spacing(9) + 1 },
  },
  logo: { margin: theme.spacing(1.25, 0, 1.25, 0.625) },
  item: {
    '&.Mui-selected': { backgroundColor: theme.palette.action.selected, borderLeft: `3px solid ${theme.palette.primary.main}` },
    '&.Mui-selected .MuiListItemIcon-root': { color: theme.palette.primary.main },
  },
}));

function Opcion({ item, open }) {
  const classes = useStyles();
  const history = useHistory();
  const { pathname } = useLocation();
  return (
    <Tooltip title={open ? '' : item.label} placement="right">
      <ListItem button className={classes.item} selected={pathname === item.path} onClick={() => history.push(item.path)}>
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.label} />
      </ListItem>
    </Tooltip>
  );
}

export default function Sidebar({ acceso, open }) {
  const classes = useStyles();
  const estado = { [classes.drawerOpen]: open, [classes.drawerClose]: !open };
  return (
    <Drawer variant="permanent" anchor="left" className={clsx(classes.drawer, estado)} classes={{ paper: clsx(estado) }}>
      <img src={logo} alt="UNACEM" width="60" height="60" className={classes.logo} />
      <List>
        {acceso.menu.map((item) => <Opcion key={item.path} item={item} open={open} />)}
      </List>
      <Divider />
      <List>
        {acceso.configuracion && <Opcion item={CONFIGURACION} open={open} />}
        <Opcion item={AYUDA} open={open} />
      </List>
    </Drawer>
  );
}
