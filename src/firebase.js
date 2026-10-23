// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOXVhf9mEJpEXoso1ivT8hyUO7a0PmVng",
  authDomain: "musicvisualisercom.firebaseapp.com",
  projectId: "musicvisualisercom",
  storageBucket: "musicvisualisercom.firebasestorage.app",
  messagingSenderId: "102046649288",
  appId: "1:102046649288:web:5950ed3c668dce8c36cefd",
  measurementId: "G-D703HW13CR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
