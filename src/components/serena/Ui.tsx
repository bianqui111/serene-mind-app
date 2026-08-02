import type { ReactNode } from "react";
import logo from "@/assets/serenamente-logo.png";
import { RECOMENDACIONES, type Recurso } from "@/lib/serena/data";

export function Logo({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={logo}
      alt="Logo de Serenamente"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`drop-shadow-[0_10px_24px_rgba(124,120,220,0.45)] ${className}`}
    />
  );
}

export function Fondo({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-lilac/50 blur-3xl animate-drift" />
      <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-sky-soft/50 blur-3xl animate-drift [animation-delay:-6s]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-primary/25 blur-3xl animate-drift [animation-delay:-12s]" />
      <div className="relative mx-auto w-full max-w-md px-5 pb-16">{children}</div>
    </div>
  );
}

export function CabeceraRecurso({
  titulo,
  subtitulo,
  onInicio,
}: {
  titulo: string;
  subtitulo: string;
  onInicio: () => void;
}) {
  return (
    <header className="animate-rise pt-8 pb-5">
      <div className="flex items-center gap-3">
        <Logo size={44} className="animate-float" />
        <div className="flex-1">
          <h1 className="text-2xl leading-tight font-bold text-deep">{titulo}</h1>
          <p className="text-xs text-muted-foreground">{subtitulo}</p>
        </div>
        <button
          onClick={onInicio}
          className="press rounded-full bg-card px-4 py-2 text-xs font-semibold text-primary shadow-soft"
        >
          ← Inicio
        </button>
      </div>
    </header>
  );
}

export function Recomendaciones({ recurso }: { recurso: Recurso }) {
  return (
    <section className="animate-rise mt-8 rounded-3xl bg-card-soft p-5 shadow-soft [animation-delay:120ms]">
      <h2 className="flex items-center gap-2 text-base font-bold text-deep">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-accent-foreground text-sm">✦</span>
        Recomendaciones para el manejo de la ansiedad
      </h2>
      <ul className="mt-3 space-y-2.5">
        {RECOMENDACIONES[recurso].map((r) => (
          <li key={r} className="flex gap-2.5 text-sm leading-relaxed text-secondary-foreground">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {r}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Boton({
  children,
  onClick,
  variante = "primario",
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variante?: "primario" | "suave" | "contorno";
  type?: "button" | "submit";
  className?: string;
}) {
  const estilos = {
    primario: "bg-dawn text-primary-foreground shadow-soft",
    suave: "bg-secondary text-secondary-foreground",
    contorno: "border border-border bg-card text-primary",
  }[variante];
  return (
    <button
      type={type}
      onClick={onClick}
      className={`press w-full rounded-2xl px-5 py-3.5 text-sm font-bold ${estilos} ${className}`}
    >
      {children}
    </button>
  );
}
