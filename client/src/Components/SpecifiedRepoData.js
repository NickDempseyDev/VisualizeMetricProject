import React from "react";
import "./CSS/SpecifiedRepoData.css";
import { ResponsiveContainer, Tooltip, LineChart, CartesianGrid, XAxis, YAxis, Legend, Line, BarChart, ReferenceLine, Brush, Bar } from 'recharts'; 
import { useState, useEffect } from "react";
import * as helpers from '../ApiHelpers'

const SpecifiedRepoData = ({ username, repo }) => {

	const [commitsOverTime, setCommitsOverTime] = useState([]);

	useEffect(() => {
		helpers.getCommitsOverTime(username, repo).then(res => {setCommitsOverTime(res.reverse())});
	}, [repo, username])

  	return (
    <div className="basic-data">
      <div className="col">
          <h1>Title</h1>
      	  <p>This is the writing that is contained in the box.</p></div>
      <div className="col">
        <ResponsiveContainer width="100%" height="100%">
		    {/* <LineChart
          width={500}
          height={300}
          data={commitsOverTime}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="commits" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart> */}
        <BarChart
          width={500}
          height={300}
          data={commitsOverTime}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
          <ReferenceLine y={0} stroke="#000" />
          <Brush dataKey="commits" height={30} stroke="#8884d8" />
          <Bar dataKey="commits" fill="#8884d8" />
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  	);
};

export default SpecifiedRepoData;
