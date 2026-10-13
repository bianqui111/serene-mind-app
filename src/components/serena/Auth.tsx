import { useState } from "react";
import { Boton, Fondo, Logo } from "./Ui";
import { iniciarSesion, registrarUsuario, type Usuario } from "@/lib/serena/store";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { ModalPoliticaPrivacidad } from "./ModalPoliticaPrivacidad";
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type Pantalla = "bienvenida" | "login" | "registro" | "recuperar";

const campo =
  "w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-ring/25";

export function Auth({ onEntrar }: { onEntrar: (u: Usuario) => void }) {
  const [pantalla, setPantalla] = useState<Pantalla>("bienvenida");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(true);
  const [modalPrivacidad, setModalPrivacidad] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Completá todos los campos.");
      return;
    }
    setCargando(true);
    setError("");
    const r = await iniciarSesion(form.email.trim(), form.password);
    setCargando(false);
    if (!r.ok || !r.usuario) {
      setError(r.error ?? "No pudimos iniciar sesión.");
      return;
    }
    toast.success("¡Bienvenido/a de vuelta! 🌷");
    onEntrar(r.usuario);
  };

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nombre.trim().length < 2) return setError("Ingresá tu nombre.");
    if (!form.email.includes("@")) return setError("Ingresá un correo válido.");
    if (form.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (!aceptaTerminos) return setError("Debés aceptar las medidas de privacidad y seguridad para continuar.");

    setCargando(true);
    setError("");
    const r = await registrarUsuario({
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      password: form.password,
    });
    setCargando(false);

    if (!r.ok) return setError(r.error ?? "No pudimos crear la cuenta.");
    setError("");
    setAviso("¡Cuenta creada con éxito! Ahora iniciá sesión para entrar de forma segura.");
    toast.success("Cuenta creada exitosamente 💙");
    setForm({ nombre: "", email: form.email.trim(), password: "" });
    setPantalla("login");
  };

  const recuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.includes("@")) return setError("Ingresá un correo válido.");
    setCargando(true);
    try {
      await sendPasswordResetEmail(auth, form.email.trim());
      setError("");
      setAviso("Si el correo existe, te enviamos un enlace para recuperar tu contraseña.");
      toast.success("Correo de recuperación enviado.");
      setPantalla("login");
    } catch (err) {
      setError("Ocurrió un error al enviar el correo.");
    } finally {
      setCargando(false);
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
            <Boton onClick={() => { setPantalla("login"); setError(""); }}>
              Ya tengo cuenta · Iniciar sesión
            </Boton>
            <Boton variante="contorno" onClick={() => { setPantalla("registro"); setError(""); setAviso(""); }}>
              No tengo cuenta · Registrarme
            </Boton>

            <div className="pt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Espacio confidencial · Tus emociones son 100% privadas</span>
            </div>
          </div>
        )}

        {pantalla === "login" && (
          <form onSubmit={login} className="animate-rise mt-8 space-y-3 rounded-3xl bg-card-soft p-6 shadow-soft">
            <h2 className="text-lg font-bold text-deep flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Iniciar sesión
            </h2>
            {aviso && <p className="rounded-xl bg-accent/60 px-3 py-2 text-xs text-accent-foreground">{aviso}</p>}
            <input
              type="email"
              className={campo}
              placeholder="Correo electrónico"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
              required
            />
            <div className="relative">
              <input
                className={campo}
                type={mostrarPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={form.password}
                onChange={set("password")}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                aria-label="Ver u ocultar contraseña"
              >
                {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
            <Boton type="submit" disabled={cargando}>
              {cargando ? "Iniciando sesión..." : "Entrar"}
            </Boton>
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
            <button
              type="button"
              onClick={() => setPantalla("bienvenida")}
              className="w-full text-xs text-muted-foreground"
            >
              Volver
            </button>
          </form>
        )}

        {pantalla === "registro" && (
          <form onSubmit={registrar} className="animate-rise mt-8 space-y-3 rounded-3xl bg-card-soft p-6 shadow-soft">
            <h2 className="text-lg font-bold text-deep flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Crear cuenta segura
            </h2>
            <input
              className={campo}
              placeholder="Nombre o alias"
              value={form.nombre}
              onChange={set("nombre")}
              required
            />
            <input
              type="email"
              className={campo}
              placeholder="Correo electrónico"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
              required
            />
            <div className="relative">
              <input
                className={campo}
                type={mostrarPassword ? "text" : "password"}
                placeholder="Contraseña (mín. 6 caracteres)"
                value={form.password}
                onChange={set("password")}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                aria-label="Ver u ocultar contraseña"
              >
                {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Aceptación de Políticas de Privacidad y Seguridad */}
            <div className="flex items-start gap-2.5 pt-1 text-left">
              <input
                id="terminos"
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border accent-primary cursor-pointer"
              />
              <label htmlFor="terminos" className="text-xs leading-relaxed text-secondary-foreground cursor-pointer">
                Acepto las medidas de privacidad y seguridad. Mis registros emocionales son confidenciales.{" "}
                <button
                  type="button"
                  onClick={() => setModalPrivacidad(true)}
                  className="font-semibold text-primary underline inline"
                >
                  Ver política
                </button>
              </label>
            </div>

            {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
            <Boton type="submit" disabled={cargando}>
              {cargando ? "Creando cuenta..." : "Registrarme"}
            </Boton>
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
            <input
              type="email"
              className={campo}
              placeholder="Correo electrónico"
              value={form.email}
              onChange={set("email")}
              required
            />
            {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
            <Boton type="submit" disabled={cargando}>
              {cargando ? "Enviando enlace..." : "Enviar enlace"}
            </Boton>
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

      <ModalPoliticaPrivacidad
        abierto={modalPrivacidad}
        onCerrar={() => setModalPrivacidad(false)}
      />
    </Fondo>
  );
}
