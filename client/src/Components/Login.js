import React from "react";
import { login } from "../firebase/config";
import "./loginScreen.css"

const Login = ({ callBck }) => {
  return (
    <div style={{display: "block",textAlign: "center", padding: "20% 0px"}}>
      <div className="loginScreen">
        <h1 style={{fontFamily: "Consolas", margin: "0", width: "100%"}}>Visualize GitHub Metric Project</h1>
		    <a style={{textDecoration: "none", fontFamily: "Consolas"}} href="https://github.com/NickDempseyDev">Nick Dempsey</a>
      </div>
      <button style={{margin: "auto"}} onClick={() => {login(callBck);}}>Login</button>
    </div>
  );
};

export default Login;
