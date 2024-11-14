import React, { useState, useEffect } from 'react';
import {AmplifyAuthContainer, AmplifyAuthenticator,AmplifySignIn } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import { Switch, Route, Redirect } from "react-router-dom";
//import logo from './images/logoUNACEMmedMarco.jpg';
import logo from './images/logoUNACEMmedMarco2.png';

import Accionistas from './views/accionistas';
import Cesion from './views/cesion'
import Operaciones from './views/blotter';
import Layout from './components/layout';
import PersonaNatural from './views/personanatural';
import PersonaJuridica from './views/personajuridica';
import PosesionEfectiva from './views/posesionefectiva';
import Pdf from './components/pdf';
import Canje from './views/canje';
import Bloqueo from './views/bloqueo';
import Desbloqueo from './views/desbloqueo';
import Testamento from './views/testamento';
import Donacion from './views/donacion';
import Parametros from './views/parametros';
import Reportes from './views/reportes';
import Asambleas from './views/asambleas';
import Dividendos from './views/dividendos';
import AccionistaDashboard from './views/accionista-dashboard'
import Transferencia from './views/transferencia';
import AccionistasHistorico from './views/accionistas-historico';
import AumentoCapital from './views/aumentocapital';

function App() {

    const [authState, setAuthState] = useState();
    const [user, setUser] = useState();
    const [perfil, setPerfil] = useState();
  
    useEffect(() => {

        return onAuthUIStateChange((nextAuthState, authData) => {

            setAuthState(nextAuthState);            
            setUser(authData)
            
            if(typeof(authData) !== 'undefined')
            {
              if(authData.signInUserSession != null)
              {
                //console.log("DATA USER", authData.signInUserSession);
                setPerfil(authData.signInUserSession.accessToken.payload['cognito:groups'][0]);              
              }
            }
            //setPerfil((typeof(authData.signInUserSession) !== 'undefined')  ? authData.signInUserSession.accessToken.payload['cognito:groups'][0] : "");
        });
    }, []);
    

    return authState === AuthState.SignedIn && user ? perfil === "Accionista" ? (
      <div>            
      <Layout>
        <Switch>
          <Route path="/accionistadashboard">
            <AccionistaDashboard />
          </Route>              
          <Route path="/transferencia">
            <Transferencia />
          </Route>               
          <Route path="/">
            <Redirect to="/accionistadashboard" />
          </Route>       
        </Switch>
      </Layout>
    </div>
    ) : (
        <div>            
          <Layout>
            <Switch>    
              <Route path="/historico">
                <AccionistasHistorico />
              </Route>
              <Route path="/dividendos">
                <Dividendos />
              </Route>  
              <Route path="/asambleas">
                <Asambleas />
              </Route>  
              <Route path="/reportes">
                <Reportes />
              </Route>                                 
              <Route path="/parametros">
                <Parametros />
              </Route>                                 
              <Route path="/testamento">
                <Testamento />
              </Route>                   
              <Route path="/donacion">
                <Donacion />
              </Route> 
              <Route path="/aumentocapital">
                <AumentoCapital />
              </Route>                                        
              <Route path="/desbloqueo">
                <Desbloqueo />
              </Route>                       
              <Route path="/bloqueo">
                <Bloqueo />
              </Route>                   
              <Route path="/canje">
                <Canje />
              </Route>     
              <Route path="/posesionefectiva">
                <PosesionEfectiva />
              </Route>                
              <Route path="/personajuridica">
                <PersonaJuridica />
              </Route>                
              <Route path="/personanatural">
                <PersonaNatural />
              </Route>              
              <Route path="/accionistas">
                <Accionistas />
              </Route>
              <Route path="/cesion">
                <Cesion />
              </Route>
              <Route path="/blotter">
                <Operaciones/>
              </Route>
              <Route path="/">
                <Redirect to="/blotter" />
              </Route>
            </Switch>
          </Layout>
        </div>
    ) : (
      <div style={{backgroundColor:"white",  backgroundImage: `url(${logo})`, backgroundRepeat: "no-repeat", display:'flex', flexDirection:'row',justifyContent:'space-between'}}> 
        <div style={{marginLeft:70, paddingTop:150, marginRight:100}}>
          <p style={{textAlign:"justify"}}> Bienvenidos a la plataforma de representación de acciones en formato
            tokenizado de UNACEM ECUADOR S.A. Sus acciones permanecen en estatus
            desmaterializado, conforme lo indica la Ley de Modernización a la Ley de
            Compañías. 
          </p>
          <p style={{textAlign:"justify"}}>
          El sistema al que usted está accediendo es una tecnología de registro o
          archivo de información virtual tokenizada, los datos se encuentran en
          bloques organizados cronológicamente, la información es distribuida,
          encriptada y verificable en tiempo real.
          </p>
          <p style={{textAlign:"justify"}}>
          Este portal permitirá que sus transacciones sean más eficientes debido al
          ahorro en costos y tiempos, son seguras porque los registros distribuidos
          permiten verificación y aseguran su autenticidad, su identidad está
          protegida criptográficamente y el sistema es completamente
          transparente.   
          </p>
          <p style={{textAlign:"justify"}}>
          Puede acceder a la información de sus acciones en cualquier momento,
          haciendo uso de las credenciales que le han sido asignadas.  
          </p>
          <p style={{textAlign:"justify"}}>
          En UNACEM ECUADOR S.A. estamos comprometidos con la innovación y la
          eficiencia, por eso desarrollamos este aplicativo digital que le permitirá
          tener un canal de acceso a la información amplio y directo.   
          </p>
          <br></br>
          <p style={{textAlign:"justify", color:"#89221C", fontSize:18}}>
           <strong>¡Continuamos construyendo oportunidades juntos!</strong>
          </p>
        </div>
        <AmplifyAuthContainer>
          <AmplifyAuthenticator style={{display: 'flex', justifyContent: 'right', marginRight:50,}}>        
            <AmplifySignIn
              hideSignUp="true" 
              slot="sign-in" 
              headerText="Ingreso al Libro de Accionistas"                            
              submitButtonText="Iniciar Sesión"  
              />
          </AmplifyAuthenticator>
        </AmplifyAuthContainer>
    </div>
  );

}

export default App;
