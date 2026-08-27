import { useState } from "react";
import { Boton, Fondo, Logo } from "./Ui";
import { iniciarSesion, registrarUsuario, type Usuario } from "@/lib/serena/store";

import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

type Pantalla = "bienvenida" | "login" | "registro" | "recuperar";

const campo =
  "w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-ring/25";

export function Auth({ onEntrar }: { onEntrar: (u: Usuario) => void }) {
  const [pantalla, setPantalla] = useState<Pantalla>("bienvenida");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await iniciarSesion(form.email.trim(), form.password);
    if (!r.ok || !r.usuario) {
      setError(r.error ?? "No pudimos iniciar sesión.");
      return;
    }
    onEntrar(r.usuario);
  };

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nombre.trim().length < 2) return setError("Ingresá tu nombre.");
    if (!form.email.includes("@")) return setError("Ingresá un correo válido.");
    if (form.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    const r = await registrarUsuario({ nombre: form.nombre.trim(), email: form.email.trim(), password: form.password });
    if (!r.ok) return setError(r.error ?? "No pudimos crear la cuenta.");
    setError("");
    setAviso("¡Cuenta creada! Ahora iniciá sesión para entrar.");
    setForm({ nombre: "", email: form.email.trim(), password: "" });
    setPantalla("login");
  };

  const recuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.includes("@")) return setError("Ingresá un correo válido.");
    try {
      await sendPasswordResetEmail(auth, form.email.trim());
      setError("");
      setAviso("Si el correo existe, te enviamos un enlace para recuperar tu contraseña.");
      setPantalla("login");
    } catch (err) {
      setError("Ocurrió un error al enviar el correo.");
    }
  };

  return (
    <Fondo>
      <div className="flex min-h-screen flex-col justify-center py-12">
        <div className="animate-rise text-center">
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 -m-8 rounded-full halo animate-glow" />
            <Logo size={128} className="relative animate-float" />
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-deep">Serenamente</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Respirá hondo. Tu calma empieza acá.
          </p>
        </div>

        {pantalla === "bienvenida" && (
          <div className="animate-rise mt-10 space-y-3 [animation-delay:150ms]">
            <p className="mb-6 text-center text-sm leading-relaxed text-secondary-foreground">
              Un espacio suave para acompañarte cuando la ansiedad aparece: respiración, emociones,
              versículos, arte y música.
            </p>
            <Boton onClick={() => { setPantalla("login"); setError(""); }}>Ya tengo cuenta · Iniciar sesión</Boton>
            <Boton variante="contorno" onClick={() => { setPantalla("registro"); setError(""); setAviso(""); }}>
              No tengo cuenta · Registrarme
            </Boton>
          </div>
        )}

        {pantalla === "login" && (
          <form onSubmit={login} className="animate-rise mt-8 space-y-3 rounded-3xl bg-card-soft p-6 shadow-soft">
            <h2 className="text-lg font-bold text-deep">Iniciar sesión</h2>
            {aviso && <p className="rounded-xl bg-accent/60 px-3 py-2 text-xs text-accent-foreground">{aviso}</p>}
            <input className={campo} placeholder="Correo electrónico" value={form.email} onChange={set("email")} />
            <input className={campo} type="password" placeholder="Contraseña" value={form.password} onChange={set("password")} />
            {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
            <Boton type="submit">Entrar</Boton>
            <button
              type="button"
              onClick={() => { setPantalla("registro"); setError(""); setAviso(""); }}
              className="w-full pt-1 text-xs font-semibold text-primary"
            >
              ¿No tenés cuenta? Creá una acá
            </button>
            <button
              type="button"
              onClick={() => { setPantalla("recuperar"); setError(""); setAviso(""); }}
              className="w-full text-xs font-semibold text-primary"
            >
              Olvidé mi contraseña
            </button>
            <button type="button" onClick={() => setPantalla("bienvenida")} className="w-full text-xs text-muted-foreground">
              Volver
            </button>
          </form>
        )}

        {pantalla === "registro" && (
          <form onSubmit={registrar} className="animate-rise mt-8 space-y-3 rounded-3xl bg-card-soft p-6 shadow-soft">
            <h2 className="text-lg font-bold text-deep">Crear cuenta</h2>
            <input className={campo} placeholder="Nombre" value={form.nombre} onChange={set("nombre")} />
            <input className={campo} placeholder="Correo electrónico" value={form.email} onChange={set("email")} />
            <input className={campo} type="password" placeholder="Contraseña" value={form.password} onChange={set("password")} />
            {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
            <Boton type="submit">Registrarme</Boton>
            <button
              type="button"
              onClick={() => { setPantalla("login"); setError(""); }}
              className="w-full pt-1 text-xs font-semibold text-primary"
            >
              Ya tengo cuenta
            </button>
          </form>
        )}

        {pantalla === "recuperar" && (
          <form onSubmit={recuperar} className="animate-rise mt-8 space-y-3 rounded-3xl bg-card-soft p-6 shadow-soft">
            <h2 className="text-lg font-bold text-deep">Recuperar contraseña</h2>
            <p className="text-xs leading-relaxed text-secondary-foreground mb-4">
              Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <input className={campo} placeholder="Correo electrónico" value={form.email} onChange={set("email")} />
            {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
            <Boton type="submit">Enviar enlace</Boton>
            <button
              type="button"
              onClick={() => { setPantalla("login"); setError(""); }}
              className="w-full pt-1 text-xs text-muted-foreground"
            >
              Volver
            </button>
          </form>
        )}
      </div>
    </Fondo>
  );
}
