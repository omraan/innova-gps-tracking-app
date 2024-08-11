import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth, onIdTokenChanged } from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase, push, ref, set } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// import firebaseConfig from "./firebaseConfig.prod.json";
const firebaseConfig = {
	apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
	databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const fs = getFirestore(app);
const db = getDatabase();
const auth = initializeAuth(app, {
	persistence: getReactNativePersistence(AsyncStorage),
});
export { auth, db, fs, getAuth, push, ref, set };
