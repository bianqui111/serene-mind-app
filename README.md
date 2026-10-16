# Serenamente

Aplicación web (PWA) de acompañamiento para el manejo de la ansiedad.

## Funcionalidades

- **Autenticación**: registro e inicio de sesión de usuarios.
- **Ejercicios de respiración** guiados.
- **Seguimiento emocional** del paciente.
- **Versículos bíblicos**: 20 versículos, con notificaciones diarias.
- **Arte terapia**: dibujo y coloreado (20 colores) con guardado de los dibujos.
- **Relajación**: 3 audios de relajación.
- **Psicólogos**: directorio de profesionales de contacto.
- **Recomendaciones** para el manejo de la ansiedad según el recurso elegido.

## Tecnologías

- [TanStack Start](https://tanstack.com/start) + React 19
- [Vite](https://vite.dev) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase](https://firebase.google.com) (Auth y Firestore)
- PWA (instalable, con service worker)

## Desarrollo

Necesitas Node.js y npm.

```sh
npm install
npm run dev
```

El servidor de desarrollo queda disponible en `http://localhost:8080`.

## Scripts

| Comando           | Descripción            |
| ----------------- | ---------------------- |
| `npm run dev`     | Servidor de desarrollo |
| `npm run build`   | Build de producción    |
| `npm run preview` | Previsualiza el build  |
| `npm run lint`    | Ejecuta ESLint         |
| `npm run format`  | Formatea con Prettier  |
