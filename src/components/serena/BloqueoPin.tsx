import { useState } from "react";
import { Fondo, Logo, Boton } from "./Ui";
import { verificarPin, desbloquearApp } from "@/lib/serena/privacy";
import { Lock, Delete } from "lucide-react";
import { cerrarSesion } from "@/lib/serena/store";

export function BloqueoPin({
  onDesbloquear,
  onCerrarSesion,
}: {
  onDesbloquear: () => void;
  onCerrarSesion: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [animarError, setAnimarError] = useState(false);

  const agregarDigito = async (num: string) => {
    if (pin.length >= 4) return;
    const nuevoPin = pin + num;
    setPin(nuevoPin);
    setError(false);

    if (nuevoPin.length === 4) {
      const ok = await verificarPin(nuevoPin);
      if (ok) {
        desbloquearApp();
        onDesbloquear();
      } else {
        setError(true);
        setAnimarError(true);
        setTimeout(() => {
          setPin("");
          setAnimarError(false);
        }, 800);
      }
    }
  };

  const borrarDigito = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <Fondo>
      <div className="flex min-h-[85vh] flex-col items-center justify-center py-6 text-center">
        <div className="animate-rise relative mx-auto mb-4">
          <div className="absolute inset-0 -m-6 rounded-full halo animate-glow" />
          <Logo size={80} className="relative animate-float" />
        </div>

        <div className="flex items-center gap-2 text-primary">
          <Lock className="h-5 w-5" />
          <h1 className="text-xl font-bold text-deep">Espacio protegido por PIN</h1>
        </div>

        <p className="mt-2 text-xs text-muted-foreground max-w-xs">
          Tus notas y emociones están resguardadas con candado de privacidad local.
        </p>

        {/* Indicadores de dígitos */}
        <div
          className={`mt-6 flex items-center justify-center gap-4 transition-transform ${
            animarError ? "animate-shake translate-x-1" : ""
          }`}
        >
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-4 w-4 rounded-full transition-all duration-200 ${
                pin.length > idx
                  ? error
                    ? "bg-destructive scale-110"
                    : "bg-primary scale-110 shadow-soft"
                  : "border-2 border-muted-foreground/30 bg-card"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="mt-3 text-xs font-semibold text-destructive animate-rise">
            Código PIN incorrecto. Intentá de nuevo.
          </p>
        )}

        {/* Teclado numérico */}
        <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => agregarDigito(num)}
              className="press flex h-14 w-full items-center justify-center rounded-2xl bg-card text-xl font-bold text-deep shadow-soft hover:bg-white active:scale-95 transition-all"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => agregarDigito("0")}
            className="press flex h-14 w-full items-center justify-center rounded-2xl bg-card text-xl font-bold text-deep shadow-soft hover:bg-white active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={borrarDigito}
            className="press flex h-14 w-full items-center justify-center rounded-2xl bg-card/60 text-muted-foreground hover:bg-card active:scale-95 transition-all"
            title="Borrar"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        <button
          onClick={async () => {
            await cerrarSesion();
            onCerrarSesion();
          }}
          className="mt-8 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors underline"
        >
          ¿Olvidaste tu PIN? Cerrar sesión
        </button>
      </div>
    </Fondo>
  );
}
