import axios from 'axios'
import React from 'react'
import { useEffect, useState } from 'react'
import UserInput from './Components/UserInput'
import Login from './Components/Login'

export default function App() {

  const [state, setState] = useState([])

  useEffect(() => {
    axios.get("https://api.github.com/users/DaithiGeary/repos").then((res) => {
      setState(res.data);
    });
    
  }, [])

  return (
    <div>
      {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
      {state.map((item) => {
        return (<pre>{JSON.stringify(item)}</pre>)
      })}
      {/* <Login/> */}
    </div>
  )
}
