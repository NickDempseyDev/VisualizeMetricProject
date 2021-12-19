import React from "react";
import { useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'; 
import "./CSS/BasicUserData.css";
import { getAllRepoLanguages, getRepos, getReposContributedTo } from "../ApiHelpers";

const BasicData = ({ username }) => {

	const [data, setData] = useState([]);
	const [socialData, setSocialData] = useState([]);
	const [intensiveQueryMode, setIntensiveQueryMode] = useState(false);

	useEffect(() => {
		getAllRepoLanguages(username).then(res => {
			setData(res);
		});
	}, [username]);

	useEffect(() => {
		switch (intensiveQueryMode) {
			case "high":
				getReposContributedTo(username, true).then(res => {
					setSocialData(res);
				})
				break;

			case "mid":
				getReposContributedTo(username, false).then(res => {
					console.log("less intense");
					console.log(res);
					setSocialData(res);
				})
				break;
			
			default:
				break;
		}
	}, [username, intensiveQueryMode]);

	return (
    <div className="basic-data">
      	<div className="col">
      	  	<h1>How Social is {username}?</h1>
			<p><span style={{color: "red"}}>Intensive</span> = 1 API for every repository {username} has contributed to (including their own repos)</p>
			<p><span style={{color: "yellow"}}>Less Intensive</span> = 1 API for every repository that {username} owns</p>
			<p><span style={{color: "Green"}}>Neither</span> = Do not make the API calls</p>
			<select name="" id="" onChange={(e) => {setIntensiveQueryMode(e.target.value)}}>
			<option disabled value="">Select Query</option>
			<option value="none">Neither</option>
			<option value="high">Intensive (numerous queries, i.e. one for each repo)</option>
			<option value="mid">Less Intensive (numerous queries, but only for owned repos)</option>
			</select>
			
      	</div>
      	<div className="col">
			  <h1>What Languages does {username} use the most?</h1>
		  	<ResponsiveContainer aspect={2} width={"99%"}>
		  		<RadarChart cx="50%" cy="50%" outerRadius="80%" data={data} >
      			  	<PolarGrid />
      			  	<PolarAngleAxis dataKey="name" stroke="white" fontWeight="bold"/>
					<Tooltip></Tooltip>
      			  	<PolarRadiusAxis angle={90 - (360/data.length)} />
      			  	<Radar
      			  	  name="Data"
      			  	  dataKey="value"
      			  	  stroke="#8884d8"
      			  	  fill="#8884d8"
      			  	  fillOpacity={0.6}
      			  	/>
      			</RadarChart>
		  	</ResponsiveContainer>
		</div>
    </div>
  	);
};

export default BasicData;
