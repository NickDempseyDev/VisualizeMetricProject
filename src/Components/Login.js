import React from "react";
import { login } from "../firebase/config";
import axios from 'axios'
import "./CSS/loginScreen.css"
import { useEffect, useState } from "react";
import { async } from "@firebase/util";

const Login = ({ callBck }) => {

  // onChange in the inputs 
  // useEffect(() => {
  //   effect
  //   return () => {
  //     cleanup
  //   }
  // }, [input])
  let counter = 0;

  const [usernameManual, setUsernameManual] = useState("");
  const [tokenManual, setTokenManual] = useState("");
  const [error, setError] = useState(false);

  const validateUser = async () => {
    const res = await axios(`/users/${usernameManual}`);
    if (res.data.login) {
      return true;
    } else {
      return false;
    }
  }

  const loginManual = () => {
    if (usernameManual != "" && tokenManual != "") {
      validateUser().then(res => {
        if (res) {
          sessionStorage.setItem("usr", usernameManual);
          sessionStorage.setItem("tkn", tokenManual);
          callBck(counter++);
        } else {
          setError(true);
        }
      })
    } else {
      setError(true);
    }
  }

  return (
    <div className="loginScreen">
      <h1 style={{fontSize: "60px"}}>Visualize GitHub Metric Project</h1>
		  <a style={{textDecoration: "none", fontFamily: "Consolas", marginBottom:"30px"}} href="https://github.com/NickDempseyDev">Nick Dempsey</a>
      <button onClick={() => {login(callBck);}}>Login With GitHub</button>
      <h3 style={{color: "white"}}>or</h3>
      {error && <h3 style={{color: "red"}}>Please use a valid username and token combination</h3>}
      <input style={{width:"400px", marginBottom:"2px"}} type="text" placeholder="GitHub username" onChange={(e) => {setUsernameManual(e.target.value)}}/>
      <input style={{width:"400px"}} type="text" placeholder="GitHub access token" onChange={(e) => {setTokenManual(e.target.value)}}/>
      <button style={{width: "10ch"}} onClick={loginManual}>Go!</button>
    </div>
  );
};

export default Login;
