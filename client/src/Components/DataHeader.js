import React from 'react'
import './CSS/DataHeader.css'
import { useState } from 'react'

const DataHeader = ({ changeUsername, username, setRefresh }) => {

	const [currentUsername, setCurrentUsername] = useState(username);

	let counter = 1;

	const logout = () => {
		sessionStorage.removeItem("tkn");
		sessionStorage.removeItem("usr");
		setRefresh(counter++);
	}

	return (
		<div className='data-header'>
			<div>
				<input onChange={e => setCurrentUsername(e.target.value)} type="text" placeholder='Username...' />
				<button onClick={() => changeUsername(currentUsername)}>search</button>
			</div>
			<h3>{username}</h3>
			<div>
				<button onClick={logout}>Logout</button>
			</div>
		</div>
	)
}

export default DataHeader