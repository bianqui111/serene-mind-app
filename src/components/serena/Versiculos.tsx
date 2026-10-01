import { useState } from "react";
import { CabeceraRecurso, Boton, Fondo, Recomendaciones } from "./Ui";
import { VERSICULOS } from "@/lib/serena/data";
import { marcarVersiculoNotificado, versiculoDelDia, versiculoNotificadoHoy } from "@/lib/serena/store";

export async function notificarVersiculo(forzar = false): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  if (!forzar && versiculoNotificadoHoy()) return false;

  const i = versiculoDelDia(VERSICULOS.length);
  const v = VERSICULOS[i]!;

  try {
    let registration: ServiceWorkerRegistration | null = null;

    if ("serviceWorker" in navigator) {
      try {
        // En Android, navigator.serviceWorker.ready garantiza que el SW esté activo
        registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<ServiceWorkerRegistration | null>((resolve) =>
            setTimeout(() => resolve(null), 3500)
          ),
        ]);

        if (!registration) {
          const regs = await navigator.serviceWorker.getRegistrations();
          registration = regs[0] || null;
        }

        if (!registration) {
          registration = await navigator.serviceWorker.register("/sw.js");
        }
      } catch (swErr) {
        console.warn("Aviso al obtener Service Worker:", swErr);
      }
    }

    const opciones: any = {
      body: `“${v.texto}” — ${v.cita}`,
      icon: "/icon-192.png",
      badge: "/favicon.png",
      tag: "versiculo-del-dia",
      renotify: true,
      data: { url: "/" },
      vibrate: [200, 100, 200],
    };

    // En Android Chrome, new Notification() arroja error ilegal: DEBE usarse showNotification()
    if (registration && typeof registration.showNotification === "function") {
      await registration.showNotification("Serenamente · Versículo del día", opciones);
      marcarVersiculoNotificado(i);
      return true;
    }

    // Fallback únicamente en escritorio si no hay SW activo
    if (typeof Notification !== "undefined") {
      try {
        new Notification("Serenamente · Versículo del día", opciones);
        marcarVersiculoNotificado(i);
        return true;
      } catch (notifErr) {
        console.warn("new Notification() no soportado en esta plataforma:", notifErr);
      }
    }

    return false;
  } catch (error) {
    console.error("Error mostrando notificación:", error);
    return false;
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
        // Enviar inmediatamente una notificación de prueba al teléfono
        const ok = await notificarVersiculo(true);
        if (ok) {
          setMensajeFeedback("¡Notificaciones activadas con éxito! Fijate en la barra superior de tu celular.");
        } else {
          setMensajeFeedback("Permiso concedido. Se enviará tu versículo automáticamente cada día.");
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
          console.warn("FCM push en segundo plano no configurado aún (las notificaciones locales están activas):", err);
        }
      } else if (permiso === "denied") {
        setMensajeFeedback("Las notificaciones están bloqueadas. Habilitalas desde los ajustes del navegador en tu Android.");
      }
    } catch (err) {
      console.error("Error al activar notificaciones:", err);
      setMensajeFeedback("Ocurrió un error al solicitar permisos.");
    } finally {
      setProbando(false);
    }
  };

  const probarAhora = async () => {
    setProbando(true);
    setMensajeFeedback(null);
    try {
      const ok = await notificarVersiculo(true);
      if (ok) {
        setMensajeFeedback("¡Notificación enviada! Deslizá hacia abajo la barra de notificaciones de tu Android.");
      } else {
        setMensajeFeedback("No se pudo enviar. Verificá que las notificaciones no estén bloqueadas en los ajustes de Android.");
      }
    } catch {
      setMensajeFeedback("Error al intentar emitir la notificación.");
    } finally {
      setProbando(false);
    }
  };

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
          <p className="text-sm font-bold text-deep">Notificación diaria en Android</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {estado === "granted"
            ? "Notificaciones activadas: recibirás tu versículo diario directamente en la pantalla de bloqueo y panel de tu celular."
            : estado === "denied"
              ? "Bloqueada por el navegador. Tocá el candado en la barra de direcciones o la configuración de Chrome en Android para permitir las notificaciones."
              : "Activá las notificaciones para recibir un versículo de paz cada mañana en tu dispositivo."}
        </p>

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
