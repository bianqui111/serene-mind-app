/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

// Precargar archivos de la PWA (esto lo inyecta vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST || []);
