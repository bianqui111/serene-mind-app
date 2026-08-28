import admin from "firebase-admin";

if (!admin.apps.length) {
  // Inicializamos firebase-admin con las credenciales del entorno
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Reemplazamos los saltos de línea escapados (común en variables de entorno)
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();
const messaging = admin.messaging();

export default async function handler(req: any, res: any) {
  try {
    // 1. Verificar autorización si se llama por HTTP (opcional pero recomendado)
    if (
      req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}` &&
      process.env.CRON_SECRET
    ) {
      return res.status(401).json({ error: "No autorizado" });
    }

    console.log("Iniciando envío de versículos diarios...");

    // Obtenemos los versículos directamente para no depender de dependencias locales complejas
    const VERSICULOS = [
      { texto: "No temas, porque yo estoy contigo...", cita: "Isaías 41:10" },
      { texto: "Jehová es mi pastor; nada me faltará.", cita: "Salmos 23:1" },
      { texto: "La paz os dejo, mi paz os doy...", cita: "Juan 14:27" },
      { texto: "Todo lo puedo en Cristo que me fortalece.", cita: "Filipenses 4:13" },
      { texto: "Echa sobre Jehová tu carga, y él te sustentará.", cita: "Salmos 55:22" },
      { texto: "Bástate mi gracia; porque mi poder se perfecciona en la debilidad.", cita: "2 Corintios 12:9" },
    ];

    const hoy = new Date();
    const dias = Math.floor(hoy.getTime() / 86400000);
    // Usamos el módulo para elegir uno diario (de una muestra de 6)
    const v = VERSICULOS[dias % VERSICULOS.length]; 

    // 2. Buscar todos los tokens de todos los usuarios
    const usuariosSnapshot = await db.collection("usuarios").get();
    let tokens: string[] = [];

    for (const doc of usuariosSnapshot.docs) {
      const pushTokensSnapshot = await db.collection(`usuarios/${doc.id}/push_tokens`).get();
      pushTokensSnapshot.forEach((tokenDoc) => {
        tokens.push(tokenDoc.id);
      });
    }

    if (tokens.length === 0) {
      return res.status(200).json({ message: "No hay tokens registrados." });
    }

    // 3. Enviar notificaciones
    const payload = {
      notification: {
        title: "Serenamente · Versículo del día",
        body: `“${v.texto}” — ${v.cita}`,
      },
      tokens: tokens,
    };

    const response = await messaging.sendEachForMulticast(payload);
    
    // Limpieza de tokens inválidos (opcional)
    if (response.failureCount > 0) {
      console.log(`Fallaron ${response.failureCount} notificaciones.`);
      // En producción, aquí se eliminarían los tokens que devolvieron error
    }

    return res.status(200).json({
      message: `Notificaciones enviadas con éxito. Éxitos: ${response.successCount}, Fallos: ${response.failureCount}`,
    });

  } catch (error: any) {
    console.error("Error al enviar notificaciones:", error);
    return res.status(500).json({ error: error.message });
  }
}
