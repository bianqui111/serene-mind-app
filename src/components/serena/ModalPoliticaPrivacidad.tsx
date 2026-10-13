import { POLITICA_PRIVACIDAD } from "@/lib/serena/privacy";
import { ShieldCheck, X, Lock, KeyRound, Download, Trash2, HeartHandshake } from "lucide-react";

export function ModalPoliticaPrivacidad({
  abierto,
  onCerrar,
}: {
  abierto: boolean;
  onCerrar: () => void;
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card p-6 md:p-8 shadow-2xl border border-border animate-rise">
        <button
          onClick={onCerrar}
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-dawn text-primary-foreground shadow-soft">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-deep">{POLITICA_PRIVACIDAD.titulo}</h2>
            <p className="text-xs text-muted-foreground">Serenamente · Protección integral</p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-secondary-foreground bg-accent/30 p-3.5 rounded-2xl border border-accent/40">
          {POLITICA_PRIVACIDAD.resumen}
        </p>

        <div className="mt-5 space-y-4">
          {POLITICA_PRIVACIDAD.puntos.map((punto, i) => (
            <div key={i} className="rounded-2xl bg-card-soft p-4 shadow-sm border border-border/40">
              <h3 className="text-sm font-bold text-deep flex items-center gap-2">
                {punto.titulo}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-secondary-foreground">
                {punto.descripcion}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border flex justify-end">
          <button
            onClick={onCerrar}
            className="press rounded-2xl bg-dawn px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-soft hover:shadow-md transition-shadow"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
