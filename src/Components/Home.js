import React from 'react'
// import "./Home.css"
import BasicUserData from './BasicUserData'
import SpecifiedRepoData from './SpecifiedRepoData'
import DataHeader from './DataHeader'
import RepoHeader from './RepoHeader'
import * as helpers from '../ApiHelpers'
import { useState, useEffect } from 'react'

const Home = ({ setRefresh }) => {

	const [username, setUsername] = useState("");
	const [repos, setRepos] = useState([]);
	const [currentRepo, setCurrentRepo] = useState("");
	const [isRateLimitExceeded, setIsRateLimitExceeded] = useState(false);

	useEffect(async () => {
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
				setRepos(tempRepos);
				if (tempRepos.length != 0) {
					setCurrentRepo(tempRepos[0]);
				}
			});
		}
	}, [username])

	
	return (
		<div>
			{!isRateLimitExceeded && <DataHeader changeUsername={setUsername} username={username} setRefresh={setRefresh}/>}
			{username !== "" && !isRateLimitExceeded && <BasicUserData username={username} setIsRateLimitExceeded={setIsRateLimitExceeded}/>}
			{username !== "" && currentRepo !== "" && !isRateLimitExceeded && <RepoHeader changeRepo={setCurrentRepo} repo={currentRepo} repos={repos}/>}
			{username !== "" && currentRepo !== "" && !isRateLimitExceeded && <SpecifiedRepoData username={username} repo={currentRepo} />}
			{isRateLimitExceeded && <h1 style={{margin: "0", padding: "1em"}}>Sorry! The rate limited for the GitHub API from your IP address has been reached <br /> <br /> Please try again later (refresh)</h1>}
		</div>
	)
}

export default Home

