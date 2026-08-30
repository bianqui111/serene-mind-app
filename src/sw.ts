/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

declare let self: ServiceWorkerGlobalScope;

// Precargar archivos de la PWA (esto lo inyecta vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST || []);

// Inicializar Firebase usando las variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  const notificationTitle = payload.notification?.title || "Serenamente";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/favicon.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
