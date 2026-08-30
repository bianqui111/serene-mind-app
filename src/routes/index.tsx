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
import { Ajustes } from "@/components/serena/Ajustes";
import type { Recurso } from "@/lib/serena/data";
import { cerrarSesion, versiculoNotificadoHoy, type Usuario } from "@/lib/serena/store";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import { PantallaBase, PageTransition } from "@/components/serena/Ui";
import { AnimatePresence } from "framer-motion";

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
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState<Recurso | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Leemos el nombre temporal en caso de que acabe de registrarse
        const tempName = typeof window !== "undefined" ? window.localStorage.getItem("serena.tempName") : null;
        const nombreFinal = user.displayName || tempName || user.email || "Usuario";
        
        // Si ya tiene displayName oficial de Firebase, borramos el temporal
        if (user.displayName && typeof window !== "undefined") {
          window.localStorage.removeItem("serena.tempName");
        }

        setUsuario({ nombre: nombreFinal, email: user.email || "" });
      } else {
        setUsuario(null);
      }
      setCargando(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!usuario) return;
    if (!versiculoNotificadoHoy()) notificarVersiculo();
  }, [usuario]);

  if (cargando) return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A8A]"></div></div>;

  if (!usuario) return <Auth onEntrar={setUsuario} />;

  const alInicio = () => setVista(null);

  return (
    <PantallaBase>
      <AnimatePresence mode="wait">
        <PageTransition transitionKey={vista || "inicio"}>
          {vista === "respiracion" && <Respiracion onInicio={alInicio} />}
          {vista === "emociones" && <Emociones onInicio={alInicio} />}
          {vista === "versiculos" && <Versiculos onInicio={alInicio} />}
          {vista === "arte" && <Arte onInicio={alInicio} />}
          {vista === "musica" && <Musica onInicio={alInicio} />}
          {vista === "psicologos" && <Psicologos onInicio={alInicio} />}
          {vista === "ajustes" && <Ajustes onInicio={alInicio} />}
          {!vista && (
            <Inicio
              nombre={usuario.nombre.split(" ")[0] ?? usuario.nombre}
              onAbrir={setVista}
              onSalir={() => {
                cerrarSesion();
                setUsuario(null);
              }}
            />
          )}
        </PageTransition>
      </AnimatePresence>
    </PantallaBase>
  );
}
