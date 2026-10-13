import { useState, useEffect } from "react";
import { CabeceraRecurso, Fondo } from "./Ui";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  isPinLockActive,
  configurarPin,
  desactivarPin,
  exportarDatosJson,
} from "@/lib/serena/privacy";
import { getEmociones, borrarTodasLasEmociones } from "@/lib/serena/store";
import { ModalPoliticaPrivacidad } from "./ModalPoliticaPrivacidad";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  Unlock,
  Download,
  Trash2,
  FileText,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export function Ajustes({ onInicio }: { onInicio: () => void }) {
  const email = auth.currentUser?.email ?? "";
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorRecuperacion, setErrorRecuperacion] = useState("");

  // Estado de Bloqueo por PIN
  const [pinActivo, setPinActivo] = useState(false);
  const [mostrarFormPin, setMostrarFormPin] = useState(false);
  const [nuevoPin, setNuevoPin] = useState("");
  const [confirmarPin, setConfirmarPin] = useState("");
  const [errorPin, setErrorPin] = useState("");

  // Estado del Modal de Política de Privacidad
  const [modalPrivacidadAbierto, setModalPrivacidadAbierto] = useState(false);

  // Estados de exportación y borrado
  const [exportando, setExportando] = useState(false);
  const [borrando, setBorrando] = useState(false);

  useEffect(() => {
    setPinActivo(isPinLockActive());
  }, []);

  const enviarRecuperacion = async () => {
    if (!email) {
      setErrorRecuperacion("No se encontró un correo asociado a tu cuenta.");
      return;
    }
    setCargando(true);
    setErrorRecuperacion("");
    try {
      await sendPasswordResetEmail(auth, email);
      setEnviado(true);
      toast.success("Correo de recuperación enviado con éxito.");
    } catch (e: any) {
      setErrorRecuperacion("Ocurrió un error al enviar el correo. Intentá de nuevo.");
      toast.error("Error al enviar correo de recuperación.");
    } finally {
      setCargando(false);
    }
  };

  const handleGuardarPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPin("");

    if (nuevoPin.length !== 4 || !/^\d{4}$/.test(nuevoPin)) {
      setErrorPin("El PIN debe tener exactamente 4 números.");
      return;
    }

    if (nuevoPin !== confirmarPin) {
      setErrorPin("Los códigos PIN no coinciden.");
      return;
    }

    const exito = await configurarPin(nuevoPin);
    if (exito) {
      setPinActivo(true);
      setMostrarFormPin(false);
      setNuevoPin("");
      setConfirmarPin("");
      toast.success("¡Bloqueo por PIN activado correctamente! 🔒");
    } else {
      setErrorPin("No se pudo configurar el PIN.");
    }
  };

  const handleDesactivarPin = () => {
    if (window.confirm("¿Seguro/a que querés desactivar el bloqueo por PIN?")) {
      desactivarPin();
      setPinActivo(false);
      setMostrarFormPin(false);
      setNuevoPin("");
      setConfirmarPin("");
      toast.info("Bloqueo por PIN desactivado.");
    }
  };

  const handleExportarDatos = async () => {
    setExportando(true);
    try {
      const registros = await getEmociones();
      if (registros.length === 0) {
        toast.info("No tenés registros guardados aún para exportar.");
        setExportando(false);
        return;
      }
      exportarDatosJson(registros, email);
      toast.success(`Se exportaron ${registros.length} registros con éxito. 📁`);
    } catch (err) {
      toast.error("Error al exportar los datos.");
    } finally {
      setExportando(false);
    }
  };

  const handleBorrarTodosLosDatos = async () => {
    const confirmacion = window.confirm(
      "⚠️ ATENCIÓN: Esta acción eliminará permanentemente TODOS tus registros de seguimiento emocional. No se podrán recuperar.\n\n¿Estás seguro/a de continuar?"
    );

    if (!confirmacion) return;

    setBorrando(true);
    try {
      const resultado = await borrarTodasLasEmociones();
      if (resultado.ok) {
        toast.success(`Se eliminaron ${resultado.count} registros permanentemente.`);
      } else {
        toast.error(resultado.error || "No se pudieron eliminar los registros.");
      }
    } catch (e) {
      toast.error("Ocurrió un error al procesar el borrado.");
    } finally {
      setBorrando(false);
    }
  };

  return (
    <Fondo>
      <CabeceraRecurso titulo="Ajustes" subtitulo="Seguridad, privacidad y tu cuenta" onInicio={onInicio} />

      <div className="animate-rise grid gap-6 md:grid-cols-2">
        {/* Columna Izquierda: Medidas de Seguridad y Privacidad */}
        <div className="flex flex-col gap-6">
          {/* Tarjeta de Seguridad y Privacidad */}
          <section className="rounded-3xl bg-card p-6 shadow-soft border border-border/40">
            <div className="flex items-center gap-2.5 text-primary">
              <ShieldCheck className="h-6 w-6" />
              <h2 className="text-base font-bold text-deep">Seguridad y Privacidad</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-secondary-foreground">
              Tus emociones y notas están resguardadas con reglas estrictas de acceso por usuario y cifrado en tránsito.
            </p>

            <button
              onClick={() => setModalPrivacidadAbierto(true)}
              className="press mt-4 flex items-center justify-between w-full rounded-2xl bg-card-soft px-4 py-3 text-xs font-bold text-deep hover:bg-muted/80 transition-colors border border-border/50"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Ver Política de Privacidad y Medidas
              </span>
              <span className="text-primary font-bold">Leer →</span>
            </button>

            {/* Candado de Privacidad (PIN Lock) */}
            <div className="mt-5 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {pinActivo ? (
                    <Lock className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Unlock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-xs font-bold text-deep">Bloqueo local por PIN</p>
                    <p className="text-[11px] text-muted-foreground">
                      {pinActivo ? "Activado · Protegido con código" : "Desactivado"}
                    </p>
                  </div>
                </div>

                {pinActivo ? (
                  <button
                    onClick={handleDesactivarPin}
                    className="press rounded-xl bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    Desactivar
                  </button>
                ) : (
                  <button
                    onClick={() => setMostrarFormPin(!mostrarFormPin)}
                    className="press rounded-xl bg-dawn px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-soft hover:shadow-md transition-shadow"
                  >
                    {mostrarFormPin ? "Cancelar" : "Activar PIN"}
                  </button>
                )}
              </div>

              {mostrarFormPin && !pinActivo && (
                <form onSubmit={handleGuardarPin} className="mt-4 rounded-2xl bg-card-soft p-4 animate-rise space-y-3">
                  <p className="text-xs font-semibold text-deep">Elegí un código PIN de 4 números:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="Nuevo PIN"
                      value={nuevoPin}
                      onChange={(e) => setNuevoPin(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-center text-sm font-mono tracking-widest outline-none focus:border-primary"
                    />
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="Confirmar PIN"
                      value={confirmarPin}
                      onChange={(e) => setConfirmarPin(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-center text-sm font-mono tracking-widest outline-none focus:border-primary"
                    />
                  </div>
                  {errorPin && <p className="text-[11px] font-semibold text-destructive">{errorPin}</p>}
                  <button
                    type="submit"
                    className="press w-full rounded-xl bg-dawn py-2 text-xs font-bold text-primary-foreground shadow-soft"
                  >
                    Guardar código PIN
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Control de Datos y Derechos de Privacidad */}
          <section className="rounded-3xl bg-card p-6 shadow-soft border border-border/40">
            <h2 className="text-base font-bold text-deep flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              Tus derechos sobre tus datos
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-secondary-foreground">
              Sos el único propietario de tus registros. Podés solicitar una copia o eliminarlos en cualquier momento.
            </p>

            <div className="mt-4 flex flex-col gap-2.5">
              <button
                onClick={handleExportarDatos}
                disabled={exportando}
                className="press flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-2.5 text-xs font-bold text-primary hover:bg-card-soft transition-colors disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {exportando ? "Preparando descarga..." : "Descargar mis datos (JSON)"}
              </button>

              <button
                onClick={handleBorrarTodosLosDatos}
                disabled={borrando}
                className="press flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {borrando ? "Borrando historial..." : "Eliminar todo mi historial emocional"}
              </button>
            </div>
          </section>
        </div>

        {/* Columna Derecha: Cuenta y Acceso */}
        <div className="flex flex-col gap-6">
          {/* Tarjeta de cuenta */}
          <section className="rounded-3xl bg-card p-6 shadow-soft border border-border/40">
            <h2 className="text-base font-bold text-deep">Tu cuenta</h2>
            <p className="mt-1 text-xs text-muted-foreground">Sesión iniciada con:</p>
            <p className="mt-1 text-sm font-semibold text-primary break-all">{email}</p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Autenticación protegida por Google Firebase</span>
            </div>
          </section>

          {/* Tarjeta de recuperación de contraseña */}
          <section className="rounded-3xl bg-card p-6 shadow-soft border border-border/40">
            <h2 className="text-base font-bold text-deep flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-secondary-foreground">
              Te enviaremos un correo a <strong>{email}</strong> con un enlace para que puedas crear una contraseña nueva de forma segura.
            </p>

            {enviado ? (
              <div className="mt-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                ✅ ¡Correo enviado! Revisá tu bandeja de entrada (y la carpeta de spam).
              </div>
            ) : (
              <button
                onClick={enviarRecuperacion}
                disabled={cargando}
                className="press mt-4 w-full rounded-2xl bg-dawn px-4 py-3 text-xs font-bold text-primary-foreground shadow-soft disabled:opacity-60 hover:shadow-md transition-shadow"
              >
                {cargando ? "Enviando..." : "📧 Enviar correo de recuperación"}
              </button>
            )}

            {errorRecuperacion && (
              <p className="mt-3 text-xs font-semibold text-destructive">{errorRecuperacion}</p>
            )}
          </section>

          {/* Info adicional */}
          <section className="rounded-3xl bg-card p-6 shadow-soft border border-border/40">
            <h2 className="text-base font-bold text-deep">Sobre Serenamente</h2>
            <p className="mt-2 text-xs leading-relaxed text-secondary-foreground">
              <strong>Serenamente</strong> es una aplicación de apoyo emocional para adolescentes y jóvenes. Tus datos están estrictamente protegidos bajo estándares de privacidad y confidencialidad ética.
            </p>
            <p className="mt-3 text-[11px] text-muted-foreground">Versión 1.1.0 · Seguridad Reforzada</p>
          </section>
        </div>
      </div>

      {/* Modal de Políticas de Privacidad */}
      <ModalPoliticaPrivacidad
        abierto={modalPrivacidadAbierto}
        onCerrar={() => setModalPrivacidadAbierto(false)}
      />
    </Fondo>
  );
}
