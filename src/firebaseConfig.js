// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDCxX0w-5_6NZEtXsQ5ZUtsDdIzR3YNuu0",
    authDomain: "defensio-46cf4.firebaseapp.com",
    projectId: "defensio-46cf4",
    storageBucket: "defensio-46cf4.firebasestorage.app",
    messagingSenderId: "572297073167",
    appId: "1:572297073167:web:7cf7af062440d8ef47c97a",
    measurementId: "G-XW302YJJFG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);