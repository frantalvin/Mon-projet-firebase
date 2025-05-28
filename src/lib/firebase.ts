
// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Configuration Firebase basée sur les informations fournies par l'utilisateur
const firebaseConfig = {
  apiKey: "AIzaSyBqWYuoOKfn_iJVPaw2faKhoTubsSuUT2E",
  authDomain: "mon-atta.firebaseapp.com", // Construit à partir de projectId
  projectId: "mon-atta",
  storageBucket: "mon-atta.firebasestorage.app",
  messagingSenderId: "912302999620", // Mis à jour avec la valeur fournie
  appId: "1:912302999620:android:64cd0f3add2858b3dd9411", // Basé sur mobilesdk_app_id fourni. Pour une application web, un App ID Web dédié est généralement utilisé.
  measurementId: "YOUR_MEASUREMENT_ID" // Optionnel, pour Google Analytics. Vérifiez dans votre console Firebase si nécessaire.
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };

