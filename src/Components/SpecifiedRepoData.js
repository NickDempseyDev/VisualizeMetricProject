 /* eslint-disable */
import React from "react";
import "./CSS/SpecifiedRepoData.css";
import { ResponsiveContainer, Tooltip, LineChart, CartesianGrid, XAxis, YAxis, Legend, Line, BarChart, ReferenceLine, Brush, Bar } from 'recharts'; 
import { useState, useEffect } from "react";
import * as helpers from '../ApiHelpers'

const SpecifiedRepoData = ({ username, repo }) => {

	const [commitsOverTime, setCommitsOverTime] = useState([]);
  const [activity, setActivity] = useState([]);
  const [oldRepo, setOldRepo] = useState("");

	useEffect(() => {
    if (repo !== oldRepo) {
      helpers.getCommitsOverTime(username, repo).then(res => {setCommitsOverTime(res.reverse())});
      helpers.getAdditionsDeletionsRatios(username, repo).then(res => {setActivity(res)})
      setOldRepo(repo);
    }
	}, [repo, username])


  	return (
    <div className="basic-data">
      <div className="col">
        <h1>Additions vs. Deletions over the lifetime of the repo</h1>
      	<ResponsiveContainer aspect={2} width={"99%"} height={"400px"}>
          <LineChart
            width={500}
            height={200}
            data={activity}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="additions" stroke="#0F0" fill="#82ca9d" />
            <Line type="monotone" dataKey="deletions" stroke="#F00" fill="#82ca9d" />
            <Brush dataKey="date" height={30} stroke="#000" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="col">
        <h1>Total Commits to this repo across its lifetime</h1>
        <ResponsiveContainer aspect={2} width={"99%"} height={"400px"}>
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
            <Brush dataKey="commits" height={30} stroke="#000" />
            <Bar dataKey="commits" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  	);
};

export default SpecifiedRepoData;
