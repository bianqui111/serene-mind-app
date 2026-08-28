import { auth, db } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";

export type Usuario = {
  nombre: string;
  email: string;
  password?: string; // Solo para el formulario, no se guarda en Firestore directamente por seguridad
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
  data: string; // data URL base64
};

// ======================= AUTH =======================

export const registrarUsuario = async (u: Usuario): Promise<{ ok: boolean; error?: string }> => {
  try {
    // Guardamos el nombre temporalmente para evitar que onAuthStateChanged lea null 
    // antes de que updateProfile termine.
    if (typeof window !== "undefined") window.localStorage.setItem("serena.tempName", u.nombre);

    const cred = await createUserWithEmailAndPassword(auth, u.email, u.password || "");
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: u.nombre });
    }
    return { ok: true };
  } catch (error: any) {
    console.error("Firebase Auth Error:", error);
    let msg = "Error al registrar: " + (error.message || error.code || "");
    if (error.code === "auth/email-already-in-use") msg = "Ya existe una cuenta con ese correo.";
    if (error.code === "auth/weak-password") msg = "La contraseña es muy débil (min. 6 caracteres).";
    if (error.code === "auth/invalid-email") msg = "El correo es inválido.";
    if (error.code === "auth/operation-not-allowed") msg = "Debes habilitar 'Correo/Contraseña' en Firebase Console > Authentication.";
    return { ok: false, error: msg };
  }
};

export const iniciarSesion = async (email: string, password: string): Promise<{ ok: boolean; error?: string; usuario?: Usuario }> => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { 
      ok: true, 
      usuario: { 
        nombre: cred.user.displayName || email, 
        email: cred.user.email || email 
      } 
    };
  } catch (error: any) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }
};

export const cerrarSesion = async () => {
  await signOut(auth);
};

// ======================= EMOCIONES =======================

export const getEmociones = async (): Promise<RegistroEmocion[]> => {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  try {
    const q = query(collection(db, `usuarios/${uid}/emociones`), orderBy("fecha", "desc"), limit(200));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as RegistroEmocion);
  } catch (e) {
    console.error("Error loading emociones", e);
    return [];
  }
};

export const guardarEmocion = async (r: RegistroEmocion) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await setDoc(doc(db, `usuarios/${uid}/emociones`, r.id), r);
};

export const borrarEmocion = async (id: string) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await deleteDoc(doc(db, `usuarios/${uid}/emociones`, id));
};

// ======================= ARTE =======================

export const getDibujos = async (): Promise<Dibujo[]> => {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  try {
    const q = query(collection(db, `usuarios/${uid}/dibujos`), orderBy("fecha", "desc"), limit(30));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Dibujo);
  } catch (e) {
    console.error("Error loading dibujos", e);
    return [];
  }
};

export const guardarDibujo = async (d: Dibujo) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await setDoc(doc(db, `usuarios/${uid}/dibujos`, d.id), d);
};

export const borrarDibujo = async (id: string) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await deleteDoc(doc(db, `usuarios/${uid}/dibujos`, id));
};

// ======================= VERSICULOS (Mantenemos LocalStorage para notificaciones diarias) =======================
const K_VERSICULO = "serena.versiculoDia";
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

export const versiculoDelDia = (total: number) => {
  const hoy = new Date();
  const dias = Math.floor(hoy.getTime() / 86400000);
  return dias % total;
};

export const marcarVersiculoNotificado = (indice: number) => write(K_VERSICULO, { indice, dia: new Date().toDateString() });
export const versiculoNotificadoHoy = () => {
  const v = safe<{ indice: number; dia: string } | null>(K_VERSICULO, null);
  return v?.dia === new Date().toDateString();
};

// ======================= PUSH NOTIFICATIONS =======================
export const guardarTokenFCM = async (token: string) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await setDoc(doc(db, `usuarios/${uid}/push_tokens`, token), {
    token,
    creado: new Date().toISOString(),
    plataforma: typeof navigator !== "undefined" ? navigator.userAgent : "unknown"
  });
};
