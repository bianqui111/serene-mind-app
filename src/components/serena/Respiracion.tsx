import { useEffect, useRef, useState } from "react";
import { CabeceraRecurso, Fondo, Recomendaciones } from "./Ui";

type Tecnica = {
  id: string;
  nombre: string;
  desc: string;
  fases: [number, number, number, number];
};

const TECNICAS: Tecnica[] = [
  { id: "478", nombre: "4 · 7 · 8", desc: "Ideal para dormir y bajar la activación", fases: [4, 7, 8, 0] },
  { id: "caja", nombre: "Respiración en caja", desc: "Equilibra y enfoca la mente", fases: [4, 4, 4, 4] },
  { id: "calma", nombre: "Calma profunda 4 · 6", desc: "Rápida para picos de ansiedad", fases: [4, 0, 6, 0] },
];

const PRIMERA = TECNICAS[0]!;
const ETIQUETAS = ["Inhalá", "Sostené", "Exhalá", "Pausá"];
const dur = (t: Tecnica, i: number) => t.fases[i] ?? 0;

export function Respiracion({ onInicio }: { onInicio: () => void }) {
  const [tecnica, setTecnica] = useState<Tecnica>(PRIMERA);
  const [activo, setActivo] = useState(false);
  const [fase, setFase] = useState(0);
  const [resto, setResto] = useState(dur(PRIMERA, 0));
  const [ciclos, setCiclos] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!activo) return;
    ref.current = window.setInterval(() => {
      setResto((r) => {
        if (r > 1) return r - 1;
        setFase((f) => {
          let n = f;
          do { n = (n + 1) % 4; } while (dur(tecnica, n) === 0);
          if (n === 0) setCiclos((c) => c + 1);
          setResto(dur(tecnica, n));
          return n;
        });
        return 0;
      });
    }, 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [activo, tecnica]);

  const reiniciar = (t: Tecnica = tecnica) => {
    setActivo(false);
    setTecnica(t);
    setFase(0);
    setResto(dur(t, 0));
    setCiclos(0);
  };

  const escala = fase === 0 ? 1.35 : fase === 2 ? 0.72 : 1.1;
  const duracion = Math.max(dur(tecnica, fase), 1);

  return (
    <Fondo>
      <CabeceraRecurso titulo="Ejercicios de respiración" subtitulo="Seguí el círculo con tu respiración" onInicio={onInicio} />

      <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="flex flex-col gap-6">
          <div className="animate-rise grid gap-3">
            <h2 className="text-base font-bold text-deep mb-1">Elegí una técnica</h2>
            {TECNICAS.map((t) => (
              <button
                key={t.id}
                onClick={() => reiniciar(t)}
                className={`press rounded-2xl px-5 py-4 text-left shadow-soft transition hover:shadow-md ${
                  tecnica.id === t.id ? "bg-dawn text-primary-foreground" : "bg-card"
                }`}
              >
                <p className="text-sm font-bold">{t.nombre}</p>
                <p className={`text-xs mt-1 ${tecnica.id === t.id ? "opacity-90" : "text-muted-foreground"}`}>{t.desc}</p>
              </button>
            ))}
          </div>
          <div className="hidden lg:block">
            <Recomendaciones recurso="respiracion" />
          </div>
        </div>

        <div className="animate-rise mt-4 lg:mt-0 grid place-items-center bg-card-soft/50 p-8 rounded-[3rem] shadow-inner">
          <div className="relative grid h-72 w-72 md:h-80 md:w-80 place-items-center">
            <div className="absolute inset-0 rounded-full halo animate-glow" />
            <div
              className="absolute h-52 w-52 md:h-60 md:w-60 rounded-full bg-dawn opacity-90 shadow-lift"
              style={{ transform: `scale(${activo ? escala : 1})`, transition: `transform ${duracion}s ease-in-out` }}
            />
            <div className="relative text-center text-primary-foreground">
              <p className="text-lg md:text-xl font-bold drop-shadow">{activo ? ETIQUETAS[fase] : "Listo"}</p>
              <p className="text-5xl md:text-6xl font-bold drop-shadow mt-1">{activo ? resto : dur(tecnica, 0)}</p>
            </div>
          </div>
          <p className="mt-6 text-sm font-semibold text-muted-foreground">Ciclos completados: {ciclos}</p>
          <div className="mt-5 grid w-full max-w-xs grid-cols-2 gap-4">
            <button
              onClick={() => setActivo((a) => !a)}
              className="press rounded-2xl bg-dawn px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-md"
            >
              {activo ? "Pausar" : "Comenzar"}
            </button>
            <button
              onClick={() => reiniciar()}
              className="press rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-bold text-primary hover:bg-white transition-colors"
            >
              Reiniciar
            </button>
          </div>
        </div>
      </div>

      <Recomendaciones recurso="respiracion" />
    </Fondo>
  );
}
