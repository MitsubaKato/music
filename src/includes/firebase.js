import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCxjUCR3JogLtxLb1rZvwzHrOaeBg-mOQ0",
  authDomain: "test-c4f29.firebaseapp.com",
  projectId: "test-c4f29",
  storageBucket: "test-c4f29.appspot.com",
  messagingSenderId: "978662248926",
  appId: "1:978662248926:web:8d5c590837b0a711d94d4f",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

db.enablePersistence().catch((error) => {
  alert(`Firebase persistence error ${error.code}`);
});

const usersCollection = db.collection("users");
const songsCollection = db.collection("songs");
const commentsCollection = db.collection("comments");
const imagesCollection = db.collection("images");
const likesCollection = db.collection("likes");


export {
  auth,
  db,
  usersCollection,
  songsCollection,
  commentsCollection,
  storage,
  imagesCollection,
  likesCollection,
};
