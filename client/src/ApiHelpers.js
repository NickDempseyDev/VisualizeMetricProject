import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import axios from "axios";

const firestore = getFirestore();

export const getRepos = async (username) => {
  const user = doc(firestore, `users/${username}`);
  const snapshot = await getDoc(user);

  if (snapshot.exists() && snapshot.data().data) {
    return snapshot.data().data;
  } else {
    let options = {
      method: "GET",
      //headers: {'user-agent': 'node.js'},
      Authorization: `Bearer ${sessionStorage.getItem("tkn")}`,
    };
    try {
      const ret = await axios.get(`/users/${username}/repos`, options);
      const data = formatRepos(ret.data);
      setDoc(user, { data });
      return data;
    } catch (error) {
      return [-1, error];
    }
  }
};

export const getRepoLanguages = async (username, repo) => {
  const user = doc(firestore, `users/${username}`);
  const snapshot = await getDoc(user);
  let options = {
    method: "GET",
    //headers: {'user-agent': 'node.js'},
    Authorization: `Bearer ${sessionStorage.getItem("tkn")}`,
  };
  const ret = await axios.get(`/repos/${username}/${repo}/languages`, options);
  return ret.data;
};

// {
// 	name: js
// 	value: 2131
//}
export const getAllRepoLanguages = async (username) => {
  let languages = {};
  const repos = await getRepos(username);
  for (let index = 0; index < repos.length; index++) {
    const repo = repos[index];
    const res = await getRepoLanguages(username, repo.repoName);
    let keys = Object.keys(res);
    keys.forEach((key) => {
      if (languages[key]) {
        languages[key] += res[key];
      } else {
        languages[key] = res[key];
      }
    });
  }
  const newKeys = Object.keys(languages);
  let retObj = [];
  newKeys.forEach((newKey) => {
    retObj.push({ name: newKey, value: languages[newKey] });
  });
  console.log(retObj);
  return retObj;
};

const formatRepos = (data) => {
  const res = [];
  data.forEach((item) => {
    res.push({ repoName: `${item.name}`, repoContents: item });
  });
  return res;
};
