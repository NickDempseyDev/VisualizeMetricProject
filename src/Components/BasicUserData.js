 /* eslint-disable */
import React from "react";
import { useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts'; 
import "./CSS/BasicUserData.css";
import { getAllRepoLanguages, getReposContributedTo } from "../ApiHelpers";

const BasicData = ({ username, setIsRateLimitExceeded }) => {

	const [data, setData] = useState("");
	const [socialDisplayData, setSocialDisplayData] = useState("");
	const [intensiveQueryMode, setIntensiveQueryMode] = useState(false);

	useEffect(() => {
		getAllRepoLanguages(username).then(res => {
			if (!Number.isNaN(res[0].value)) {	
				setData(res);
			} else {
				setData("");
				setIsRateLimitExceeded(true);
			}
		});
	}, [username]);

	useEffect(() => {
		switch (intensiveQueryMode) {
			case "high":
				getReposContributedTo(username, true).then(res => {
					const keys = Object.keys(res);
					let sDD = [];
					let countG = 0;
					let countL = 0;
					keys.forEach((key) => {
						if (res[key] <= 1) {
							countL++;
						} else {
							countG++;
						}
					});
					sDD.push({name: "sole contributor repos", value: countL})
					sDD.push({name: "multiple contributor repos", value: countG})
					setSocialDisplayData(sDD);
				})
				break;

			case "mid":
				getReposContributedTo(username, false).then(res => {
					const keys = Object.keys(res);
					let sDD = [];
					let countG = 0;
					let countL = 0;
					keys.forEach((key) => {
						if (res[key] == 1) {
							countL++;
						} else {
							countG++;
						}
					});
					sDD.push({name: "sole contributor repos", value: countL})
					sDD.push({name: "multiple contributor repos", value: countG})
					setSocialDisplayData(sDD);
				})
				break;
			
			default:
				setSocialDisplayData("");
				break;
		}
	}, [username, intensiveQueryMode]);

	const COLORS = ['#6B65A3', '#434343'];
	const RADIAN = Math.PI / 180;
	const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
		const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);
	  
		return (
		  <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
			{`${(percent * 100).toFixed(0)}%`}
		  </text>
		);
	  };

	return (
    <div className="basic-data">
      	<div className="col">
      	  	<h1>How Social is {username}?</h1>
			<p style={{color: "white"}}><span style={{color: "red"}}>Intensive</span> = 1 API for every repository {username} has contributed to (including their own repos)</p>
			<p style={{color: "white"}}><span style={{color: "yellow"}}>Less Intensive</span> = 1 API for every repository that {username} owns</p>
			<p style={{color: "white"}}><span style={{color: "Green"}}>Neither</span> = Do not make the API calls</p>
			<select style={{marginBottom: "10px"}} name="" id="" onChange={(e) => {setIntensiveQueryMode(e.target.value)}}>
			<option disabled value="">Select Query</option>
			<option value="none">Neither</option>
			<option value="high">Intensive (numerous API calls, i.e. one for each repo)</option>
			<option value="mid">Less Intensive (numerous API calls i.e. owned repos only)</option>
			</select>
			{(intensiveQueryMode == "high" || intensiveQueryMode == 'mid') && socialDisplayData !== "" ? 
			<div>
				<p style={{color: "white"}}><span style={{color: COLORS[0]}}>{parseFloat((socialDisplayData[0].value) / (socialDisplayData[0].value + socialDisplayData[1].value) * 100).toFixed(2)}%</span> of repos that {username} has contributed to, they are sole contributor</p>
				<p style={{color: "white"}}><span style={{color: "#000"}}>{parseFloat((socialDisplayData[1].value) / (socialDisplayData[0].value + socialDisplayData[1].value) * 100).toFixed(2)}%</span> of repos that {username} has contributed to, they are one of multiple contributors</p>
			</div> : <></>}
			{(intensiveQueryMode == "high" || intensiveQueryMode == 'mid') && socialDisplayData !== ""? 
			<ResponsiveContainer aspect={3} width={"99%"}>
				<PieChart width={900} height={900}>
         			<Pie
         			  data={socialDisplayData}
         			  cx="50%"
         			  cy="50%"
         			  labelLine={false}
         			  label={renderCustomizedLabel}
         			  outerRadius={80}
         			  fill="#8884d8"
         			  dataKey="value"
         			>
         			  {socialDisplayData.map((entry, index) => (
         			    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
         			  ))}
         			</Pie>
        		</PieChart>
      		</ResponsiveContainer> : <></>}
      	</div>
      	<div className="col">
			<h1>What Languages does {username} use the most?</h1>
		  	{data && <ResponsiveContainer aspect={2} width={"99%"}>
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
		  	</ResponsiveContainer>}
		</div>
    </div>
  	);
};

export default BasicData;
