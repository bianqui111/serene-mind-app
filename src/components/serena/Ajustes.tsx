import { useState } from "react";
import { CabeceraRecurso, Fondo } from "./Ui";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function Ajustes({ onInicio }: { onInicio: () => void }) {
  const email = auth.currentUser?.email ?? "";
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const enviarRecuperacion = async () => {
    if (!email) {
      setError("No se encontró un correo asociado a tu cuenta.");
      return;
    }
    setCargando(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setEnviado(true);
    } catch (e: any) {
      setError("Ocurrió un error al enviar el correo. Intentá de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Fondo>
      <CabeceraRecurso titulo="Ajustes" subtitulo="Configuración de tu cuenta" onInicio={onInicio} />

      <div className="animate-rise grid gap-4">

        {/* Tarjeta de cuenta */}
        <section className="rounded-3xl bg-card p-5 shadow-soft">
          <h2 className="text-base font-bold text-deep">Tu cuenta</h2>
          <p className="mt-1 text-xs text-muted-foreground">Sesión iniciada como:</p>
          <p className="mt-1 text-sm font-semibold text-primary break-all">{email}</p>
        </section>

        {/* Tarjeta de recuperación de contraseña */}
        <section className="rounded-3xl bg-card p-5 shadow-soft">
          <h2 className="text-base font-bold text-deep">¿Olvidaste tu contraseña?</h2>
          <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
            Te enviamos un correo a <strong>{email}</strong> con un enlace para que puedas crear una contraseña nueva.
          </p>

          {enviado ? (
            <div className="mt-4 rounded-2xl bg-green-100 px-4 py-3 text-sm font-semibold text-green-700">
              ✅ ¡Correo enviado! Revisá tu bandeja de entrada (y la carpeta de spam).
            </div>
          ) : (
            <button
              onClick={enviarRecuperacion}
              disabled={cargando}
              className="press mt-4 w-full rounded-2xl bg-dawn px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft disabled:opacity-60"
            >
              {cargando ? "Enviando..." : "📧 Enviar correo de recuperación"}
            </button>
          )}

          {error && (
            <p className="mt-3 text-xs font-semibold text-red-500">{error}</p>
          )}
        </section>

        {/* Info adicional */}
        <section className="rounded-3xl bg-card p-5 shadow-soft">
          <h2 className="text-base font-bold text-deep">Sobre la app</h2>
          <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
            <strong>Serenamente</strong> es una app de apoyo emocional para adolescentes y jóvenes. Tus datos están protegidos y solo vos podés verlos.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Versión 1.0.0</p>
        </section>

      </div>
    </Fondo>
  );
}
