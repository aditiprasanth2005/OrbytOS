import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBgG7V4rhWpdy4CLiOv0ICb5-eU8A7MH_g",
    authDomain: "orbytos-2026.firebaseapp.com",
    projectId: "orbytos-2026",
    storageBucket: "orbytos-2026.firebasestorage.app",
    messagingSenderId: "323272772064",
    appId: "1:323272772064:web:7ef56c20c64226142a8385"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);