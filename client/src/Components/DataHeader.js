import React from 'react'
import './CSS/DataHeader.css'
import { useState } from 'react'

const DataHeader = ({ changeUsername, username }) => {

	const [currentUsername, setCurrentUsername] = useState(username)

	return (
		<div className='data-header'>
			<div>
				<input onChange={e => setCurrentUsername(e.target.value)} type="text" placeholder='Username...' />
				<button onClick={() => changeUsername(currentUsername)}>search</button>
			</div>
			<h3>{username}</h3>
			<div>
				<button>Logout</button>
			</div>
		</div>
	)
}

export default DataHeader