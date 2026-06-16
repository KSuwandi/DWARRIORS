import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDjAwr9Hc6DLCZEr-808NfGUeW8S_AoIvw",
  authDomain: "dwarriors-55228.firebaseapp.com",
  projectId: "dwarriors-55228",
  storageBucket: "dwarriors-55228.firebasestorage.app",
  messagingSenderId: "73177091272",
  appId: "1:73177091272:web:7c28c8ed46028d765a69fd"
};

const app =
  initializeApp(
    firebaseConfig
  );

export const auth =
  getAuth(app);

export const db =
  getFirestore(app);

export const storage =
  getStorage(app);

export default app;