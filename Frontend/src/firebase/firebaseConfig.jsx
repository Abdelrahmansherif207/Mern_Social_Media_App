import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const appConfig = {
    apiKey: "AIzaSyCrGfSe5qYzoAJwNc5f8OxvsqztlgKgqKk",
    authDomain: "social-media-app-fa5c1.firebaseapp.com",
    projectId: "social-media-app-fa5c1",
    storageBucket: "social-media-app-fa5c1.firebasestorage.app",
    messagingSenderId: "1017123516495",
    appId: "1:1017123516495:web:304d8bcf0bfd423842fa3a",
    measurementId: "G-05Z07ZX9Q8",
};

const app = initializeApp(appConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
