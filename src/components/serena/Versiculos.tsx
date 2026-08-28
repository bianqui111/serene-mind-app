import { useState } from "react";
import { CabeceraRecurso, Boton, Fondo, Recomendaciones } from "./Ui";
import { VERSICULOS } from "@/lib/serena/data";
import { marcarVersiculoNotificado, versiculoDelDia, guardarTokenFCM } from "@/lib/serena/store";

export function notificarVersiculo() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  const i = versiculoDelDia(VERSICULOS.length);
  const v = VERSICULOS[i]!;
  new Notification("Serenamente · Versículo del día", {
    body: `“${v.texto}” — ${v.cita}`,
    icon: "/favicon.png",
  });
  marcarVersiculoNotificado(i);
  return true;
}

export function Versiculos({ onInicio }: { onInicio: () => void }) {
  const indiceHoy = versiculoDelDia(VERSICULOS.length);
  const delDia = VERSICULOS[indiceHoy]!;
  const [estado, setEstado] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default",
  );

  const activar = async () => {
    if (!("Notification" in window)) {
      setEstado("denied");
      return;
    }
    const permiso = await Notification.requestPermission();
    setEstado(permiso);
    
    if (permiso === "granted") {
      try {
        const { messaging } = await import("@/lib/firebase");
        if (messaging) {
          const { getToken } = await import("firebase/messaging");
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
          });
          if (token) {
            await guardarTokenFCM(token);
            notificarVersiculo(); // Enviamos una notificación de prueba local
          }
        } else {
           notificarVersiculo(); // Fallback
        }
      } catch (err) {
        console.error("Error al obtener token FCM:", err);
        notificarVersiculo(); // Fallback si falla firebase
      }
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
        <p className="text-sm font-bold text-deep">Notificación diaria</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {estado === "granted"
            ? "Activada: cada día recibirás un versículo nuevo al abrir Serenamente."
            : estado === "denied"
              ? "Bloqueada por el navegador. Habilitá las notificaciones en la configuración del sitio."
              : "Activá las notificaciones para recibir tu versículo cada mañana."}
        </p>
        <div className="mt-3 grid gap-2">
          <Boton onClick={activar}>
            {estado === "granted" ? "Enviarme el versículo ahora" : "Activar notificaciones diarias"}
          </Boton>
        </div>
      </div>

      <section className="animate-rise mt-6 space-y-3">
        <h2 className="text-base font-bold text-deep">Los 20 versículos</h2>
        {VERSICULOS.map((v, i) => (
          <article
            key={v.cita + i}
            className="rounded-2xl bg-card p-4 shadow-soft transition hover:-translate-y-0.5"
            style={{ animation: "rise 0.5s both", animationDelay: `${i * 30}ms` }}
          >
            <p className="text-sm leading-relaxed text-secondary-foreground">“{v.texto}”</p>
            <p className="mt-2 text-xs font-bold text-primary">{v.cita}</p>
          </article>
        ))}
      </section>

      <Recomendaciones recurso="versiculos" />
    </Fondo>
  );
}
