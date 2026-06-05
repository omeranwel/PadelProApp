import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialize if we have the required config AND no app is already initialized
const isConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId && !!firebaseConfig.appId;

let app = null;
let auth = null;

if (isConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
} else {
  console.warn('[Firebase] Missing environment variables — auth is disabled. Set VITE_FIREBASE_* in Vercel dashboard.');
  // Provide a stub so imports don't crash
  auth = {
    currentUser: null,
    signOut: async () => {},
    onAuthStateChanged: (callback) => {
      callback(null);
      return () => {};
    },
  };
}

export { app, auth };
