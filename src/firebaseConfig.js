import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDHzKUmqXfe8C5mSvVmUdq4tV4W-VOUmi8",
    authDomain: "golf-468e7.firebaseapp.com",
    databaseURL: "https://golf-468e7-default-rtdb.firebaseio.com",
    projectId: "golf-468e7",
    storageBucket: "golf-468e7.appspot.com",
    messagingSenderId: "524387138034",
    appId: "1:524387138034:web:25743c9a4e0e5710f3d36b",
    measurementId: "G-MF9CT1E9K2"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { auth, db };



