import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey:     import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId:  import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  appId:      import.meta.env.VITE_FIREBASE_APP_ID as string,
};

// Prevent duplicate initialization when Vite hot-reloads the module
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Request the user's email so we can display it in the UI
googleProvider.addScope("email");
googleProvider.addScope("profile");
