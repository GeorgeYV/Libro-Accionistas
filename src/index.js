import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {BrowserRouter} from "react-router-dom"


import { createTheme,ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";

import Amplify from 'aws-amplify';
import config from './aws-exports';
Amplify.configure(config);


const myTheme = createTheme({
  palette: {
    primary: {
      main: '#ed5761',
    },
    secondary: {
      main: '#404b62',
    },
    background: {
      default: '#f9f9f9',
    }
  },
  typography: {
    fontSize: 12,
  },
});


ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={myTheme}>
      <CssBaseline/>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
