import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import axios from "axios";

const firestore = getFirestore();

let counter = 0;

const getOptions = () => {
  if (sessionStorage.getItem("tkn") !== "null") { 
    return {
      method: "GET",
      Authorization: `Bearer ${sessionStorage.getItem("tkn")}`
    };
  } else {
    return {
      method: "GET"
    };
  }
}

export const getCommitsOverTime = async (username, repo) => {
  counter++;
  console.log(counter);

  try {
    const res = await axios(`/repos/${username}/${repo}/commits`, getOptions())
    console.log(res);
    const data = res.data;
    let map = {};
    console.log("lenght of arr" ,data.length);
    for (let index = 0; index < data.length; index++) {
      console.log(map);
      if (!map[(data[index].commit.author.date).split("T")[0]]) {
        map[(data[index].commit.author.date).split("T")[0]] = 1;
        console.log(data[index].commit.author.date);
      } else {
        map[(data[index].commit.author.date).split("T")[0]] = map[(data[index].commit.author.date).split("T")[0]] + 1;
        console.log(data[index].commit.author.date);

      }
    }

    // data.forEach(commit => {
    //   if (!map[(commit.commit.author.date).split("T")[0]]) {
    //     map[(commit.commit.author.date).split("T")[0]] = 1;
    //   } else {
    //     map[(commit.commit.author.date).split("T")[0]] = map[(commit.commit.author.date).split("T")[0]] + 1;
    //   }
    // });
    const entries = Object.entries(map);
    let ret = [];
    entries.forEach(entry => {
      ret.push({ date: entry[0], commits: entry[1] });
    });
    console.log(ret);
    return ret;
  } catch (error) {
    return [-1, error];
  }

}

export const getRepos = async (username) => {
  counter++;
  console.log(counter);
  const user = doc(firestore, `users/${username}`);
  const snapshot = await getDoc(user);

  if (snapshot.exists() && snapshot.data().data) {
    return snapshot.data().data;
  } else {
    try {
      const ret = await axios.get(`/users/${username}/repos`, getOptions());
      const data = formatRepos(ret.data);
      setDoc(user, { data });
      return data;
    } catch (error) {
      return [-1, error];
    }
  }
};

export const getRepoLanguages = async (username, repo) => {
  counter++;
  console.log(counter);
  try {
    const ret = await axios.get(`/repos/${username}/${repo}/languages`, getOptions());
    return ret.data; 
  } catch (error) {
    return [-1, error];
  }
};

export const getAllRepoLanguages = async (username) => {
  counter++;
  console.log(counter);
  let languages = {};
  const repos = await getRepos(username);
  let total = 0;
  for (let index = 0; index < repos.length; index++) {
    const repo = repos[index];
    const res = await getRepoLanguages(username, repo.repoName);
    let keys = Object.keys(res);
    for (let i = 0; i < keys.length; i++) {
        if (languages[keys[i]]) {
          languages[keys[i]] += res[keys[i]];
        } else {
          languages[keys[i]] = res[keys[i]];
        }
        total += res[keys[i]];
    }
  }
  const newKeys = Object.keys(languages);
  let retObj = [];
  newKeys.forEach((newKey) => {
    retObj.push({ name: newKey, value: parseInt(((languages[newKey] / total) * 100).toFixed(2)) });
  });
  return retObj;
};

export const getContributers = async (username, repo) => {
  counter++;
  console.log(counter);
  try {
    const ret = await axios.get(`/repos/${username}/${repo}/contributors`, getOptions());
    return ret.data.length;
  } catch (error) {
    return [-1, error];
  }
}

export const getReposContributedTo = async (username, intensive) => {
  counter++;
  console.log(counter);
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
  for (let index = 0; index < data.user.repositoriesContributedTo.nodes.length; index++) {
    const res = await getContributers(data.user.repositoriesContributedTo.nodes[index].owner.login, data.user.repositoriesContributedTo.nodes[index].name);
    temp[data.user.repositoriesContributedTo.nodes[index].name] = res;
  }
  return temp;
}

const formatRepos = (data) => {
  const res = [];
  data.forEach((item) => {
    res.push({ repoName: `${item.name}`, repoContents: item });
  });
  return res;
};
