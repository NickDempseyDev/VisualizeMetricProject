import React from "react";
import { login } from "../firebase/config";
import "./CSS/loginScreen.css"

const Login = ({ callBck }) => {
  return (
    <div className="loginScreen">
      <h1>Visualize GitHub Metric Project</h1>
		  <a style={{textDecoration: "none", fontFamily: "Consolas"}} href="https://github.com/NickDempseyDev">Nick Dempsey</a>
      <button onClick={() => {login(callBck);}}>Login</button>
    </div>
  );
};

export default Login;
