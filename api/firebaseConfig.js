// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {getStorage} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPnrycIJjxCS_ilZZR24fspt9o-8XWVTk",
  authDomain: "chatapp-de7fd.firebaseapp.com",
  projectId: "chatapp-de7fd",
  storageBucket: "chatapp-de7fd.firebasestorage.app",
  messagingSenderId: "534344164125",
  appId: "1:534344164125:web:1ec6f397a73e4c45db37f4"
};

// Initialize Firebase
 export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);