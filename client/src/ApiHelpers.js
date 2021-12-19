import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import axios from "axios";

const firestore = getFirestore();

export const getCommitsOverTime = async (username, repo) => {
  // repos/NickDempseyDev/ADS-Project-2021/commits
  let options = {
    method: "GET",
    //headers: {'user-agent': 'node.js'},
    Authorization: `Bearer ${sessionStorage.getItem("tkn")}`,
  };
  // const ret = await axios.get(`/repos/${username}/${repo}/commits`, options);
  // return ret.data;
  const res = await axios(`/repos/${username}/${repo}/commits`, options)
  const data = res.data;
  let map = {};
  data.forEach(commit => {
    if (!map[(commit.commit.author.date).split("T")[0]]) {
      map[(commit.commit.author.date).split("T")[0]] = 1;
    } else {
      map[(commit.commit.author.date).split("T")[0]] = map[(commit.commit.author.date).split("T")[0]] + 1;
    }
  });
  const entries = Object.entries(map);
  let ret = [];
  entries.forEach(entry => {
    ret.push({ date: entry[0], commits: entry[1] });
  });
  return ret;
}

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
  let total = 0;
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
      total += res[key];
    });
  }
  const newKeys = Object.keys(languages);
  let retObj = [];
  newKeys.forEach((newKey) => {
    retObj.push({ name: newKey, value: parseInt(((languages[newKey] / total) * 100).toFixed(2)) });
  });
  return retObj;
};

export const getContributers = async (username, repo) => {
  let options = {
    method: "GET",
    //headers: {'user-agent': 'node.js'},
    Authorization: `Bearer ${sessionStorage.getItem("tkn")}`,
  };
  const ret = await axios.get(`/repos/${username}/${repo}/contributors`, options);
  return ret.data.length;
}

export const getReposContributedTo = async (username, intensive) => {
  const { data: { data } } = await axios({
    url: '/graphql',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("tkn")}`,
    },
    data: {
      query: `{ 
                user(login: "${username}") 
                { 
                  repositoriesContributedTo(contributionTypes: [COMMIT, REPOSITORY, ISSUE, PULL_REQUEST], last: 100, includeUserRepositories: ${intensive}) 
                  { 
                    pageInfo
                    { 
                     startCursor endCursor hasPreviousPage 
                    } 
                    nodes
                    { 
                      owner { 
                        login 
                      } 
                      name
                    }
                  }
                }
              }`
    }
  })
  let temp = {};
  await data.user.repositoriesContributedTo.nodes.forEach(async (repo) => {
    const res = await getContributers(repo.owner.login, repo.name)
    temp[repo.name] = res;
  });
  console.log(temp);
  return temp;
}

const formatRepos = (data) => {
  const res = [];
  data.forEach((item) => {
    res.push({ repoName: `${item.name}`, repoContents: item });
  });
  return res;
};
