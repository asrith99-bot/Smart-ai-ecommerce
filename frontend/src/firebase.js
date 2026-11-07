import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export const getFirebaseConfig = () => {
  const localConfig = localStorage.getItem('nexacart_firebase_config');
  if (localConfig) {
    try {
      return JSON.parse(localConfig);
    } catch (error) {
      console.warn('Ignoring invalid Firebase configuration saved in this browser.', error);
    }
  }

  return {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || ''
  };
};

let app = null;
let auth = null;
let googleProvider = null;

const firebaseConfig = getFirebaseConfig();
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const isConfigured = requiredConfigKeys.every((key) => Boolean(firebaseConfig[key]));

if (isConfigured) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
}

export { auth, googleProvider, signInWithPopup, GoogleAuthProvider };
