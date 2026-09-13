import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  firestoreDatabaseId?: string;
}

// 1. Resolve configuration from environment variables first, falling back to provisioned config
const envConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId || '',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || '',
};

export const isFirebaseConfigured = Boolean(
  envConfig.apiKey &&
  envConfig.projectId &&
  envConfig.apiKey !== 'your-api-key' &&
  envConfig.projectId !== 'your-project-id'
);

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(envConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);

// Use explicit database ID if provisioned, else default
export const db: Firestore = envConfig.firestoreDatabaseId
  ? getFirestore(app, envConfig.firestoreDatabaseId)
  : getFirestore(app);

export { app };
export const firebaseProjectId = envConfig.projectId;
export default app;
