// firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyCOLBJz_qfDAEBlXB8WHWQM0rxEc3fnocM ",
    authDomain: "react-firebase-chat-app-71815.firebaseapp.com",
    databaseURL: "https://react-firebase-chat-app-71815-default-rtdb.firebaseio.com",
    projectId: "react-firebase-chat-app-71815",
    storageBucket: "react-firebase-chat-app-71815.appspot.com",
    messagingSenderId: "1074278169125",
    appId: "1:1074278169125:web:3b3bb6a2f92af9bcc4ddcc",
    measurementId: "G-NZHRZ09VBC"
  };

const app = initializeApp(firebaseConfig);

const auth = getAuth();
const storage= getStorage();
const db = getFirestore();


export { auth, storage, db, };
