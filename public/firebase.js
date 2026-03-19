import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD2rF_yecrLu8u4-f2AutqcMmxzemtJdhg",
  authDomain: "a40-nfc-reader.firebaseapp.com",
  projectId: "a40-nfc-reader",
  storageBucket: "a40-nfc-reader.firebasestorage.app",
  messagingSenderId: "452952268220",
  appId: "1:452952268220:web:e534c5f962ae924e311fb9"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);