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

// with pagination
export const getCommitsOverTime = async (username, repo) => {
  counter++;
  console.log(counter);

  try {
    let resArr = [];
    let lastPage = 1;
    let resDataArr = [];
    const res = await axios(`/repos/${username}/${repo}/commits?per_page=100&page=1`, getOptions())
    resDataArr.push(res.data);

    if (res.headers.link) {
      lastPage = res.headers.link.split("100&page=")[2].split(">;")[0];
    }

    for (let i = 2; i <= lastPage; i++) {
      const tempRes = await axios(`/repos/${username}/${repo}/commits?per_page=100&page=${i}`, getOptions())
      resDataArr.push(tempRes.data);
    }

    let map = {};

    for (let i = 0; i < resDataArr.length; i++) {
      const dataArr = resDataArr[i];
      for (let j = 0; j < dataArr.length; j++) {
        if (!map[(dataArr[j].commit.author.date).split("T")[0]]) {
          map[(dataArr[j].commit.author.date).split("T")[0]] = 1;
        } else {
          map[(dataArr[j].commit.author.date).split("T")[0]] = map[(dataArr[j].commit.author.date).split("T")[0]] + 1;
        }
      }
    }

    const entries = Object.entries(map);
    let ret = [];
    entries.forEach(entry => {
      ret.push({ date: entry[0], commits: entry[1] });
    });
    console.log(ret);
    return ret;
  } catch (error) {
    console.log(error);
    return [-1, error];
  }

}

export const getAdditionsDeletionsRatios = async (username, repo) => {
  // first get the last date of commit (to the previous Sunday)
  const resA = await axios(`/repos/${username}/${repo}/commits?per_page=100&page=1`, getOptions());
  let resLastCommit;
  if (resA.data.length == 100) {
    const lastPage = resA.headers.link.split("100&page=")[2].split(">;")[0];
    resLastCommit = await axios(`/repos/${username}/${repo}/commits?per_page=100&page=${lastPage}`, getOptions());
  } else {
    resLastCommit = resA;
  }
  let lastCommitDate = new Date(resLastCommit.data[resLastCommit.data.length - 1].commit.author.date);
  let day = lastCommitDate.getDay();
  if( day !== 0 ) {
    lastCommitDate.setHours(-24 * (day));
  }

  // get the first page of activity and check the size, if < 52 continue, otherwise calculate what page the last commit would be on
  const resB = await axios(`/repos/${username}/${repo}/stats/code_frequency?per_page=100&page=1`, getOptions());
  const firstDateInMs = new Date(resB.data[0][0]);
  let firstDate = new Date(firstDateInMs)
  let lastPage;
  if (resB.data.length == 100) {
    let weeks = (lastCommitDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000);
    lastPage = weeks / 100 + (weeks % 100 != 0 ? 1 : 0);
  } else {
    lastPage = 1;
  }
  
  // get the data up until the last commit
  let resBs = [];
  resBs.push(resB.data);
  for (let i = 2; i <= lastPage; i++) {
    const tempData = await axios(`/repos/${username}/${repo}/stats/code_frequency?per_page=100&page=${i}`, getOptions());
    resBs.push(tempData.data);
  }

  // create one big array
  let ret = [];
  for (let i = 0; i < resBs.length; i++) {
    const element = resBs[i];
    for (let j = 0; j < element.length; j++) {
      let elementInner = element[j];
      let temp = elementInner[0]
      let currDate = new Date(temp * 1000);
      elementInner = {
        date: currDate.toISOString().split('T')[0],
        additions: elementInner[1],
        deletions: (elementInner[2] == 0 ? 0 : -elementInner[2])
      };
      ret.push(elementInner);
    }
  }

  // remove any trailing zero entries
  let counter = ret.length - 1;
  while (counter > 0) {
    if (ret[counter]["additions"] == 0 && ret[counter]["deletions"] == 0) {
      ret.pop();
      counter--;
    } else {
      break;
    }
  }

  return ret;
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
    const ret = await axios.get(`/repos/${username}/${repo}/languages?per_page=100`, getOptions());
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
    const ret = await axios.get(`/repos/${username}/${repo}/contributors?per_page=100`, getOptions());
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
