import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth }                         from "firebase/auth";
import {
  initializeFirestore,
  memoryLocalCache,
  getFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// module-level singletons — guaranteed one instance per process
let _app = null;
let _db  = null;
let _auth = null;

function getFirebaseApp() {
  if (_app) return _app;
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

function getDb() {
  if (_db) return _db;
  const app = getFirebaseApp();
  try {
    _db = initializeFirestore(app, {
      localCache:                   memoryLocalCache(),
      experimentalForceLongPolling: true,
    });
  } catch {
    _db = getFirestore(app);
  }
  return _db;
}

function getFirebaseAuth() {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}

export const app  = getFirebaseApp();
export const db   = getDb();
export const auth = getFirebaseAuth();