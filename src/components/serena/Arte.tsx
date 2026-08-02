import { useEffect, useRef, useState } from "react";
import { CabeceraRecurso, Boton, Fondo, Recomendaciones } from "./Ui";
import { PALETA_20 } from "@/lib/serena/data";
import { borrarDibujo, getDibujos, guardarDibujo, type Dibujo } from "@/lib/serena/store";

const W = 640;
const H = 640;

type Plantilla = { id: string; nombre: string; dibujar: (c: CanvasRenderingContext2D) => void };

const circulo = (c: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.stroke();
};

const petalos = (c: CanvasRenderingContext2D, x: number, y: number, n: number, largo: number, ancho: number) => {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    c.save();
    c.translate(x, y);
    c.rotate(a);
    c.beginPath();
    c.ellipse(0, -largo * 0.6, ancho, largo * 0.6, 0, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  }
};

export const PLANTILLAS: Plantilla[] = [
  {
    id: "libre",
    nombre: "Lienzo libre",
    dibujar: () => {},
  },
  {
    id: "flor",
    nombre: "Flor de calma",
    dibujar: (c) => {
      petalos(c, 320, 260, 8, 190, 62);
      circulo(c, 320, 260, 60);
      circulo(c, 320, 260, 30);
      c.beginPath();
      c.moveTo(320, 320);
      c.quadraticCurveTo(340, 470, 320, 600);
      c.stroke();
      c.beginPath();
      c.ellipse(240, 460, 70, 32, -0.5, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.ellipse(405, 510, 70, 32, 0.5, 0, Math.PI * 2);
      c.stroke();
    },
  },
  {
    id: "mandala",
    nombre: "Mandala",
    dibujar: (c) => {
      circulo(c, 320, 320, 290);
      circulo(c, 320, 320, 220);
      circulo(c, 320, 320, 140);
      circulo(c, 320, 320, 70);
      circulo(c, 320, 320, 28);
      petalos(c, 320, 320, 12, 200, 34);
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        c.beginPath();
        c.moveTo(320 + Math.cos(a) * 220, 320 + Math.sin(a) * 220);
        c.lineTo(320 + Math.cos(a) * 290, 320 + Math.sin(a) * 290);
        c.stroke();
      }
    },
  },
  {
    id: "corazon",
    nombre: "Corazón",
    dibujar: (c) => {
      c.beginPath();
      c.moveTo(320, 520);
      c.bezierCurveTo(60, 350, 150, 110, 320, 240);
      c.bezierCurveTo(490, 110, 580, 350, 320, 520);
      c.stroke();
      c.beginPath();
      c.moveTo(320, 430);
      c.bezierCurveTo(190, 350, 230, 220, 320, 300);
      c.bezierCurveTo(410, 220, 450, 350, 320, 430);
      c.stroke();
    },
  },
  {
    id: "mariposa",
    nombre: "Mariposa",
    dibujar: (c) => {
      c.beginPath();
      c.ellipse(320, 330, 18, 150, 0, 0, Math.PI * 2);
      c.stroke();
      circulo(c, 320, 165, 34);
      [-1, 1].forEach((s) => {
        c.beginPath();
        c.ellipse(320 + s * 130, 250, 120, 90, s * 0.4, 0, Math.PI * 2);
        c.stroke();
        c.beginPath();
        c.ellipse(320 + s * 105, 420, 95, 80, -s * 0.35, 0, Math.PI * 2);
        c.stroke();
        c.beginPath();
        c.ellipse(320 + s * 140, 245, 45, 32, s * 0.4, 0, Math.PI * 2);
        c.stroke();
        c.beginPath();
        c.moveTo(320, 140);
        c.quadraticCurveTo(320 + s * 70, 70, 320 + s * 110, 95);
        c.stroke();
      });
    },
  },
  {
    id: "sol",
    nombre: "Sol y montañas",
    dibujar: (c) => {
      circulo(c, 320, 220, 105);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        c.beginPath();
        c.moveTo(320 + Math.cos(a) * 118, 220 + Math.sin(a) * 118);
        c.lineTo(320 + Math.cos(a) * 165, 220 + Math.sin(a) * 165);
        c.stroke();
      }
      c.beginPath();
      c.moveTo(20, 560);
      c.lineTo(220, 360);
      c.lineTo(360, 560);
      c.stroke();
      c.beginPath();
      c.moveTo(260, 560);
      c.lineTo(430, 390);
      c.lineTo(620, 560);
      c.stroke();
      c.beginPath();
      c.moveTo(20, 560);
      c.lineTo(620, 560);
      c.stroke();
    },
  },
  {
    id: "ola",
    nombre: "Mar en calma",
    dibujar: (c) => {
      for (let k = 0; k < 5; k++) {
        const y = 260 + k * 78;
        c.beginPath();
        c.moveTo(0, y);
        for (let x = 0; x <= W; x += 40) c.quadraticCurveTo(x + 20, y - 28, x + 40, y);
        c.stroke();
      }
      circulo(c, 470, 140, 66);
      c.beginPath();
      c.moveTo(120, 250);
      c.lineTo(200, 130);
      c.lineTo(280, 250);
      c.stroke();
    },
  },
  {
    id: "arbol",
    nombre: "Árbol de la paz",
    dibujar: (c) => {
      c.beginPath();
      c.moveTo(275, 600);
      c.lineTo(295, 340);
      c.lineTo(345, 340);
      c.lineTo(365, 600);
      c.stroke();
      circulo(c, 320, 250, 150);
      circulo(c, 195, 320, 85);
      circulo(c, 450, 320, 85);
      circulo(c, 320, 250, 70);
      c.beginPath();
      c.moveTo(60, 600);
      c.lineTo(580, 600);
      c.stroke();
    },
  },
  {
    id: "pez",
    nombre: "Pez feliz",
    dibujar: (c) => {
      c.beginPath();
      c.ellipse(300, 320, 190, 120, 0, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.moveTo(478, 320);
      c.lineTo(600, 220);
      c.lineTo(600, 420);
      c.closePath();
      c.stroke();
      circulo(c, 200, 285, 22);
      circulo(c, 200, 285, 8);
      for (let i = 0; i < 4; i++) circulo(c, 300 + i * 45, 320, 40);
      c.beginPath();
      c.moveTo(240, 370);
      c.quadraticCurveTo(275, 400, 315, 370);
      c.stroke();
    },
  },
  {
    id: "casa",
    nombre: "Hogar seguro",
    dibujar: (c) => {
      c.strokeRect(140, 300, 360, 260);
      c.beginPath();
      c.moveTo(110, 300);
      c.lineTo(320, 140);
      c.lineTo(530, 300);
      c.closePath();
      c.stroke();
      c.strokeRect(290, 420, 90, 140);
      c.strokeRect(180, 350, 80, 80);
      c.strokeRect(410, 350, 80, 80);
      circulo(c, 520, 170, 45);
    },
  },
  {
    id: "estrellas",
    nombre: "Cielo estrellado",
    dibujar: (c) => {
      const pts = [[120, 140], [300, 100], [470, 170], [180, 330], [400, 300], [540, 400], [120, 480], [320, 470], [470, 560]];
      pts.forEach((pt, i) => {
        const x = pt[0]!;
        const y = pt[1]!;
        const r = 36 + (i % 3) * 12;
        c.beginPath();
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
          const rad = k % 2 === 0 ? r : r * 0.45;
          const px = x + Math.cos(a) * rad;
          const py = y + Math.sin(a) * rad;
          k === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
        }
        c.closePath();
        c.stroke();
      });
      circulo(c, 250, 250, 20);
      circulo(c, 430, 440, 16);
    },
  },
  {
    id: "taza",
    nombre: "Taza de té",
    dibujar: (c) => {
      c.beginPath();
      c.moveTo(160, 280);
      c.lineTo(200, 500);
      c.quadraticCurveTo(320, 540, 440, 500);
      c.lineTo(480, 280);
      c.closePath();
      c.stroke();
      c.beginPath();
      c.ellipse(320, 280, 160, 40, 0, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.moveTo(478, 320);
      c.bezierCurveTo(580, 320, 580, 440, 452, 440);
      c.stroke();
      [260, 320, 380].forEach((x, i) => {
        c.beginPath();
        c.moveTo(x, 230);
        c.bezierCurveTo(x + 40, 190, x - 40, 150, x, 100 + i * 10);
        c.stroke();
      });
      c.beginPath();
      c.ellipse(320, 540, 210, 30, 0, 0, Math.PI * 2);
      c.stroke();
    },
  },
];

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  const idx = (px: number, py: number) => (py * W + px) * 4;
  const start = idx(x, y);
  const target: [number, number, number, number] = [d[start]!, d[start + 1]!, d[start + 2]!, d[start + 3]!];
  const [r, g, b] = hexToRgb(color);
  if (Math.abs(target[0] - r) < 6 && Math.abs(target[1] - g) < 6 && Math.abs(target[2] - b) < 6) return;

  const tol = 60;
  const coincide = (i: number) =>
    Math.abs(d[i]! - target[0]) <= tol &&
    Math.abs(d[i + 1]! - target[1]) <= tol &&
    Math.abs(d[i + 2]! - target[2]) <= tol &&
    Math.abs(d[i + 3]! - target[3]) <= tol;

  const stack: number[] = [x, y];
  const visto = new Uint8Array(W * H);
  while (stack.length) {
    const py = stack.pop()!;
    const px = stack.pop()!;
    if (px < 0 || py < 0 || px >= W || py >= H) continue;
    const p = py * W + px;
    if (visto[p]) continue;
    const i = p * 4;
    if (!coincide(i)) continue;
    visto[p] = 1;
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
    d[i + 3] = 255;
    stack.push(px + 1, py, px - 1, py, px, py + 1, px, py - 1);
  }
  ctx.putImageData(img, 0, 0);
}

export function Arte({ onInicio }: { onInicio: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [plantilla, setPlantilla] = useState<Plantilla>(PLANTILLAS[1]!);
  const [color, setColor] = useState<string>(PALETA_20[3]!);
  const [modo, setModo] = useState<"pintar" | "dibujar" | "borrar">("pintar");
  const [grosor, setGrosor] = useState(10);
  const [galeria, setGaleria] = useState<Dibujo[]>([]);
  const [aviso, setAviso] = useState("");
  const pintando = useRef(false);

  useEffect(() => { getDibujos().then(setGaleria); }, []);

  const render = (p = plantilla) => {
    const c = canvasRef.current?.getContext("2d", { willReadFrequently: true });
    if (!c) return;
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, W, H);
    c.strokeStyle = "#1f2937";
    c.lineWidth = 4;
    c.lineJoin = "round";
    c.lineCap = "round";
    p.dibujar(c);
  };

  useEffect(() => { render(plantilla); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [plantilla]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.round(((e.clientX - rect.left) / rect.width) * W),
      y: Math.round(((e.clientY - rect.top) / rect.height) * H),
    };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current?.getContext("2d", { willReadFrequently: true });
    if (!c) return;
    const { x, y } = pos(e);
    if (modo === "pintar") {
      floodFill(c, x, y, color);
      return;
    }
    pintando.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    c.strokeStyle = modo === "borrar" ? "#ffffff" : color;
    c.lineWidth = modo === "borrar" ? grosor * 2.5 : grosor;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    c.moveTo(x, y);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pintando.current || modo === "pintar") return;
    const c = canvasRef.current?.getContext("2d", { willReadFrequently: true });
    if (!c) return;
    const { x, y } = pos(e);
    c.lineTo(x, y);
    c.stroke();
  };

  const onUp = () => { pintando.current = false; };

  const guardar = async () => {
    const data = canvasRef.current?.toDataURL("image/png");
    if (!data) return;
    const d: Dibujo = { id: crypto.randomUUID(), fecha: new Date().toLocaleString("es-PY"), data };
    await guardarDibujo(d);
    setGaleria(await getDibujos());
    setAviso("Dibujo guardado en tu galería 💜");
    setTimeout(() => setAviso(""), 2500);
  };

  return (
    <Fondo>
      <CabeceraRecurso titulo="Arte terapia" subtitulo="Dibujá, pintá y soltá lo que sentís" onInicio={onInicio} />

      <div className="animate-rise flex gap-2 rounded-2xl bg-card p-1.5 shadow-soft">
        {(["pintar", "dibujar", "borrar"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setModo(m)}
            className={`flex-1 rounded-xl py-2.5 text-[11px] font-bold transition ${
              modo === m ? "bg-dawn text-primary-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            {m === "pintar" ? "🪣 Pintar" : m === "dibujar" ? "✏️ Dibujar" : "🧽 Borrador"}
          </button>
        ))}
      </div>

      <div className="mt-3 -mx-5 overflow-x-auto px-5 pb-1">
        <div className="flex gap-2">
          {PLANTILLAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlantilla(p)}
              className={`press shrink-0 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap ${
                plantilla.id === p.id ? "bg-primary text-primary-foreground" : "bg-card text-secondary-foreground shadow-soft"
              }`}
            >
              {p.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-rise mt-3 overflow-hidden rounded-3xl bg-card p-3 shadow-lift">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="aspect-square w-full touch-none rounded-2xl bg-white"
        />
        <div className="mt-3 grid grid-cols-10 gap-1.5">
          {PALETA_20.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              style={{ backgroundColor: c }}
              className={`aspect-square rounded-full transition ${
                color === c ? "scale-110 ring-2 ring-primary ring-offset-2" : ""
              }`}
            />
          ))}
        </div>
        {modo !== "pintar" && (
          <label className="mt-3 flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            {modo === "borrar" ? "Tamaño del borrador" : "Grosor"}
            <input
              type="range"
              min={2}
              max={40}
              value={grosor}
              onChange={(e) => setGrosor(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
          </label>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Boton variante="contorno" onClick={() => render()}>Limpiar</Boton>
          <Boton onClick={guardar}>Guardar dibujo</Boton>
        </div>
        {aviso && <p className="mt-2 text-center text-xs font-semibold text-primary">{aviso}</p>}
      </div>

      {galeria.length > 0 && (
        <section className="animate-rise mt-6">
          <h2 className="text-base font-bold text-deep">Mis dibujos guardados</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {galeria.map((d) => (
              <figure key={d.id} className="overflow-hidden rounded-2xl bg-card p-2 shadow-soft">
                <img src={d.data} alt={`Dibujo del ${d.fecha}`} loading="lazy" className="rounded-xl" />
                <figcaption className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                  {d.fecha}
                  <button
                    onClick={async () => { await borrarDibujo(d.id); setGaleria(await getDibujos()); }}
                    className="font-bold text-destructive"
                  >
                    Borrar
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <Recomendaciones recurso="arte" />
    </Fondo>
  );
}
