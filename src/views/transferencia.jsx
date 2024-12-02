import React, {useState,useEffect} from 'react'
import { API, Storage, graphqlOperation, Auth } from 'aws-amplify';

export default function Transferencia(){

    const [userName, setUserName] = useState("");

    useEffect(() => {
        //fetchAccionistas();
    
        let user = Auth.user;     
        setUserName(user.username);
        //console.log('USER',user.username);
    
      }, [])

    return(
        <div>
            Hey Google !!!
        </div>
    )
}