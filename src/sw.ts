/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

declare let self: ServiceWorkerGlobalScope;

// Activar inmediatamente el nuevo Service Worker sin esperar a cerrar pestañas
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Precargar archivos de la PWA (esto lo inyecta vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST || []);

// Inicializar Firebase usando las variables de entorno de forma segura
try {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    onBackgroundMessage(messaging, (payload) => {
      const data = payload.data as Record<string, string> | undefined;
      const notificationTitle = payload.notification?.title || data?.["title"] || "Serenamente · Versículo del día";
      const notificationOptions: any = {
        body: payload.notification?.body || data?.["body"] || "",
        icon: "/icon-192.png",
        badge: "/favicon.png",
        tag: "serenamente-fcm",
        renotify: true,
        data: { url: data?.["url"] || "/" },
        vibrate: [200, 100, 200],
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
} catch (error) {
  console.warn("Firebase Messaging en SW no disponible:", error);
}

// Receptor de notificaciones Web Push nativas para Android
self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const payload = event.data.json() as any;
    const title = payload.notification?.title || payload.data?.title || payload.title || "Serenamente · Versículo del día";
    const body = payload.notification?.body || payload.data?.body || payload.body || "";
    const url = payload.data?.url || payload.notification?.click_action || "/";

    const opts: any = {
      body,
      icon: "/icon-192.png",
      badge: "/favicon.png",
      tag: "serenamente-push",
      renotify: true,
      data: { url },
      vibrate: [200, 100, 200],
    };

    event.waitUntil(self.registration.showNotification(title, opts));
  } catch {
    const text = event.data.text();
    const opts: any = {
      body: text,
      icon: "/icon-192.png",
      badge: "/favicon.png",
      tag: "serenamente-push-text",
      renotify: true,
      data: { url: "/" },
      vibrate: [200, 100, 200],
    };
    event.waitUntil(self.registration.showNotification("Serenamente · Versículo del día", opts));
  }
});

// Manejo del toque en la notificación para abrir o enfocar la app en Android
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
      return null;
    })
  );
});
