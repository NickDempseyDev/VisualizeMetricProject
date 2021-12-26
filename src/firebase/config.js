// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GithubAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
// const analytics = getAnalytics(firebase);
const githubProvider = new GithubAuthProvider();
const auth = getAuth(firebase)

let count = 0;

export const login = async (callBck) => {
  return (signInWithPopup(auth, githubProvider)
    .then((result) => {
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result._tokenResponse.screenName;
      console.log(user);
      setSessionStorage(token, user);
      callBck(count++);
      return {user, token};
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.email;
      const credential = GithubAuthProvider.credentialFromError(error);
      setSessionStorage("error", "error");
      return {errorCode, errorMessage, email, credential};
    }));
}

const setSessionStorage = (tkn, usr) => {
  sessionStorage.setItem("usr", usr);
  sessionStorage.setItem("tkn",tkn);
}

export default firebase 