 /* eslint-disable */
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import axios from "axios";

const firestore = getFirestore();

const getOptions = () => {
  if (sessionStorage.getItem("tkn") !== "null") { 
    return {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("tkn")}`
      }
    };
  } else {
    return {
      method: "GET"
    };
  }
}

const storeToDB = async (username, data, label) => {
  const user = doc(firestore, `users/${username}`);
  let obj = {};
  obj[label] = data ? data : "";
  if (obj[label] !== "") {
    setDoc(user, obj, { merge: true });
  }
}

const retrieveFromDB = async (username, label) => {
  const user = doc(firestore, `users/${username}`);
  const snapshot = await getDoc(user);
  if (snapshot.exists() && snapshot.data()[label]) {
    return snapshot.data()[label];
  } else {
    return [-1];
  }
}

export const getUser = async (username) => {
  const dbRes = await retrieveFromDB(username, `${username}`);
  if (dbRes[0] !== -1) {
    return dbRes;
  } else {
    const res = await axios(`https://api.github.com/users/${username}`, getOptions())
    await storeToDB(username, res.data, `${username}`);
    return res.data;
  }
}

// with pagination
export const getCommitsOverTime = async (username, repo) => {

  const dbRes = await retrieveFromDB(username, `${repo}-commits`);
  if (dbRes[0] !== -1) {
    return dbRes;
  } else {
    let lastPage = 1;
    let resDataArr = [];
    const res = await axios(`https://api.github.com/repos/${username}/${repo}/commits?per_page=100&page=1`, getOptions())
    resDataArr.push(res.data);

    if (res.headers.link) {
      lastPage = res.headers.link.split("100&page=")[2].split(">;")[0];
    }

    for (let i = 2; i <= lastPage; i++) {
      const tempRes = await axios(`https://api.github.com/repos/${username}/${repo}/commits?per_page=100&page=${i}`, getOptions())
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
    await storeToDB(username, ret, `${repo}-commits`);
    return ret;
  }
}

export const getAdditionsDeletionsRatios = async (username, repo) => {

  const dbRes = await retrieveFromDB(username, `${repo}-changes`);
  if (dbRes[0] !== -1) {
    return dbRes;
  } else {
    // first get the last date of commit (to the previous Sunday)
    const resA = await axios(`https://api.github.com/repos/${username}/${repo}/commits?per_page=100&page=1`, getOptions());
    let resLastCommit;
    if (resA.data.length === 100) {
      const lastPage = resA.headers.link.split("100&page=")[2].split(">;")[0];
      resLastCommit = await axios(`https://api.github.com/repos/${username}/${repo}/commits?per_page=100&page=${lastPage}`, getOptions());
    } else {
      resLastCommit = resA;
    }
    let lastCommitDate = new Date(resLastCommit.data[resLastCommit.data.length - 1].commit.author.date);
    let day = lastCommitDate.getDay();
    if( day !== 0 ) {
      lastCommitDate.setHours(-24 * (day));
    }
    console.log("here");
    // get the first page of activity and check the size, if < 52 continue, otherwise calculate what page the last commit would be on
    let resB = await axios(`https://api.github.com/repos/${username}/${repo}/stats/code_frequency?per_page=100&page=1`, getOptions());

    if (Object.keys(resB.data).length === 0) {
      return [-1];
    }
    const firstDateInMs = new Date(resB.data[0][0]);
    let firstDate = new Date(firstDateInMs)
    let lastPage;
    if (resB.data.length === 100) {
      let weeks = (lastCommitDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000);
      lastPage = weeks / 100 + (weeks % 100 !== 0 ? 1 : 0);
    } else {
      lastPage = 1;
    }
    
    // get the data up until the last commit
    let resBs = [];
    resBs.push(resB.data);
    for (let i = 2; i <= lastPage; i++) {
      const tempData = await axios(`https://api.github.com/repos/${username}/${repo}/stats/code_frequency?per_page=100&page=${i}`, getOptions());
      resBs.push(tempData.data);
    }
  
    // create one big array for easy display
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
      if (ret[counter]["additions"] === 0 && ret[counter]["deletions"] === 0) {
        ret.pop();
        counter--;
      } else {
        break;
      }
    }
    await storeToDB(username, ret, `${repo}-changes`);
    return ret;
  }

}


export const getRepos = async (username) => {
  const dbRes = await retrieveFromDB(username, "repos");
  if (dbRes[0] !== -1) {
    return dbRes;
  } else {
    const ret = await axios.get(`https://api.github.com/users/${username}/repos`, getOptions());
    const data = formatRepos(ret.data);
    await storeToDB(username, data, "repos");
    return data;
  }
};

export const getRepoLanguages = async (username, repo) => {
  try {
    const ret = await axios.get(`https://api.github.com/repos/${username}/${repo}/languages?per_page=100`, getOptions());
    return ret.data; 
  } catch (error) {
    return [-1, error];
  }
};

export const getAllRepoLanguages = async (username) => {

  const dbRes = await retrieveFromDB(username, "languages");
  if (dbRes[0] !== -1) {
    return dbRes;
  } else {
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
    await storeToDB(username, retObj, "languages");
    return retObj;
  }
};

export const getContributers = async (username, repo) => {
  try {
    const ret = await axios.get(`https://api.github.com/repos/${username}/${repo}/contributors?per_page=100`, getOptions());
    return ret.data.length;
  } catch (error) {
    return [-1, error];
  }
}

export const getReposContributedTo = async (username, intensive) => {

  let dbRes;
  if (intensive) {
    dbRes = await retrieveFromDB(username, "contributors-intensive");
  } else {
    dbRes = await retrieveFromDB(username, "contributors");
  }

  if (dbRes[0] !== -1) {
    return dbRes;
  } else {
    const { data: { data } } = await axios({
      url: 'https://api.github.com/graphql',
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
      if (res[0] === -1) {
        return {};
      }
      temp[data.user.repositoriesContributedTo.nodes[index].name] = res;
    }

    if (intensive) {
      await storeToDB(username, temp, "contributors-intensive");
    } else {
      await storeToDB(username, temp, "contributors");
    }

    return temp;
  }
}

const formatRepos = (data) => {
  const res = [];
  data.forEach((item) => {
    res.push({ repoName: `${item.name}`, repoContents: item });
  });
  return res;
};
