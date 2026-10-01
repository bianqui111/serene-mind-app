// Service Worker independiente para Serenamente (Garantiza funcionamiento en Android, iOS y PWA)
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Receptor de notificaciones Push (Web Push / FCM)
self.addEventListener("push", (event) => {
  let title = "Serenamente · Versículo del día";
  let body = "Respirá hondo: tu versículo de calma te espera.";
  let url = "/";

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.notification?.title || data.data?.title || data.title || title;
      body = data.notification?.body || data.data?.body || data.body || body;
      url = data.data?.url || data.notification?.click_action || url;
    } catch {
      body = event.data.text() || body;
    }
  }

  const options = {
    body,
    icon: "/icon-192.png",
    badge: "/favicon.png",
    tag: "serenamente-push",
    renotify: true,
    data: { url },
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Al tocar la notificación en Android, abrir o enfocar la app
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

// Receptor de mensajes directos para emitir notificaciones desde el cliente
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "MOSTRAR_NOTIFICACION") {
    const { title, options } = event.data;
    self.registration.showNotification(title || "Serenamente", options || {});
  }
});
