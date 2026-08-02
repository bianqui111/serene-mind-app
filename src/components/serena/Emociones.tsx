import { useEffect, useState } from "react";
import { CabeceraRecurso, Boton, Fondo, Recomendaciones } from "./Ui";
import { EMOCIONES } from "@/lib/serena/data";
import { borrarEmocion, getEmociones, guardarEmocion, type RegistroEmocion } from "@/lib/serena/store";

export function Emociones({ onInicio }: { onInicio: () => void }) {
  const [registros, setRegistros] = useState<RegistroEmocion[]>([]);
  const [emocion, setEmocion] = useState(EMOCIONES[0]!);
  const [nivel, setNivel] = useState(5);
  const [nota, setNota] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => setRegistros(getEmociones()), []);

  const guardar = () => {
    guardarEmocion({
      id: crypto.randomUUID(),
      fecha: new Date().toLocaleString("es-PY"),
      emocion: emocion.label,
      emoji: emocion.emoji,
      nivel,
      nota: nota.trim(),
    });
    setRegistros(getEmociones());
    setNota("");
    setAviso("Registro guardado 💙");
    setTimeout(() => setAviso(""), 2200);
  };

  const promedio = registros.length
    ? (registros.reduce((a, r) => a + r.nivel, 0) / registros.length).toFixed(1)
    : "—";

  const estadisticas = EMOCIONES.map((e) => {
    const rs = registros.filter((r) => r.emocion === e.label);
    const prom = rs.length ? rs.reduce((a, r) => a + r.nivel, 0) / rs.length : 0;
    return {
      ...e,
      veces: rs.length,
      promedio: prom,
      maximo: rs.length ? Math.max(...rs.map((r) => r.nivel)) : 0,
      porcentaje: registros.length ? (rs.length / registros.length) * 100 : 0,
    };
  })
    .filter((e) => e.veces > 0)
    .sort((a, b) => b.veces - a.veces);

  return (
    <Fondo>
      <CabeceraRecurso titulo="Seguimiento emocional" subtitulo="Registrá cómo te sentís hoy" onInicio={onInicio} />

      <div className="animate-rise rounded-3xl bg-card-soft p-5 shadow-soft">
        <p className="text-sm font-bold text-deep">¿Qué emoción predomina?</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {EMOCIONES.map((e) => (
            <button
              key={e.id}
              onClick={() => setEmocion(e)}
              className={`press rounded-2xl py-3 text-center transition ${
                emocion.id === e.id ? "bg-dawn text-primary-foreground shadow-soft" : "bg-card"
              }`}
            >
              <span className="block text-2xl">{e.emoji}</span>
              <span className="mt-1 block text-[10px] font-semibold">{e.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-5 text-sm font-bold text-deep">Intensidad: {nivel}/10</p>
        <input
          type="range"
          min={1}
          max={10}
          value={nivel}
          onChange={(e) => setNivel(Number(e.target.value))}
          className="mt-2 w-full accent-primary"
        />

        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="¿Qué la disparó? ¿Dónde la sentís en el cuerpo?"
          rows={3}
          className="mt-4 w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring/25"
        />
        <div className="mt-3">
          <Boton onClick={guardar}>Guardar registro</Boton>
        </div>
        {aviso && <p className="mt-2 text-center text-xs font-semibold text-primary">{aviso}</p>}
      </div>

      <div className="animate-rise mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-4 text-center shadow-soft">
          <p className="text-2xl font-bold text-deep">{registros.length}</p>
          <p className="text-[11px] text-muted-foreground">Registros</p>
        </div>
        <div className="rounded-2xl bg-card p-4 text-center shadow-soft">
          <p className="text-2xl font-bold text-deep">{promedio}</p>
          <p className="text-[11px] text-muted-foreground">Intensidad promedio</p>
        </div>
      </div>

      {estadisticas.length > 0 && (
        <section className="animate-rise mt-6 rounded-3xl bg-card p-4 shadow-soft">
          <h2 className="text-base font-bold text-deep">Estadística de mis emociones</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">Resumen de tus {registros.length} registros</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-bold">Emoción</th>
                  <th className="pb-2 text-center font-bold">Veces</th>
                  <th className="pb-2 text-center font-bold">Prom.</th>
                  <th className="pb-2 text-center font-bold">Máx.</th>
                  <th className="pb-2 text-right font-bold">%</th>
                </tr>
              </thead>
              <tbody>
                {estadisticas.map((e) => (
                  <tr key={e.id} className="border-t border-border align-middle">
                    <td className="py-2.5 font-semibold text-deep">
                      <span className="mr-1.5">{e.emoji}</span>
                      {e.label}
                    </td>
                    <td className="py-2.5 text-center text-secondary-foreground">{e.veces}</td>
                    <td className="py-2.5 text-center text-secondary-foreground">{e.promedio.toFixed(1)}</td>
                    <td className="py-2.5 text-center text-secondary-foreground">{e.maximo}</td>
                    <td className="py-2.5 text-right">
                      <span className="font-bold text-primary">{Math.round(e.porcentaje)}%</span>
                      <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-dawn"
                          style={{ width: `${e.porcentaje}%` }}
                        />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}



      {registros.length > 0 && (
        <section className="animate-rise mt-6 space-y-2">
          <h2 className="text-base font-bold text-deep">Mi historial</h2>
          {registros.map((r) => (
            <article key={r.id} className="rounded-2xl bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{r.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-deep">{r.emocion} · {r.nivel}/10</p>
                  <p className="text-[11px] text-muted-foreground">{r.fecha}</p>
                </div>
                <button
                  onClick={() => { borrarEmocion(r.id); setRegistros(getEmociones()); }}
                  className="text-[11px] font-bold text-destructive"
                >
                  Borrar
                </button>
              </div>
              {r.nota && <p className="mt-2 text-xs leading-relaxed text-secondary-foreground">{r.nota}</p>}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-dawn" style={{ width: `${r.nivel * 10}%` }} />
              </div>
            </article>
          ))}
        </section>
      )}

      <Recomendaciones recurso="emociones" />
    </Fondo>
  );
}
