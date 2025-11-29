import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAJ3fmH6pTZVRjRdkhbyNh5lMeBedZH4V0",
    authDomain: "online-meeting-3cb69.firebaseapp.com",
    databaseURL: "https://online-meeting-3cb69-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "online-meeting-3cb69",
    storageBucket: "online-meeting-3cb69.firebasestorage.app",
    messagingSenderId: "480017532396",
    appId: "1:480017532396:web:ceea6b3e90b78c5879acc9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
