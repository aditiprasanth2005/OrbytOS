import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBgG7V4rhWpdy4CLiOv0ICb5-eU8A7MH_g",
    authDomain: "orbytos-2026.firebaseapp.com",
    projectId: "orbytos-2026",
    storageBucket: "orbytos-2026.firebasestorage.app",
    messagingSenderId: "323272772064",
    appId: "1:323272772064:web:7ef56c20c64226142a8385"
};

const app = initializeApp(firebaseConfig);

// ✅ correct auth setup
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);