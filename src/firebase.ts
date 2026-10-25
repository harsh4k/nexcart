import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import fallbackConfig from '../firebase-applet-config.json';

const env = import.meta.env;

// All-or-nothing: when VITE_FIREBASE_PROJECT_ID is set, every value comes from
// VITE_FIREBASE_* env vars, so a partial env can never mix two projects. Until
// env vars are set everywhere (including Vercel), the committed config of the
// original AI Studio project is used as a whole.
const useEnv = Boolean(env.VITE_FIREBASE_PROJECT_ID);

const firebaseConfig = useEnv
  ? {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    }
  : fallbackConfig;

// Empty means the project's (default) Firestore database.
const firestoreDatabaseId = useEnv
  ? env.VITE_FIRESTORE_DATABASE_ID || undefined
  : fallbackConfig.firestoreDatabaseId;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);
export const storage = getStorage(app);
