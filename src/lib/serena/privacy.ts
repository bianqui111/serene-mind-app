/**
 * Módulo de Seguridad y Privacidad para Serenamente
 * Maneja bloqueo por PIN, sanitización de datos, exportación y políticas de privacidad.
 */

import type { RegistroEmocion } from "./store";

const PIN_STORAGE_KEY = "serena.security.pinHash";
const PIN_ENABLED_KEY = "serena.security.pinEnabled";
const APP_LOCKED_KEY = "serena.security.isLocked";

// Simple hash criptográfico usando Web Crypto API
export async function hashPin(pin: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`serena_salt_${pin}_secure_salt_2026`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function isPinConfigured(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(PIN_STORAGE_KEY));
}

export function isPinLockActive(): boolean {
  if (typeof window === "undefined") return false;
  const enabled = window.localStorage.getItem(PIN_ENABLED_KEY) === "true";
  return enabled && isPinConfigured();
}

export async function configurarPin(pin: string): Promise<boolean> {
  if (!pin || pin.length < 4) return false;
  try {
    const hashed = await hashPin(pin);
    window.localStorage.setItem(PIN_STORAGE_KEY, hashed);
    window.localStorage.setItem(PIN_ENABLED_KEY, "true");
    return true;
  } catch (e) {
    console.error("Error al configurar PIN:", e);
    return false;
  }
}

export async function verificarPin(pin: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const guardado = window.localStorage.getItem(PIN_STORAGE_KEY);
  if (!guardado) return false;
  const hashIngresado = await hashPin(pin);
  return guardado === hashIngresado;
}

export function desactivarPin(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PIN_STORAGE_KEY);
  window.localStorage.removeItem(PIN_ENABLED_KEY);
  window.sessionStorage.removeItem(APP_LOCKED_KEY);
}

export function alternarPinLock(activo: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PIN_ENABLED_KEY, activo ? "true" : "false");
}

export function isAppBloqueada(): boolean {
  if (typeof window === "undefined") return false;
  if (!isPinLockActive()) return false;
  // Si está activo el PIN, revisamos si la sesión actual fue desbloqueada
  return window.sessionStorage.getItem(APP_LOCKED_KEY) !== "unlocked";
}

export function desbloquearApp(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(APP_LOCKED_KEY, "unlocked");
}

export function bloquearApp(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(APP_LOCKED_KEY);
}

/**
 * Sanitiza texto ingresado por el usuario para prevenir ataques XSS y espacios abusivos.
 */
export function sanitizarTexto(texto: string, longitudMaxima = 1000): string {
  if (!texto) return "";
  return texto
    .replace(/[<>]/g, "") // Remueve tags potencialmente peligrosos
    .slice(0, longitudMaxima)
    .trim();
}

/**
 * Permite al usuario exportar sus datos en un archivo JSON descargable (Derecho de Portabilidad GDPR).
 */
export function exportarDatosJson(registros: RegistroEmocion[], emailUsuario?: string): void {
  if (typeof window === "undefined") return;

  const exportData = {
    aplicacion: "Serenamente",
    fechaExportacion: new Date().toISOString(),
    usuario: emailUsuario || "Usuario anónimo",
    totalRegistros: registros.length,
    seguridad: "Datos privados y protegidos",
    registrosEmocionales: registros,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonString);
  downloadAnchor.setAttribute(
    "download",
    `serenamente-mis-emociones-${new Date().toISOString().split("T")[0]}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Principios y Política de Seguridad y Privacidad de Serenamente
 */
export const POLITICA_PRIVACIDAD = {
  titulo: "Compromiso de Privacidad y Seguridad",
  resumen:
    "En Serenamente creemos que tu salud mental y tus emociones son sagradas y confidenciales. Tus notas y registros nunca serán vendidos ni expuestos a terceros.",
  puntos: [
    {
      titulo: "🔒 Cifrado y Acceso Exclusivo",
      descripcion:
        "Tus registros emocionales y dibujos se guardan bajo reglas de acceso restringido vinculadas a tu cuenta única. Nadie más tiene permiso para leerlos.",
    },
    {
      titulo: "🛡️ Tránsito Seguro (HTTPS / TLS)",
      descripcion:
        "Toda comunicación entre tu dispositivo y los servidores viaja con cifrado de grado militar a través de conexiones SSL/TLS.",
    },
    {
      titulo: "✨ Derecho al Olvido y Portabilidad",
      descripcion:
        "Vos sos el único dueño de tu información. Podés descargar una copia de tus registros o borrarlos permanentemente cuando lo desees.",
    },
    {
      titulo: "🤐 Confidencialidad Ética",
      descripcion:
        "No compartimos tu información personal con anunciantes ni con los psicólogos listados sin tu consentimiento expreso.",
    },
    {
      titulo: "🔑 Bloqueo de Privacidad Local",
      descripcion:
        "Podés activar un código PIN de seguridad de 4 dígitos para que nadie que tome tu dispositivo pueda ver tus emociones.",
    },
  ],
};
