import { useState } from "react";
import { CabeceraRecurso, Boton, Fondo, Recomendaciones } from "./Ui";
import { VERSICULOS } from "@/lib/serena/data";
import { marcarVersiculoNotificado, versiculoDelDia, versiculoNotificadoHoy } from "@/lib/serena/store";

export async function notificarVersiculo(forzar = false): Promise<{ ok: boolean; detalle?: string }> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { ok: false, detalle: "Tu navegador no soporta la API de notificaciones." };
  }
  if (Notification.permission !== "granted") {
    return { ok: false, detalle: `Permisos en estado "${Notification.permission}". Tocá "Activar notificaciones" primero.` };
  }
  if (!forzar && versiculoNotificadoHoy()) {
    return { ok: true, detalle: "Ya se notificó el versículo hoy." };
  }

  const i = versiculoDelDia(VERSICULOS.length);
  const v = VERSICULOS[i]!;

  const opciones: any = {
    body: `“${v.texto}” — ${v.cita}`,
    icon: "/icon-192.png",
    badge: "/favicon.png",
    tag: "versiculo-del-dia",
    renotify: true,
    data: { url: "/" },
    vibrate: [200, 100, 200],
  };

  try {
    let registration: ServiceWorkerRegistration | null = null;

    if ("serviceWorker" in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        if (regs && regs.length > 0 && regs[0]) {
          registration = regs[0];
        }

        if (!registration) {
          registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        }

        // Si está en proceso de instalación/activación, esperar
        if (registration && (registration.installing || registration.waiting)) {
          const sw = registration.installing || registration.waiting;
          if (sw && sw.state !== "activated") {
            await new Promise<void>((resolve) => {
              sw.addEventListener("statechange", () => {
                if (sw.state === "activated") resolve();
              });
              setTimeout(resolve, 1500);
            });
          }
        }
      } catch (swErr) {
        console.warn("Aviso al obtener Service Worker:", swErr);
      }
    }

    // 1. En Android Chrome / PWA: DEBE usarse showNotification()
    if (registration && typeof registration.showNotification === "function") {
      try {
        await registration.showNotification("Serenamente · Versículo del día", opciones);
        marcarVersiculoNotificado(i);
        return { ok: true };
      } catch (showErr: any) {
        console.warn("Reintentando showNotification sin opciones avanzadas...", showErr);
        // Algunos dispositivos restringen vibrate o tag
        try {
          await registration.showNotification("Serenamente · Versículo del día", {
            body: `“${v.texto}” — ${v.cita}`,
            icon: "/icon-192.png",
          });
          marcarVersiculoNotificado(i);
          return { ok: true };
        } catch (retryErr: any) {
          return { ok: false, detalle: `Error de Android al emitir: ${retryErr?.message || retryErr}` };
        }
      }
    }

    // 2. Comunicación con el worker activo si existe
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "MOSTRAR_NOTIFICACION",
        title: "Serenamente · Versículo del día",
        options: opciones,
      });
      marcarVersiculoNotificado(i);
      return { ok: true };
    }

    // 3. Fallback en navegador de escritorio
    if (typeof Notification !== "undefined") {
      try {
        new Notification("Serenamente · Versículo del día", opciones);
        marcarVersiculoNotificado(i);
        return { ok: true };
      } catch (notifErr: any) {
        return { ok: false, detalle: `No se pudo inicializar la notificación: ${notifErr?.message || notifErr}` };
      }
    }

    return { ok: false, detalle: "No se encontró el Service Worker activo en este navegador." };
  } catch (error: any) {
    console.error("Error mostrando notificación:", error);
    return { ok: false, detalle: error?.message || String(error) };
  }
}

export function Versiculos({ onInicio }: { onInicio: () => void }) {
  const indiceHoy = versiculoDelDia(VERSICULOS.length);
  const delDia = VERSICULOS[indiceHoy]!;
  const [estado, setEstado] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default",
  );
  const [probando, setProbando] = useState(false);
  const [mensajeFeedback, setMensajeFeedback] = useState<string | null>(null);

  const activar = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setEstado("denied");
      setMensajeFeedback("Tu navegador no soporta notificaciones push.");
      return;
    }

    try {
      setProbando(true);
      setMensajeFeedback(null);
      const permiso = await Notification.requestPermission();
      setEstado(permiso);

      if (permiso === "granted") {
        const res = await notificarVersiculo(true);
        if (res.ok) {
          setMensajeFeedback("¡Notificación enviada! Fijate en la barra superior de tu celular.");
        } else {
          setMensajeFeedback(res.detalle || "Permiso concedido.");
        }

        // Registrar token FCM si está disponible
        try {
          if ("serviceWorker" in navigator) {
            const reg = await navigator.serviceWorker.ready;
            const { messaging } = await import("@/lib/firebase");
            if (messaging) {
              const { getToken } = await import("firebase/messaging");
              const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
              const token = await getToken(messaging, {
                serviceWorkerRegistration: reg,
                ...(vapidKey ? { vapidKey } : {}),
              });
              if (token) {
                const { guardarTokenFCM } = await import("@/lib/serena/store");
                await guardarTokenFCM(token);
              }
            }
          }
        } catch (err) {
          console.warn("FCM push en segundo plano no configurado aún:", err);
        }
      } else if (permiso === "denied") {
        setMensajeFeedback("Permiso denegado. Tocá el candado o configuración del sitio junto a la URL para permitir notificaciones.");
      }
    } catch (err: any) {
      console.error("Error al activar notificaciones:", err);
      setMensajeFeedback("Error: " + (err?.message || String(err)));
    } finally {
      setProbando(false);
    }
  };

  const probarAhora = async () => {
    setProbando(true);
    setMensajeFeedback(null);
    try {
      const res = await notificarVersiculo(true);
      if (res.ok) {
        setMensajeFeedback("¡Notificación enviada con éxito! Deslizá hacia abajo la barra de notificaciones de tu Android.");
      } else {
        setMensajeFeedback(res.detalle || "No se pudo emitir la notificación.");
      }
    } catch (e: any) {
      setMensajeFeedback("Error: " + (e?.message || String(e)));
    } finally {
      setProbando(false);
    }
  };

  const esIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent);
  const esStandalone = typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true);

  return (
    <Fondo>
      <CabeceraRecurso titulo="Versículos bíblicos" subtitulo="20 palabras de calma para tu día" onInicio={onInicio} />

      <article className="animate-rise relative overflow-hidden rounded-3xl bg-dawn p-6 text-primary-foreground shadow-lift">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl animate-glow" />
        <p className="relative text-[11px] font-bold tracking-widest uppercase opacity-90">Versículo del día</p>
        <p className="relative mt-3 text-lg leading-relaxed font-semibold">“{delDia.texto}”</p>
        <p className="relative mt-3 text-sm opacity-90">{delDia.cita}</p>
      </article>

      <div className="animate-rise mt-4 rounded-3xl bg-card-soft p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔔</span>
          <p className="text-sm font-bold text-deep">
            {esIOS ? "Notificaciones en iPhone / iPad" : "Notificaciones diarias en tu celular"}
          </p>
        </div>

        {esIOS && !esStandalone ? (
          <div className="mt-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
            <p className="font-bold mb-1">📲 Requisito de Apple para iPhone:</p>
            Para activar notificaciones en iOS, primero debés agregar la app a tu pantalla de inicio:
            <ol className="mt-1.5 list-decimal pl-4 space-y-1">
              <li>Tocá el botón <strong>Compartir</strong> en Safari (el cuadro con flecha arriba <span className="text-sm">⎋</span>).</li>
              <li>Elegí <strong>"Agregar al inicio"</strong>.</li>
              <li>Abrí la app desde tu pantalla de inicio y tocá este botón para activarlas.</li>
            </ol>
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {estado === "granted"
              ? "Notificaciones activadas: recibirás tu versículo diario directamente en la pantalla de bloqueo y panel de tu celular."
              : estado === "denied"
                ? "Bloqueada por el navegador. Tocá el candado o la configuración del navegador para permitir las notificaciones."
                : "Activá las notificaciones para recibir un versículo de paz cada mañana en tu dispositivo."}
          </p>
        )}

        {mensajeFeedback && (
          <div className="mt-3 rounded-2xl bg-primary/10 border border-primary/20 p-3 text-xs font-semibold text-deep animate-fadeIn">
            {mensajeFeedback}
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
          {estado !== "granted" ? (
            <Boton onClick={activar} disabled={probando}>
              {probando ? "Activando..." : "Activar notificaciones en este celular"}
            </Boton>
          ) : (
            <Boton onClick={probarAhora} disabled={probando} variante="suave">
              {probando ? "Enviando..." : "🔔 Probar notificación ahora en mi celular"}
            </Boton>
          )}
        </div>
      </div>

      <section className="animate-rise mt-8">
        <h2 className="text-lg font-bold text-deep mb-4">Los 20 versículos</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {VERSICULOS.map((v, i) => (
            <article
              key={v.cita + i}
              className="rounded-2xl bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md"
              style={{ animation: "rise 0.5s both", animationDelay: `${i * 30}ms` }}
            >
              <p className="text-sm leading-relaxed text-secondary-foreground">“{v.texto}”</p>
              <p className="mt-3 text-xs font-bold text-primary">{v.cita}</p>
            </article>
          ))}
        </div>
      </section>

      <Recomendaciones recurso="versiculos" />
    </Fondo>
  );
}
