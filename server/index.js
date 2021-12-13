const express = require("express");
const fetch = require("request");
const { db } = require("./db");
const app = express();
const { firebaseConfig } = require("./secrets");
const { getFirestore, doc, setDoc, getDoc } = require("firebase/firestore");

// Import the functions you need from the SDKs you need
const initializeApp = require("firebase/app");
const { get } = require("request");
const { default: axios } = require("axios");
const { async } = require("@firebase/util");
// const getAnalytics = require("firebase/analytics");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries



// Initialize Firebase
const firebase = initializeApp.initializeApp(firebaseConfig);
// const analytics = getAnalytics.getAnalytics(firebase);

app.get("/", (req, res) => {
	res.send({msg: "hello"})
})

const getRepos = async (username) => {
	const firestore = getFirestore(firebase);
	const users = doc(firestore, `users/${username}`);
	const snapshot = await getDoc(users)

	if (snapshot.exists()) {
		return snapshot.data().repos;
	}
	else {
		let options = {
			method: 'GET',
			headers: {'user-agent': 'node.js'}
		};
		const ret = await axios.get(`https://api.github.com/users/${username}/repos`, options)
		const data = formatRepos(ret.data);
		setDoc(users, {repos: data});
		return data;
	}
}

const formatRepos = (data) => {
	const res = []
	data.forEach(item => {
		res.push({ repoName: `${item.name}`, repoContents: item })
	});
	return res;
}

app.get("/getRepos/:user", (req, res) => {
	getRepos(req.params.user).then((retVal) => {
		res.send({retVal});
	});
})

app.listen(5000, () => {
	console.log("Server listening on port 5000");
})