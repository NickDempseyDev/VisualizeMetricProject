import React from 'react'
import { login } from '../firebase/config'

const Login = () => {
	return (
		<div>
			<button onClick={login}>Login</button>
		</div>
	)
}

export default Login
