import {
	REACT_APP_FIREBASE_API_KEY,
	REACT_APP_FIREBASE_APP_ID,
	REACT_APP_FIREBASE_AUTH_DOMAIN,
	REACT_APP_FIREBASE_DATABASE_URL,
	REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
	REACT_APP_FIREBASE_PROJECT_ID,
	REACT_APP_FIREBASE_STORAGE_BUCKET,
} from "@env";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, push, ref } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: REACT_APP_FIREBASE_API_KEY,
	authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
	projectId: REACT_APP_FIREBASE_PROJECT_ID,
	storageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
	appId: REACT_APP_FIREBASE_APP_ID,
	databaseURL: REACT_APP_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);

const fs = getFirestore(app);
const db = getDatabase();
const auth = getAuth(app);

export { auth, db, fs, push, ref };
