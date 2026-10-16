import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
import type { Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Se asignan durante la inicialización de abajo. Solo quedarían nulos si Firebase
// no puede inicializarse (configuración faltante), caso tratado en el try/catch.
export let app = null as unknown as FirebaseApp;
export let db = null as unknown as Firestore;
export let auth = null as unknown as Auth;

try {
  app = initializeApp(firebaseConfig);
  // Habilitar persistencia offline con la API moderna de Firebase
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
  auth = getAuth(app);
} catch (error) {
  console.error("Error crítico inicializando Firebase (probablemente falten variables de entorno):", error);
}

export let messaging = null as unknown as Messaging;
try {
  if (app && typeof window !== "undefined" && "serviceWorker" in navigator) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.warn("Firebase Messaging no está soportado en este navegador:", error);
}
