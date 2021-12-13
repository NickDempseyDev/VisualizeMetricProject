import React from 'react'
import { useEffect, useState } from 'react'
import './UserInput.css'

const UserInput = ({ sendInfoToParent }) => {

	const [username, setUsername] = useState("")
	const [option, setOption] = useState("")

	return (
		<div>
			{/* <div style={{ display: "flex" , flexFlow: "row", height: "50px", justifyContent: "center"}}>
				<input type="text" placeholder='Username' onChange={(e) => {setUsername(e.target.value)}}/>
				<select name="Choose Parameter" id="" onSelect={(e) => {setOption(e.target.value)}}>
					<option value="repos">Get Repos</option>
				</select>
				<button onClick={() => sendInfoToParent({ username, option })}>Run Query</button>
			</div> */}

		</div>
	)
}

export default UserInput
