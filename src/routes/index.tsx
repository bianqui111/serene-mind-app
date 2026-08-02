import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Auth } from "@/components/serena/Auth";
import { Inicio } from "@/components/serena/Inicio";
import { Respiracion } from "@/components/serena/Respiracion";
import { Emociones } from "@/components/serena/Emociones";
import { Versiculos, notificarVersiculo } from "@/components/serena/Versiculos";
import { Arte } from "@/components/serena/Arte";
import { Musica } from "@/components/serena/Musica";
import { Psicologos } from "@/components/serena/Psicologos";
import type { Recurso } from "@/lib/serena/data";
import { cerrarSesion, sesionActiva, versiculoNotificadoHoy, type Usuario } from "@/lib/serena/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Serenamente · App de calma y manejo de la ansiedad" },
      {
        name: "description",
        content:
          "Serenamente: respiración guiada, seguimiento emocional, versículos bíblicos diarios, arte terapia, música relajante y psicólogos para acompañarte.",
      },
      { property: "og:title", content: "Serenamente · Tu espacio de calma" },
      {
        property: "og:description",
        content:
          "Respiración, emociones, versículos, arte terapia y música relajante en una sola app para el manejo de la ansiedad.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
  ssr: false,
});

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [vista, setVista] = useState<Recurso | null>(null);

  useEffect(() => setUsuario(sesionActiva()), []);

  useEffect(() => {
    if (!usuario) return;
    if (!versiculoNotificadoHoy()) notificarVersiculo();
  }, [usuario]);

  if (!usuario) return <Auth onEntrar={setUsuario} />;

  const alInicio = () => setVista(null);

  if (vista === "respiracion") return <Respiracion onInicio={alInicio} />;
  if (vista === "emociones") return <Emociones onInicio={alInicio} />;
  if (vista === "versiculos") return <Versiculos onInicio={alInicio} />;
  if (vista === "arte") return <Arte onInicio={alInicio} />;
  if (vista === "musica") return <Musica onInicio={alInicio} />;
  if (vista === "psicologos") return <Psicologos onInicio={alInicio} />;

  return (
    <Inicio
      nombre={usuario.nombre.split(" ")[0] ?? usuario.nombre}
      onAbrir={setVista}
      onSalir={() => {
        cerrarSesion();
        setUsuario(null);
      }}
    />
  );
}
