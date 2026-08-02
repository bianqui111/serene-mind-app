import { useEffect, useRef, useState } from "react";
import { CabeceraRecurso, Fondo, Recomendaciones } from "./Ui";

const TECNICAS = [
  { id: "478", nombre: "4 · 7 · 8", desc: "Ideal para dormir y bajar la activación", fases: [4, 7, 8, 0] },
  { id: "caja", nombre: "Respiración en caja", desc: "Equilibra y enfoca la mente", fases: [4, 4, 4, 4] },
  { id: "calma", nombre: "Calma profunda 4 · 6", desc: "Rápida para picos de ansiedad", fases: [4, 0, 6, 0] },
];

const ETIQUETAS = ["Inhalá", "Sostené", "Exhalá", "Pausá"];

export function Respiracion({ onInicio }: { onInicio: () => void }) {
  const [tecnica, setTecnica] = useState(TECNICAS[0]);
  const [activo, setActivo] = useState(false);
  const [fase, setFase] = useState(0);
  const [resto, setResto] = useState(TECNICAS[0].fases[0]);
  const [ciclos, setCiclos] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!activo) return;
    ref.current = window.setInterval(() => {
      setResto((r) => {
        if (r > 1) return r - 1;
        setFase((f) => {
          let n = f;
          do { n = (n + 1) % 4; } while (tecnica.fases[n] === 0);
          if (n === 0) setCiclos((c) => c + 1);
          setResto(tecnica.fases[n]);
          return n;
        });
        return 0;
      });
    }, 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [activo, tecnica]);

  const reiniciar = (t = tecnica) => {
    setActivo(false);
    setTecnica(t);
    setFase(0);
    setResto(t.fases[0]);
    setCiclos(0);
  };

  const escala = fase === 0 ? 1.35 : fase === 2 ? 0.72 : 1.1;
  const duracion = Math.max(tecnica.fases[fase], 1);

  return (
    <Fondo>
      <CabeceraRecurso titulo="Ejercicios de respiración" subtitulo="Seguí el círculo con tu respiración" onInicio={onInicio} />

      <div className="animate-rise grid gap-2">
        {TECNICAS.map((t) => (
          <button
            key={t.id}
            onClick={() => reiniciar(t)}
            className={`press rounded-2xl px-4 py-3 text-left shadow-soft transition ${
              tecnica.id === t.id ? "bg-dawn text-primary-foreground" : "bg-card"
            }`}
          >
            <p className="text-sm font-bold">{t.nombre}</p>
            <p className={`text-xs ${tecnica.id === t.id ? "opacity-85" : "text-muted-foreground"}`}>{t.desc}</p>
          </button>
        ))}
      </div>

      <div className="animate-rise mt-8 grid place-items-center">
        <div className="relative grid h-72 w-72 place-items-center">
          <div className="absolute inset-0 rounded-full halo animate-glow" />
          <div
            className="absolute h-52 w-52 rounded-full bg-dawn opacity-90 shadow-lift"
            style={{ transform: `scale(${activo ? escala : 1})`, transition: `transform ${duracion}s ease-in-out` }}
          />
          <div className="relative text-center text-primary-foreground">
            <p className="text-lg font-bold drop-shadow">{activo ? ETIQUETAS[fase] : "Listo"}</p>
            <p className="text-5xl font-bold drop-shadow">{activo ? resto : tecnica.fases[0]}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Ciclos completados: {ciclos}</p>
        <div className="mt-5 grid w-full grid-cols-2 gap-3">
          <button
            onClick={() => setActivo((a) => !a)}
            className="press rounded-2xl bg-dawn px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-soft"
          >
            {activo ? "Pausar" : "Comenzar"}
          </button>
          <button
            onClick={() => reiniciar()}
            className="press rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-bold text-primary"
          >
            Reiniciar
          </button>
        </div>
      </div>

      <Recomendaciones recurso="respiracion" />
    </Fondo>
  );
}
