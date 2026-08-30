import { Fondo, Logo } from "./Ui";
import type { Recurso } from "@/lib/serena/data";
import { VERSICULOS } from "@/lib/serena/data";
import { versiculoDelDia } from "@/lib/serena/store";

const RECURSOS: { id: Recurso; titulo: string; desc: string; emoji: string }[] = [
  { id: "respiracion", titulo: "Respiración", desc: "Ejercicios guiados 4·7·8 y más", emoji: "🫁" },
  { id: "emociones", titulo: "Seguimiento emocional", desc: "Registrá y observá tus emociones", emoji: "💗" },
  { id: "versiculos", titulo: "Versículos bíblicos", desc: "20 versículos y aviso diario", emoji: "📖" },
  { id: "arte", titulo: "Arte terapia", desc: "Dibujá, pintá y guardá tus obras", emoji: "🎨" },
  { id: "musica", titulo: "Música relajante", desc: "3 ambientes sonoros de calma", emoji: "🎧" },
  { id: "psicologos", titulo: "Psicólogos", desc: "Contactá a un profesional", emoji: "🧑‍⚕️" },
];

const saludo = () => {
  const h = new Date().getHours();
  if (h < 6) return "Buenas noches";
  if (h < 13) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
};

export function Inicio({
  nombre,
  onAbrir,
  onSalir,
}: {
  nombre: string;
  onAbrir: (r: Recurso) => void;
  onSalir: () => void;
}) {
  const v = VERSICULOS[versiculoDelDia(VERSICULOS.length)]!;

  return (
    <Fondo>
      <section className="animate-rise relative mt-6 overflow-hidden rounded-[2rem] bg-dawn px-6 py-8 text-primary-foreground shadow-lift">
        <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full bg-white/25 blur-2xl animate-glow" />
        <div className="absolute -bottom-16 -right-10 h-52 w-52 rounded-full bg-white/20 blur-3xl animate-drift" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase opacity-90">{saludo()}</p>
            <h1 className="mt-1 text-3xl leading-tight font-bold">
              Hola, {nombre} <span className="inline-block animate-float">🌷</span>
            </h1>
            <p className="mt-2 max-w-[16rem] text-sm leading-relaxed opacity-95">
              Bienvenido/a a <strong>Serenamente</strong>. Hoy también podés elegir la calma. Respirá
              hondo: estamos con vos.
            </p>
          </div>
          <Logo size={72} className="animate-float" />
        </div>
        <div className="relative mt-5 rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
          <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">Versículo del día</p>
          <p className="mt-1 text-sm leading-relaxed">“{v.texto}”</p>
          <p className="mt-1 text-xs opacity-90">{v.cita}</p>
        </div>
      </section>

      <h2 className="animate-rise mt-10 text-xl font-bold text-deep">Tus recursos</h2>
      <div className="mt-4 grid auto-rows-fr grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {RECURSOS.map((r, i) => (
          <button
            key={r.id}
            onClick={() => onAbrir(r.id)}
            className="press rounded-3xl bg-card-soft p-5 text-left shadow-soft hover:shadow-md transition-shadow"
            style={{ animation: "rise 0.6s both", animationDelay: `${i * 80}ms` }}
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-dawn text-2xl shadow-soft">{r.emoji}</span>
            <span className="mt-4 block text-base font-bold text-deep">{r.titulo}</span>
            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{r.desc}</span>
          </button>
        ))}
      </div>

      <section className="animate-rise mt-8 rounded-3xl bg-card p-5 shadow-soft">
        <h2 className="text-base font-bold text-deep">Recomendaciones generales</h2>
        <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
          Elegí un recurso y al final de cada uno vas a encontrar recomendaciones específicas para el
          manejo de la ansiedad. Podés volver al inicio en cualquier momento con el botón “← Inicio”.
        </p>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => onAbrir("ajustes" as Recurso)}
          className="press rounded-2xl border border-border bg-card py-3 text-xs font-bold text-primary"
        >
          ⚙️ Ajustes
        </button>
        <button onClick={onSalir} className="press rounded-2xl border border-border bg-card py-3 text-xs font-bold text-primary">
          Cerrar sesión
        </button>
      </div>
    </Fondo>
  );
}
