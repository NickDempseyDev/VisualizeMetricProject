import React from 'react'
import { useEffect, useState } from 'react'
import Login from './Components/Login'
import Home from './Components/Home'
import './App.css'

export default function App() {

  const [loginAttempt, setLoginAttempt] = useState(false);
  const [refresh, setRefresh] = useState("")

  useEffect(() => {
  }, [loginAttempt, refresh])

  return (
    <div className='App'>
      {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
      {/* {state.map((item) => {
        return (<pre>{JSON.stringify(item)}</pre>)
      })} */}
      {!sessionStorage.getItem("tkn") ? <Login callBck={setLoginAttempt}/> : <Home setRefresh={setRefresh}/>}
    </div>
  )
}