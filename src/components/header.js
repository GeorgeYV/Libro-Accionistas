import { AppBar, Toolbar, Typography, makeStyles,Button } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";

import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';

import {AmplifySignOut } from '@aws-amplify/ui-react';

const useStyles = makeStyles(() => ({
    header: {
      backgroundColor: "#B00020",
      paddingRight: "79px",
      paddingLeft: "20px",
    },
    logo: {
      fontFamily: "Work Sans, sans-serif",
      fontWeight: 600,
      color: "#FFC107",
      textAlign: "left",
      
    },
    menuButton: {
        fontFamily: "Open Sans, sans-serif",
        fontWeight: 400,
        size: "14px",
        marginLeft: "18px",
     },
     toolbar: {
        display: "flex",
        justifyContent: "space-between",
      },
  }));
  

export default function Header() {

    
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
  /*
    const handleChange = (event) => {
      setAuth(event.target.checked);
    };
  */
    const handleMenu = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };



    const headersData = [
        {
          label: "Inicio",
          href: "/Dashboard",
        },
        {
          label: "Accionistas",
          href: "/deposits",
        },
        {
          label: "Operaciones",
          href: "/orders",
        },
        {
          label: "Asambleas",
          href: "/logout",
        },
        {
            label: "Dividendos",
            href: "/logout",
        },
        {
            label: "Reportes",
            href: "/logout",
        },

    ];

    const { header, logo, menuButton, toolbar } = useStyles();

    const displayDesktop = () => {
      return <Toolbar className={toolbar}>
          {libroAccionistasLogo}
           <div>{getMenuButtons()}</div>
            
          <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Mi Perfil</MenuItem>
                <AmplifySignOut/>
              </Menu>
            </div>


          </Toolbar>;
    };
  
    const libroAccionistasLogo = (
      <Typography variant="h6" component="h1" className={logo}>
        Libro de Accionistas
      </Typography>
    );
  
    const getMenuButtons = () => {
        return headersData.map(({ label, href }) => {
          return (
            <Button
              {...{
                key: label,
                color: "inherit",
                to: href,
                component: Link,
                className: menuButton
              }}
            >
              {label}
            </Button>
          );
        });
      };

    return (
      <header>
        <AppBar className={header}>{displayDesktop()}</AppBar>
      </header>
    );
  }