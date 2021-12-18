import React from "react";
import { useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'; 
import "./BasicData.css";
import { getAllRepoLanguages, getRepos } from "../ApiHelpers";

const BasicData = ({ username }) => {

	const [data, setData] = useState([]);

	useEffect(() => {
		getAllRepoLanguages(username).then(res => {
			setData(res);
		});
	}, [username])

	return (
    <div className="basic-data">
      	<div className="col">
      	  	<h1>Title</h1>
      	  	<p>This is the writing that is contained in the box.</p>
      	</div>
      	<div className="col">
		  	<ResponsiveContainer aspect={2} width={"99%"}>
		  		<RadarChart cx="50%" cy="50%" outerRadius="80%" data={data} >
      			  	<PolarGrid />
      			  	<PolarAngleAxis dataKey="name" />
      			  	<PolarRadiusAxis />
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
