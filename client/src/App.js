import React from 'react'
import { useEffect, useState } from 'react'
import Login from './Components/Login'
import Home from './Components/Home'

export default function App() {

  const [loginAttempt, setLoginAttempt] = useState(false);

  useEffect(() => {

  }, [loginAttempt])

  return (
    <div style={{position: "absolute", width: "100%", height: "100%"}}>
      {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
      {/* {state.map((item) => {
        return (<pre>{JSON.stringify(item)}</pre>)
      })} */}
      {!sessionStorage.getItem("tkn") ? <Login callBck={setLoginAttempt}/> : <Home/>}
      
    </div>
  )
}