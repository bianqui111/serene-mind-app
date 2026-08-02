export type Usuario = {
  nombre: string;
  email: string;
  password: string;
};

export type RegistroEmocion = {
  id: string;
  fecha: string;
  emocion: string;
  emoji: string;
  nivel: number;
  nota: string;
};

export type Dibujo = {
  id: string;
  fecha: string;
  data: string;
};

const K = {
  usuarios: "serena.usuarios",
  sesion: "serena.sesion",
  emociones: "serena.emociones",
  dibujos: "serena.dibujos",
  versiculo: "serena.versiculoDia",
};

const safe = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getUsuarios = () => safe<Usuario[]>(K.usuarios, []);

export const registrarUsuario = (u: Usuario): { ok: boolean; error?: string } => {
  const usuarios = getUsuarios();
  if (usuarios.some((x) => x.email.toLowerCase() === u.email.toLowerCase())) {
    return { ok: false, error: "Ya existe una cuenta con ese correo." };
  }
  write(K.usuarios, [...usuarios, u]);
  return { ok: true };
};

export const iniciarSesion = (email: string, password: string): { ok: boolean; error?: string; usuario?: Usuario } => {
  const usuario = getUsuarios().find(
    (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password,
  );
  if (!usuario) return { ok: false, error: "Correo o contraseña incorrectos." };
  write(K.sesion, usuario.email);
  return { ok: true, usuario };
};

export const cerrarSesion = () => {
  if (typeof window !== "undefined") window.localStorage.removeItem(K.sesion);
};

export const sesionActiva = (): Usuario | null => {
  const email = safe<string | null>(K.sesion, null);
  if (!email) return null;
  return getUsuarios().find((x) => x.email === email) ?? null;
};

export const getEmociones = () => safe<RegistroEmocion[]>(K.emociones, []);
export const guardarEmocion = (r: RegistroEmocion) => write(K.emociones, [r, ...getEmociones()].slice(0, 200));
export const borrarEmocion = (id: string) => write(K.emociones, getEmociones().filter((x) => x.id !== id));

export const getDibujos = () => safe<Dibujo[]>(K.dibujos, []);
export const guardarDibujo = (d: Dibujo) => write(K.dibujos, [d, ...getDibujos()].slice(0, 30));
export const borrarDibujo = (id: string) => write(K.dibujos, getDibujos().filter((x) => x.id !== id));

export const versiculoDelDia = (total: number) => {
  const hoy = new Date();
  const dias = Math.floor(hoy.getTime() / 86400000);
  return dias % total;
};

export const marcarVersiculoNotificado = (indice: number) => write(K.versiculo, { indice, dia: new Date().toDateString() });
export const versiculoNotificadoHoy = () => {
  const v = safe<{ indice: number; dia: string } | null>(K.versiculo, null);
  return v?.dia === new Date().toDateString();
};
