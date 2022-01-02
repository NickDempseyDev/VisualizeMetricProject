import React from 'react'
import './CSS/DataHeader.css'
import { useState } from 'react'
import { getFirestore, deleteDoc, doc } from "firebase/firestore";
const firestore = getFirestore();

const DataHeader = ({ changeUsername, username, setRefresh, allUsernames }) => {

	const [currentUsername, setCurrentUsername] = useState(username);

	let counter = 1;

	const logout = async () => {
		sessionStorage.removeItem("tkn");
		sessionStorage.removeItem("usr");
		for (let i = 0; i < allUsernames.length; i++) {
			try {
				const user = doc(firestore, `users/${allUsernames[i]}`);
				await deleteDoc(user);	
			} catch (error) {
				continue;
			}
		}
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