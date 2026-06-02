# AGENTS.md — Titi | Etapa 1: Red Social

Lee este archivo completo antes de tocar cualquier código.

---

## Contexto

NeoSocial se convierte en **Titi** — una red social vibrante y alegre con mascota
estilo Duolingo. Esta etapa es puramente de rediseño e identidad visual.
La funcionalidad del backend NO cambia. Solo se modifica el frontend.

---

## Lo que SÍ cambia en esta etapa

- Paleta de colores completa (oscuro → vibrante/claro)
- Tipografía
- Nombre de la app (NeoSocial → Titi)
- Integración de la mascota Titi en momentos clave
- Textos y copies de la UI
- Logo y favicon

## Lo que NO cambia

- Backend (ningún archivo en /backend/)
- Lógica de AuthContext, rutas, llamadas a la API
- Estructura de carpetas
- Funcionalidades existentes

---

## Archivos existentes en frontend/src

```
components/
  CommentSection.jsx
  ConfirmModal.jsx
  CreatePost.jsx
  EditPostModal.jsx
  Navbar.jsx
  OptionsPosts.jsx
  PostCard.jsx
context/
  AuthContext.jsx
pages/
  Explore.jsx
  Feed.jsx
  HashtagFeed.jsx
  Login.jsx
  Notifications.jsx
  Profile.jsx
  Register.jsx
App.jsx
index.css
main.jsx
```

---

## Paleta de colores oficial Titi

```javascript
// tailwind.config.js — reemplazar colores existentes
colors: {
  titi: {
    yellow:    '#FFD93D',  // primario — color de Titi
    green:     '#6BCB77',  // éxito, progreso, completado
    blue:      '#4D96FF',  // acento, links, botones secundarios
    red:       '#FF6B6B',  // error, fallar, peligro
    orange:    '#FF9A3C',  // hover, detalles cálidos
    bg:        '#FFFBF0',  // fondo principal (blanco cálido)
    card:      '#FFFFFF',  // fondo de cards
    border:    '#F0E6C8',  // bordes suaves
    text:      '#1A1A2E',  // texto principal
    muted:     '#6B7280',  // texto secundario
    dark:      '#1A1A2E',  // navbar, sidebar
  }
}
```

---

## Tipografía

Usar **Nunito** de Google Fonts — redondeada, amigable, perfecta para Duolingo-like.

```html
<!-- En index.html -->
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
```

```javascript
// tailwind.config.js
fontFamily: {
  sans: ['Nunito', 'sans-serif'],
}
```

---

## Mascota Titi

Archivo: `public/Titi.png` (PNG con fondo transparente)

### Cuándo y cómo aparece

```
TitiMascot.jsx — componente reutilizable
Props:
  mood: 'happy' | 'sad' | 'surprised' | 'motivating' | 'idle'
  message: string
  size: 'sm' | 'md' | 'lg'
```

Como por ahora hay una sola imagen, todos los moods usan la misma.
En futuras etapas se reemplazarán por variantes.

### Momentos clave donde aparece Titi

| Momento | Mood | Mensaje |
|---------|------|---------|
| Login/Register (lado derecho) | happy | "¡Bienvenido a Titi! 🎉" |
| Feed vacío (sin seguidos) | motivating | "¡Sigue a alguien para ver su contenido!" |
| Sin notificaciones | idle | "Todo tranquilo por aquí 🐒" |
| Explore sin resultados | sad | "No encontré nada... intenta con otro término" |
| Post publicado exitosamente | happy | "¡Genial! Tu post está en vivo 🚀" |

---

## Layout general — cambio de oscuro a claro

### Antes (NeoSocial)
- Fondo: `#0a0a0a`
- Cards: `#1a1a1a`
- Acento: `#fe2c55`
- Tema: dark

### Ahora (Titi)
- Fondo: `#FFFBF0` (titi-bg)
- Cards: `#FFFFFF` (titi-card) con sombra suave
- Acento: `#FFD93D` (titi-yellow)
- Bordes: `#F0E6C8` (titi-border)
- Tema: light vibrante

### Sidebar/Navbar
- Fondo: `#1A1A2E` (titi-dark) — mantener oscuro para contraste
- Logo: imagen Titi pequeña + texto "titi" en Nunito 800
- Links activos: highlight en `#FFD93D`

---

## Componente TitiMascot.jsx

Crear en `components/TitiMascot.jsx`:

```jsx
const messages = {
  happy: { emoji: '🎉', default: '¡Así se hace!' },
  sad: { emoji: '😔', default: 'No encontré nada...' },
  surprised: { emoji: '😮', default: '¡Wow!' },
  motivating: { emoji: '💪', default: '¡Tú puedes!' },
  idle: { emoji: '😊', default: 'Todo tranquilo por aquí' },
}

const sizes = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-36 h-36',
}

export default function TitiMascot({ mood = 'happy', message, size = 'md' }) {
  const { emoji, default: defaultMsg } = messages[mood]
  return (
    <div className="flex flex-col items-center gap-2">
      <img src="/Titi.png" alt="Titi" className={`${sizes[size]} object-contain drop-shadow-lg`} />
      <p className="text-titi-text font-bold text-center text-sm">
        {emoji} {message || defaultMsg}
      </p>
    </div>
  )
}
```

---

## Cambios por archivo

### tailwind.config.js
- Reemplazar paleta completa con colores Titi
- Agregar fontFamily Nunito
- Remover darkMode config

### index.css
- Cambiar variables CSS globales a paleta Titi
- Fondo body: `#FFFBF0`
- Scrollbar personalizado en amarillo

### index.html
- Cambiar `<title>` a "Titi"
- Agregar link de Google Fonts (Nunito)
- Cambiar favicon (usar emoji 🐒 como favicon SVG por ahora)

### Navbar.jsx
- Logo: `<img src="/Titi.png" className="w-8 h-8" /> <span>titi</span>`
- Fondo sidebar: `bg-titi-dark`
- Links activos: `text-titi-yellow`
- Texto links: `text-white`

### Login.jsx y Register.jsx
- Layout de dos columnas: formulario izquierda + Titi derecha
- Fondo: `titi-bg`
- Cards blancas con sombra suave
- Botón primario: `bg-titi-yellow text-titi-dark font-bold`
- Inputs con border `titi-border`, focus `titi-yellow`
- Titi con mood 'happy' y mensaje de bienvenida

### Feed.jsx
- Fondo: `titi-bg`
- Si no hay posts: mostrar TitiMascot mood 'motivating'

### PostCard.jsx
- Card blanca con sombra: `bg-white rounded-2xl shadow-sm border border-titi-border`
- Like button: corazón que cambia a `text-titi-red` al dar like
- Hashtags: chips `bg-titi-yellow/20 text-titi-dark`
- Avatar con borde `border-2 border-titi-yellow`

### Notifications.jsx
- Si no hay notificaciones: TitiMascot mood 'idle'

### Explore.jsx
- Si no hay resultados: TitiMascot mood 'sad'

### CreatePost.jsx
- Modal/card con borde superior `border-t-4 border-titi-yellow`
- Botón publicar: `bg-titi-yellow`

---

## Textos y copies (reemplazar en toda la UI)

| Antes | Ahora |
|-------|-------|
| "Iniciar sesión" | "¡Hola de nuevo! 👋" (título), "Entrar" (botón) |
| "Registrarse" | "¡Únete a Titi! 🐒" (título), "Crear cuenta" (botón) |
| "Feed" | "Inicio" |
| "Explore" | "Explorar" |
| "Notifications" | "Notificaciones" |
| "What's on your mind?" | "¿Qué quieres compartir hoy? 🌟" |
| "Post" | "Publicar" |
| "Follow" | "Seguir" |
| "Unfollow" | "Siguiendo" |
| "Like" | ❤️ |
| "Comment" | "Comentar" |

---

## Tareas del desarrollador (Abdair hace estas)

Estas tareas las hace Abdair directamente, sin Claude Code:

1. **Subir Titi.png** a `frontend/public/` con fondo transparente (remove.bg)
2. **Cambiar el título** en `index.html` de "NeoSocial" a "Titi"
3. **Agregar el link de Nunito** en `index.html`
4. **Cambiar el favicon** — en `index.html` reemplazar con:
   ```html
   <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐒</text></svg>">
   ```
5. **Verificar en el navegador** que Nunito cargue correctamente
6. **Ajustar cualquier color** que no se vea bien después del rediseño

---

## Orden de ejecución para Claude Code

1. Actualizar `tailwind.config.js` con paleta Titi y Nunito
2. Actualizar `index.css` con variables globales
3. Crear `components/TitiMascot.jsx`
4. Rediseñar `Login.jsx` y `Register.jsx`
5. Rediseñar `Navbar.jsx`
6. Rediseñar `PostCard.jsx`
7. Rediseñar `Feed.jsx` (con estado vacío)
8. Rediseñar `Notifications.jsx` y `Explore.jsx`
9. Rediseñar `CreatePost.jsx`
10. Rediseñar `Profile.jsx`

---

## Resultado esperado

Al terminar la Etapa 1, Titi debe verse como una app completamente diferente a NeoSocial:
- Paleta vibrante y alegre
- Mascota presente en momentos clave
- Tipografía Nunito en toda la app
- Fondo claro con cards blancas
- Sidebar oscuro con detalles amarillos
- Misma funcionalidad, nueva identidad