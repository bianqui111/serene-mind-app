import { useEffect, useRef, useState } from "react";
import { CabeceraRecurso, Fondo, Recomendaciones } from "./Ui";

type Pista = {
  id: string;
  nombre: string;
  desc: string;
  emoji: string;
  crear: (ctx: AudioContext, destino: GainNode) => () => void;
};

const ruido = (ctx: AudioContext, segundos = 4) => {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * segundos, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  return src;
};

const PISTAS: Pista[] = [
  {
    id: "oceano",
    nombre: "Olas del océano",
    desc: "Oleaje suave y constante · 1",
    emoji: "🌊",
    crear: (ctx, destino) => {
      const src = ruido(ctx);
      const filtro = ctx.createBiquadFilter();
      filtro.type = "lowpass";
      filtro.frequency.value = 500;
      const vaiven = ctx.createGain();
      vaiven.gain.value = 0.35;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.11;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.3;
      lfo.connect(lfoGain).connect(vaiven.gain);
      src.connect(filtro).connect(vaiven).connect(destino);
      src.start();
      lfo.start();
      return () => { src.stop(); lfo.stop(); };
    },
  },
  {
    id: "lluvia",
    nombre: "Lluvia serena",
    desc: "Lluvia fina sobre el tejado · 2",
    emoji: "🌧️",
    crear: (ctx, destino) => {
      const src = ruido(ctx);
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 900;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 5200;
      const g = ctx.createGain();
      g.gain.value = 0.28;
      src.connect(hp).connect(lp).connect(g).connect(destino);
      src.start();
      return () => src.stop();
    },
  },
  {
    id: "cuencos",
    nombre: "Cuencos tibetanos",
    desc: "Drones armónicos para meditar · 3",
    emoji: "🎐",
    crear: (ctx, destino) => {
      const frecuencias = [136.1, 204.2, 272.2, 340.3];
      const osciladores = frecuencias.map((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = 0.14 / (i + 1);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.06 + i * 0.02;
        const lg = ctx.createGain();
        lg.gain.value = 0.05;
        lfo.connect(lg).connect(g.gain);
        osc.connect(g).connect(destino);
        osc.start();
        lfo.start();
        return () => { osc.stop(); lfo.stop(); };
      });
      return () => osciladores.forEach((stop) => stop());
    },
  },
];

export function Musica({ onInicio }: { onInicio: () => void }) {
  const [sonando, setSonando] = useState<string | null>(null);
  const [volumen, setVolumen] = useState(0.6);
  const [minutos, setMinutos] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!sonando) return;
    const t = window.setInterval(() => setMinutos((m) => m + 1), 60000);
    return () => window.clearInterval(t);
  }, [sonando]);

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volumen;
  }, [volumen]);

  const detener = () => {
    stopRef.current?.();
    stopRef.current = null;
    setSonando(null);
  };

  useEffect(() => () => stopRef.current?.(), []);

  const reproducir = (p: Pista) => {
    if (sonando === p.id) return detener();
    stopRef.current?.();
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = ctxRef.current ?? new Ctx();
    ctxRef.current = ctx;
    void ctx.resume();
    if (!gainRef.current) {
      const g = ctx.createGain();
      g.connect(ctx.destination);
      gainRef.current = g;
    }
    gainRef.current.gain.value = volumen;
    stopRef.current = p.crear(ctx, gainRef.current);
    setSonando(p.id);
  };

  return (
    <Fondo>
      <CabeceraRecurso titulo="Música para relajarte" subtitulo="3 ambientes sonoros generados en vivo" onInicio={onInicio} />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-6">
          <div className="animate-rise grid gap-4">
            <h2 className="text-base font-bold text-deep mb-1">Elegí tu ambiente</h2>
            {PISTAS.map((p) => (
              <button
                key={p.id}
                onClick={() => reproducir(p)}
                className={`press flex items-center gap-4 rounded-3xl p-5 text-left shadow-soft transition hover:shadow-md ${
                  sonando === p.id ? "bg-dawn text-primary-foreground" : "bg-card"
                }`}
              >
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl transition-colors ${
                  sonando === p.id ? "bg-white/25" : "bg-secondary"
                }`}>
                  {p.emoji}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold">{p.nombre}</span>
                  <span className={`block text-xs mt-1 ${sonando === p.id ? "opacity-90" : "text-muted-foreground"}`}>{p.desc}</span>
                </span>
                <span className="text-xl">{sonando === p.id ? "⏸" : "▶"}</span>
              </button>
            ))}
          </div>
          <div className="hidden lg:block">
            <Recomendaciones recurso="musica" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {sonando ? (
            <div className="animate-rise rounded-3xl bg-card-soft p-8 shadow-inner flex flex-col justify-center min-h-[300px]">
              <div className="flex h-24 items-end justify-center gap-2">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-2 md:w-3 rounded-full bg-dawn"
                    style={{
                      height: `${25 + Math.abs(Math.sin(i)) * 60}%`,
                      animation: "float 2.4s ease-in-out infinite",
                      animationDelay: `${i * 90}ms`,
                    }}
                  />
                ))}
              </div>
              <label className="mt-8 flex items-center gap-4 text-sm font-semibold text-muted-foreground">
                <span className="text-xl">🔉</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volumen}
                  onChange={(e) => setVolumen(Number(e.target.value))}
                  className="flex-1 accent-primary cursor-pointer"
                />
                <span className="text-xl">🔊</span>
              </label>
              <p className="mt-6 text-center text-sm font-bold text-deep">Llevás {minutos} min de relajación</p>
            </div>
          ) : (
            <div className="hidden lg:flex flex-1 flex-col items-center justify-center rounded-3xl bg-card-soft p-6 text-center border border-dashed border-border/50 min-h-[300px]">
              <span className="text-4xl mb-3">🎧</span>
              <p className="text-sm font-semibold text-deep">Silencio total</p>
              <p className="text-xs text-muted-foreground mt-1">Seleccioná un ambiente sonoro a tu izquierda para comenzar.</p>
            </div>
          )}
          <div className="block lg:hidden">
            <Recomendaciones recurso="musica" />
          </div>
        </div>
      </div>
    </Fondo>
  );
}
