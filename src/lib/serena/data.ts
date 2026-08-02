export type Recurso =
  | "respiracion"
  | "emociones"
  | "versiculos"
  | "arte"
  | "musica"
  | "psicologos";

export const RECOMENDACIONES: Record<Recurso, string[]> = {
  respiracion: [
    "Practicá 3 rondas seguidas, dos veces al día, aunque no sientas ansiedad.",
    "Exhalá siempre más lento que la inhalación: eso activa la calma del cuerpo.",
    "Si sentís mareo, volvé a tu respiración normal y retomá en un minuto.",
    "Apoyá una mano en el abdomen para confirmar que respirás con el diafragma.",
  ],
  emociones: [
    "Registrá tu emoción apenas la notes; no esperes al final del día.",
    "Poné nombre a lo que sentís: nombrar una emoción baja su intensidad.",
    "Buscá patrones: horarios, personas o lugares que se repiten en tus picos.",
    "Si tu ansiedad supera 8/10 varios días seguidos, contactá a un profesional.",
  ],
  versiculos: [
    "Leé el versículo en voz alta y despacio, respirando entre frases.",
    "Elegí una palabra del texto y repetila como ancla cuando llegue la ansiedad.",
    "Activá la notificación diaria para empezar la mañana con una lectura breve.",
    "Escribí en tu diario qué te dice hoy ese versículo, sin juzgarte.",
  ],
  arte: [
    "No busques que quede bonito: el objetivo es descargar tensión, no crear arte.",
    "Elegí colores según cómo te sentís, y luego según cómo querés sentirte.",
    "Pintá durante 10 minutos sin música ni celular para entrenar la atención plena.",
    "Guardá tus dibujos: verlos en secuencia muestra tu proceso emocional.",
  ],
  musica: [
    "Usá auriculares y cerrá los ojos: reduce estímulos y profundiza la relajación.",
    "Acompañá el sonido con respiración lenta 4-6 para potenciar el efecto.",
    "10 minutos antes de dormir mejora la calidad del descanso.",
    "Si tu mente se dispara, volvé suavemente al sonido, sin reprocharte.",
  ],
  psicologos: [
    "Pedir ayuda no es debilidad: es una estrategia de cuidado.",
    "Antes de la consulta anotá tus síntomas, frecuencia e intensidad.",
    "La constancia semanal da mejores resultados que sesiones aisladas.",
    "Si tenés pensamientos de hacerte daño, buscá atención inmediata.",
  ],
};

export const VERSICULOS = [
  { texto: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo.", cita: "Isaías 41:10" },
  { texto: "Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.", cita: "1 Pedro 5:7" },
  { texto: "La paz os dejo, mi paz os doy; no se turbe vuestro corazón, ni tenga miedo.", cita: "Juan 14:27" },
  { texto: "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios.", cita: "Filipenses 4:6" },
  { texto: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.", cita: "Mateo 11:28" },
  { texto: "Jehová es mi pastor; nada me faltará.", cita: "Salmos 23:1" },
  { texto: "Esforzaos y cobrad ánimo; no temáis, porque Jehová tu Dios va contigo.", cita: "Deuteronomio 31:6" },
  { texto: "En paz me acostaré y asimismo dormiré, porque solo tú, Jehová, me haces vivir confiado.", cita: "Salmos 4:8" },
  { texto: "Cuando mis inquietudes se multiplican, tus consuelos alegran mi alma.", cita: "Salmos 94:19" },
  { texto: "El Señor es mi luz y mi salvación, ¿de quién temeré?", cita: "Salmos 27:1" },
  { texto: "Todo lo puedo en Cristo que me fortalece.", cita: "Filipenses 4:13" },
  { texto: "Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.", cita: "Salmos 46:1" },
  { texto: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.", cita: "Salmos 91:1" },
  { texto: "Confía en Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.", cita: "Proverbios 3:5" },
  { texto: "No os ha sobrevenido ninguna tentación que no sea humana; fiel es Dios.", cita: "1 Corintios 10:13" },
  { texto: "Los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.", cita: "Isaías 40:31" },
  { texto: "Cercano está Jehová a los quebrantados de corazón.", cita: "Salmos 34:18" },
  { texto: "Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.", cita: "2 Timoteo 1:7" },
  { texto: "Echa sobre Jehová tu carga, y él te sustentará.", cita: "Salmos 55:22" },
  { texto: "Bástate mi gracia; porque mi poder se perfecciona en la debilidad.", cita: "2 Corintios 12:9" },
];

export const PSICOLOGOS = [
  {
    nombre: "Héctor González",
    especialidad: "Terapia cognitivo-conductual · Trastornos de ansiedad",
    experiencia: "12 años de experiencia · Atiende adultos y adolescentes",
    telefono: "+595 981 472 305",
    modalidad: "Presencial y online",
    inicial: "HG",
  },
  {
    nombre: "Lucía Benítez",
    especialidad: "Mindfulness clínico · Ataques de pánico",
    experiencia: "9 años de experiencia · Atiende adultos",
    telefono: "+595 972 318 640",
    modalidad: "Online",
    inicial: "LB",
  },
  {
    nombre: "Mariano Duarte",
    especialidad: "Arteterapia · Manejo del estrés y duelo",
    experiencia: "7 años de experiencia · Atiende niños y adultos",
    telefono: "+595 985 604 217",
    modalidad: "Presencial",
    inicial: "MD",
  },
];

export const PALETA_20 = [
  "#1e3a8a", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd",
  "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#e9d5ff",
  "#0ea5e9", "#22d3ee", "#14b8a6", "#34d399", "#a3e635",
  "#fbbf24", "#fb923c", "#f87171", "#f472b6", "#1f2937",
];

export const EMOCIONES = [
  { id: "calma", label: "Calma", emoji: "😌" },
  { id: "alegria", label: "Alegría", emoji: "😊" },
  { id: "ansiedad", label: "Ansiedad", emoji: "😰" },
  { id: "tristeza", label: "Tristeza", emoji: "😢" },
  { id: "enojo", label: "Enojo", emoji: "😠" },
  { id: "miedo", label: "Miedo", emoji: "😨" },
  { id: "cansancio", label: "Cansancio", emoji: "🥱" },
  { id: "esperanza", label: "Esperanza", emoji: "🌤️" },
];
