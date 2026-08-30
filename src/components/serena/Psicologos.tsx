import { useState } from "react";
import { CabeceraRecurso, Fondo, Recomendaciones } from "./Ui";
import { PSICOLOGOS } from "@/lib/serena/data";

export function Psicologos({ onInicio }: { onInicio: () => void }) {
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  return (
    <Fondo>
      <CabeceraRecurso titulo="Psicólogos" subtitulo="Especialistas en adolescentes y jóvenes" onInicio={onInicio} />

      <div className="animate-rise grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {PSICOLOGOS.map((p, i) => (
          <article
            key={p.nombre}
            className="rounded-3xl bg-card p-5 shadow-soft transition hover:-translate-y-1"
            style={{ animation: "rise 0.6s both", animationDelay: `${i * 90}ms` }}
          >
            <div className="flex items-center gap-4">
              {p.foto ? (
                <img 
                  src={p.foto} 
                  alt={p.nombre} 
                  onClick={() => setFotoAmpliada(p.foto!)}
                  className="h-14 w-14 cursor-pointer rounded-2xl object-cover object-top shadow-sm transition hover:scale-105"
                />
              ) : (
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-dawn text-lg font-bold text-primary-foreground">
                  {p.inicial}
                </span>
              )}
              <div>
                <h2 className="text-base font-bold text-deep">{p.nombre}</h2>
                <p className="text-xs text-muted-foreground">{p.especialidad}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-secondary-foreground">{p.descripcion}</p>
            <p className="mt-2 text-[11px] font-semibold text-muted-foreground">{p.experiencia}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
              <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">{p.modalidad}</span>
              <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">Adolescentes y jóvenes</span>
              <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">Paraguay</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href={`tel:${p.telefono.replace(/\s/g, "")}`}
                className="press rounded-2xl bg-dawn px-4 py-3 text-center text-xs font-bold text-primary-foreground shadow-soft"
              >
                📞 {p.telefono}
              </a>
              <a
                href={`https://wa.me/${p.telefono.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="press rounded-2xl border border-border bg-card px-4 py-3 text-center text-xs font-bold text-primary"
              >
                Escribir por WhatsApp
              </a>
            </div>
          </article>
        ))}
      </div>

      <Recomendaciones recurso="psicologos" />

      {fotoAmpliada && (
        <div 
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200"
          onClick={() => setFotoAmpliada(null)}
        >
          <img 
            src={fotoAmpliada} 
            alt="Foto ampliada" 
            className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            className="absolute right-6 top-6 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md"
            onClick={() => setFotoAmpliada(null)}
          >
            ✕
          </button>
        </div>
      )}
    </Fondo>
  );
}
