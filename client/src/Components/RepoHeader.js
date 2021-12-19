import React from 'react'
import './CSS/RepoHeader.css'

const RepoHeader = ({ changeRepo, repo, repos }) => {
	return (
		<div className='repo-header'>
			<h3>Current Repository: {repo}</h3>
			<select name="" id="" onChange={(e) => changeRepo(e.target.value)}>
				<option disabled value="">Select Repository</option>
				{repos.map((repo, idx) => {
					return (<option key={idx}>{repo}</option>);
				})}
			</select>
		</div>
	)
}

export default RepoHeader