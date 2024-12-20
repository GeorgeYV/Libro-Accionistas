import React, { useState, useEffect } from 'react';
import { ListItem, ListItemIcon, ListItemText, makeStyles, Drawer, List, Divider } from '@material-ui/core';

import { Auth } from 'aws-amplify';

import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import PeopleIcon from '@material-ui/icons/People';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import SettingsIcon from '@material-ui/icons/Settings';
import DescriptionIcon from '@material-ui/icons/Description';
import WebIcon from '@material-ui/icons/Web';
import ArchiveIcon from '@material-ui/icons/Archive';
import clsx from 'clsx';
import { useHistory, useLocation } from 'react-router';
import logo from '../images/Unacem2.png';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  active: {
    background: '#f4f4f4'
  },
}));



export default function Sidebar(props) {

  const open = props.open;
  const classes = useStyles();

  const history = useHistory()
  const location = useLocation()

  const menuItems = [
    {
      label: "Blotter",
      path: "/blotter",
      icon: <AssignmentTurnedInIcon />
    },
    {
      label: "Accionistas",
      path: "/accionistas",
      icon: <PeopleIcon />
    },
    {
      label: "Asambleas",
      path: "/asambleas",
      icon: <GroupWorkIcon />
    },
    {
      label: "Dividendos",
      path: "/dividendos",
      icon: <AttachMoneyIcon />
    },
    {
      label: "Reportes",
      path: "/reportes",
      icon: <DescriptionIcon />
    },
    {
      label: "Libro Histórico",
      path: "/historico",
      icon: <ArchiveIcon />
    },
  ];

  const [perfil, setPerfil] = useState();
  useEffect(() => {
    setPerfil(Auth.user ? Auth.user.signInUserSession.accessToken.payload['cognito:groups'][0] : "");
  }, [perfil]);
  return (
    <div>
      {perfil != "Accionista" &&
        <div>
          <Drawer
            variant="permanent"
            anchor='left'
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            })}
            classes={{
              paper: clsx({
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
              }),
            }}

          >
            <img src={logo} alt="Logo" width='60' height='60' style={{ marginLeft: 5, marginTop: 10, marginBottom: 10 }} />

            <List>
              {menuItems.map(item => (
                <ListItem
                  key={item.label}
                  button
                  onClick={() => history.push(item.path)}
                  className={location.pathname === item.path ? classes.active : (location.pathname === '/' && item.path === '/blotter') ? classes.active : null}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText>{item.label}</ListItemText>
                </ListItem>
              ))}
            </List>
            <Divider />
            <ListItem
              button
              onClick={() => history.push('/parametros')} >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Configuración" />
            </ListItem>
            <Divider />
          </Drawer>
        </div>
      }
    </div>
  )
}

