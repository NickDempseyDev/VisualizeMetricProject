// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GithubAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAN6O6sniuoDk2bbqFmPAqTlpjY7ogFGhw",
  authDomain: "gitapi-e06a3.firebaseapp.com",
  projectId: "gitapi-e06a3",
  storageBucket: "gitapi-e06a3.appspot.com",
  messagingSenderId: "435889952185",
  appId: "1:435889952185:web:01647b069303a252519268",
  measurementId: "G-PZ7Y1JDQG1"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebase);
const githubProvider = new GithubAuthProvider();
const auth = getAuth(firebase)

export const login = async () => {
  return (signInWithPopup(auth, githubProvider)
    .then((result) => {
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      return {user, token};
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.email;
      const credential = GithubAuthProvider.credentialFromError(error);
      return {errorCode, errorMessage, email, credential};
    }));
}
export default firebase