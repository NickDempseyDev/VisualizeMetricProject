import React from 'react'
// import "./Home.css"
import BasicUserData from './BasicUserData'
import SpecifiedRepoData from './SpecifiedRepoData'
import DataHeader from './DataHeader'
import RepoHeader from './RepoHeader'
import * as helpers from '../ApiHelpers'
import { useState, useEffect } from 'react'

const Home = () => {

	const [username, setUsername] = useState("");
	const [repos, setRepos] = useState([]);
	const [currentRepo, setCurrentRepo] = useState("");

	useEffect(() => {
		setUsername(sessionStorage.getItem("usr"));
	}, []);
	
	useEffect(() => {
		if (username) {
			let tempRepos = [];
			helpers.getRepos(username).then(repos => {
				repos.forEach(repo => {
					tempRepos.push(repo.repoName);
				});
				console.log(tempRepos);
				if (tempRepos.length != 0) {
					setCurrentRepo(tempRepos[0]);
				}
				setRepos(tempRepos);
			});
		}
	}, [username])

	return (
		<div>
			<DataHeader changeUsername={setUsername} username={username}/>
			{username !== "" ? <BasicUserData username={username}/> : <></>}
			{username !== "" && currentRepo !== "" ? <RepoHeader changeRepo={setCurrentRepo} repo={currentRepo} repos={repos}/> : <></>}
			{username !== "" && currentRepo !== "" ? <SpecifiedRepoData username={username} repo={currentRepo} /> : <></>}
		</div>
	)
}

export default Home

