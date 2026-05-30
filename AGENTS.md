# AGENTS.md — NeoSocial

Este archivo es la fuente de verdad para Claude Code.
Lee TODO este archivo antes de tocar cualquier código.

---

## Contexto del proyecto

NeoSocial es una red social inspirada en TikTok/Instagram que demuestra el uso de Neo4j (base de datos orientada a grafos) para una materia universitaria de Bases de Datos.

**Plazo:** 3 días  
**Entregable:** Demo funcional para presentación  
**Equipo:** 3 personas

---

## Stack definitivo (no cambiar)

```
Frontend  → React 18 + Vite + Tailwind CSS 3 + React Router v6 + Axios
Backend   → Node.js 20 + Express 5 + JWT + bcrypt + Multer
Database  → Neo4j Aura (cloud) via neo4j-driver
Archivos  → Carpeta local /uploads (sin Cloudinary para simplificar)
Realtime  → NO implementar Socket.IO (fuera de scope por tiempo)
```

---

## Estructura de carpetas

```
neosocial/
├── AGENTS.md                  ← este archivo
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── index.js           ← entry point, monta Express
│   │   ├── db.js              ← conexión singleton a Neo4j
│   │   ├── middleware/
│   │   │   └── auth.js        ← verifica JWT
│   │   ├── routes/
│   │   │   ├── auth.js        ← /api/auth/*
│   │   │   ├── users.js       ← /api/users/*
│   │   │   ├── posts.js       ← /api/posts/*
│   │   │   └── search.js      ← /api/search/*
│   │   └── uploads/           ← imágenes subidas localmente
│   └── seed.js                ← datos de prueba
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/
        │   └── client.js      ← instancia Axios con baseURL y token
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Feed.jsx
        │   ├── Profile.jsx
        │   └── Explore.jsx
        └── components/
            ├── PostCard.jsx
            ├── UserCard.jsx
            ├── CommentSection.jsx
            └── Navbar.jsx
```

---

## Variables de entorno

### backend/.env
```
NEO4J_URI=neo4j+s://XXXX.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=XXXXXXXXXX
JWT_SECRET=neosocial_secret_2026
PORT=3001
```

### frontend/.env
```
VITE_API_URL=http://localhost:3001
```

---

## Modelo de datos Neo4j

### Nodos

```
(:User {
  id: string,         // UUID
  username: string,   // único
  email: string,      // único
  password: string,   // bcrypt hash
  bio: string,
  avatarUrl: string,
  createdAt: datetime
})

(:Post {
  id: string,         // UUID
  content: string,
  imageUrl: string,   // puede ser null
  createdAt: datetime
})

(:Comment {
  id: string,
  text: string,
  createdAt: datetime
})

(:Hashtag {
  name: string        // único, lowercase, sin #
})
```

### Relaciones

```
(:User)-[:FOLLOWS]->(:User)
(:User)-[:PUBLISHED]->(:Post)
(:User)-[:LIKED]->(:Post)
(:User)-[:COMMENTED {id, text, createdAt}]->(:Post)
(:Post)-[:HAS_HASHTAG]->(:Hashtag)
```

### Constraints (ejecutar al iniciar)

```cypher
CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
CREATE CONSTRAINT user_username IF NOT EXISTS FOR (u:User) REQUIRE u.username IS UNIQUE;
CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE;
CREATE CONSTRAINT post_id IF NOT EXISTS FOR (p:Post) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT hashtag_name IF NOT EXISTS FOR (h:Hashtag) REQUIRE h.name IS UNIQUE;
```

---

## API REST — endpoints

### Auth  `/api/auth`
```
POST /register   body: { username, email, password }
POST /login      body: { email, password }
```

### Users  `/api/users`
```
GET  /me                     → perfil propio (requiere auth)
GET  /:username              → perfil público
POST /:username/follow       → seguir usuario (requiere auth)
POST /:username/unfollow     → dejar de seguir (requiere auth)
GET  /:username/followers    → lista de seguidores
GET  /:username/following    → lista de seguidos
```

### Posts  `/api/posts`
```
GET  /feed           → posts de usuarios seguidos (requiere auth)
GET  /explore        → todos los posts recientes
POST /               → crear post (requiere auth, multipart/form-data)
GET  /:id            → post individual con comentarios
POST /:id/like       → dar/quitar like (toggle, requiere auth)
POST /:id/comment    → comentar (requiere auth)
DELETE /:id          → eliminar post propio (requiere auth)
```

### Search  `/api/search`
```
GET /?q=texto   → devuelve { users: [], posts: [], hashtags: [] }
```

---

## Queries Cypher clave

### Feed personalizado
```cypher
MATCH (me:User {id: $userId})-[:FOLLOWS]->(followed:User)-[:PUBLISHED]->(p:Post)
OPTIONAL MATCH (p)<-[:LIKED]-(liker:User)
OPTIONAL MATCH (p)-[:HAS_HASHTAG]->(h:Hashtag)
WITH p, followed, collect(DISTINCT h.name) as hashtags, count(DISTINCT liker) as likes
OPTIONAL MATCH (p)<-[myLike:LIKED]-(me:User {id: $userId})
RETURN p, followed.username as author, followed.avatarUrl as authorAvatar,
       hashtags, likes, myLike IS NOT NULL as likedByMe
ORDER BY p.createdAt DESC
LIMIT 20
```

### Seguir usuario
```cypher
MATCH (a:User {id: $followerId}), (b:User {username: $targetUsername})
MERGE (a)-[:FOLLOWS]->(b)
RETURN b.username
```

### Buscar
```cypher
// Usuarios
MATCH (u:User)
WHERE toLower(u.username) CONTAINS toLower($q) OR toLower(u.bio) CONTAINS toLower($q)
RETURN u LIMIT 10

// Posts
MATCH (u:User)-[:PUBLISHED]->(p:Post)
WHERE toLower(p.content) CONTAINS toLower($q)
RETURN p, u.username as author LIMIT 10

// Hashtags
MATCH (h:Hashtag)<-[:HAS_HASHTAG]-(p:Post)<-[:PUBLISHED]-(u:User)
WHERE toLower(h.name) CONTAINS toLower($q)
RETURN h.name, count(p) as postCount LIMIT 10
```

### Perfil de usuario
```cypher
MATCH (u:User {username: $username})
OPTIONAL MATCH (u)-[:PUBLISHED]->(p:Post)
OPTIONAL MATCH (u)<-[:FOLLOWS]-(follower:User)
OPTIONAL MATCH (u)-[:FOLLOWS]->(following:User)
RETURN u,
       count(DISTINCT p) as postCount,
       count(DISTINCT follower) as followerCount,
       count(DISTINCT following) as followingCount
```

---

## Patrones de código obligatorios

### db.js — conexión singleton
```javascript
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

export async function runQuery(cypher, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

export default driver;
```

### Estructura de respuesta API
```javascript
// Éxito
res.json({ success: true, data: { ... } })

// Error
res.status(400).json({ success: false, message: 'Descripción del error' })
```

### Middleware auth
```javascript
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No autorizado' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
}
```

### client.js (Axios frontend)
```javascript
import axios from 'axios';

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL });

client.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
```

---

## Convenciones

- IDs: `crypto.randomUUID()` (nativo en Node 19+)
- Fechas: `new Date().toISOString()` en backend, parsear en frontend con `new Date(str).toLocaleDateString('es-ES')`
- Contraseñas: `bcrypt.hash(password, 10)`
- Imágenes subidas: servir en `/uploads/:filename` como estático
- Hashtags: extraer del content con regex `/\#(\w+)/g`, guardar en lowercase

---

## Diseño UI

- Tema oscuro principalmente (como TikTok)
- Colores: fondo `#0a0a0a`, cards `#1a1a1a`, acento `#fe2c55` (rojo TikTok), texto `#ffffff`
- Fuente: sistema (no importar externa para velocidad)
- Tailwind: configurar `darkMode: 'class'` y base oscura
- Layout: sidebar izquierdo fijo + feed central (como Instagram web)
- PostCard: imagen arriba, contenido, likes/comentarios, hashtags como chips

---

## Lo que NO se implementa (comunicarlo en presentación como "trabajo futuro")

- Videos (solo imágenes y texto)
- Chat en tiempo real
- Notificaciones push
- Recomendaciones con algoritmo
- Cloudinary (se usa almacenamiento local)

---

## Plan de 3 días

### Día 1 — Backend completo
1. Inicializar proyecto Node.js + instalar dependencias
2. Configurar conexión Neo4j Aura + constraints
3. Implementar auth (register/login)
4. Implementar rutas de usuarios (perfil, follow/unfollow)
5. Implementar rutas de posts (CRUD + like + comment)
6. Implementar búsqueda
7. Correr seed.js con datos de prueba
8. Probar todo en Postman/Thunder Client

### Día 2 — Frontend completo
1. Inicializar Vite + React + Tailwind
2. AuthContext + páginas Login y Register
3. Navbar + rutas protegidas
4. Feed principal con PostCard
5. Página Explore
6. Página de perfil con estadísticas
7. Sección de comentarios
8. Búsqueda

### Día 3 — Integración + pulir + presentación
1. Conectar frontend con backend real
2. Subida de imágenes funcional
3. Datos seed interesantes (usuarios, posts con hashtags)
4. Arreglar bugs
5. Preparar demo en vivo: registrar usuario → publicar → seguir → feed → buscar hashtag
6. Preparar slides con modelo de grafo visual

---

## Comandos para iniciar

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

---

## Errores comunes a evitar

1. **No cerrar sesión Neo4j**: siempre usar el helper `runQuery` que cierra en `finally`
2. **CORS**: configurar en Express: `app.use(cors({ origin: 'http://localhost:5173', credentials: true }))`
3. **Multer + JWT**: en rutas con archivo, el middleware va: `[requireAuth, upload.single('image'), handler]`
4. **Neo4j integers**: los conteos vuelven como `Integer` de neo4j-driver, convertir con `.toNumber()` o `neo4j.integer.toNumber(val)`
5. **Variables de entorno**: nunca hardcodear credenciales, siempre `.env`
