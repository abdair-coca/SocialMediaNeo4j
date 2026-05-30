# Plan de 3 días — NeoSocial

## Antes de empezar (30 min)

- [ ] Crear cuenta en Neo4j Aura: https://console.neo4j.io → New Instance → Free
- [ ] Copiar URI, usuario y contraseña a `backend/.env`
- [ ] Clonar/crear repo en GitHub, hacer primer commit con AGENTS.md y estructura

---

## DÍA 1 — Backend completo

### Bloque 1 (2-3h): Setup + Auth

```bash
# Inicializar backend
cd backend && npm install

# Decirle a Claude Code:
"Implementa el backend completo de NeoSocial según AGENTS.md.
Empieza por src/index.js, db.js, middleware/auth.js y routes/auth.js"
```

Verificar: `POST /api/auth/register` y `POST /api/auth/login` funcionan en Thunder Client

### Bloque 2 (2-3h): Usuarios + Posts

```bash
# Decirle a Claude Code:
"Implementa routes/users.js y routes/posts.js según AGENTS.md.
Incluye todas las queries Cypher definidas ahí."
```

Verificar: follow/unfollow, crear post, dar like, comentar

### Bloque 3 (1h): Búsqueda + Seed

```bash
# Decirle a Claude Code:
"Implementa routes/search.js y luego ejecuta node seed.js"
```

Verificar: `GET /api/search?q=neo4j` devuelve usuarios, posts y hashtags

---

## DÍA 2 — Frontend completo

### Bloque 1 (2h): Setup + Auth UI

```bash
cd frontend && npm create vite@latest . -- --template react
npm install tailwindcss axios react-router-dom

# Decirle a Claude Code:
"Configura Tailwind con tema oscuro (fondo #0a0a0a, acento #fe2c55).
Implementa AuthContext, Login.jsx y Register.jsx según AGENTS.md"
```

### Bloque 2 (2-3h): Feed + PostCard

```bash
# Decirle a Claude Code:
"Implementa Feed.jsx, Explore.jsx y PostCard.jsx.
El diseño es similar a Instagram web: sidebar izquierdo + feed central.
Tema oscuro, acento rojo #fe2c55"
```

### Bloque 3 (2h): Perfil + Búsqueda + Comentarios

```bash
# Decirle a Claude Code:
"Implementa Profile.jsx con estadísticas (posts, seguidores, seguidos),
Explore.jsx con buscador, y CommentSection.jsx"
```

---

## DÍA 3 — Integración + Demo

### Mañana (2h): Bugs y pulido

- Probar flujo completo: register → login → publicar → seguir → feed → buscar
- Arreglar cualquier desincronización frontend/backend
- Subida de imágenes funcional (Multer + `/uploads` estático)

### Tarde (2h): Datos de presentación

```bash
# Ejecutar seed con datos interesantes
node seed.js
```

- Crear 2-3 cuentas reales con contenido boliviano/tech
- Tomar screenshots para slides

### Presentación (preparar mientras corre el seed)

**Slide 1:** Portada — NeoSocial, materia, equipo, 2026

**Slide 2:** ¿Por qué Neo4j?
- SQL: JOINs costosos para redes sociales
- Grafos: relaciones son ciudadanos de primera clase
- "¿Quién sigue a quién?" → 1 query vs 3 JOINs

**Slide 3:** Modelo de datos (mostrar diagrama de nodos y relaciones)

**Slide 4:** Demo en vivo
1. Mostrar Neo4j Aura con datos (Browser visual)
2. Registrar usuario en vivo
3. Publicar post con hashtag
4. Seguir a alguien → ver feed personalizado
5. Buscar hashtag → mostrar resultados

**Slide 5:** Query Cypher en vivo (copiar desde AGENTS.md)

**Slide 6:** Trabajo futuro (videos, chat, recomendaciones)

---

## Distribución de trabajo sugerida

| Persona | Responsabilidad |
|---------|----------------|
| Tú (Abdair) | Backend: auth, posts, Neo4j queries |
| Compañero 2 | Frontend: Feed, PostCard, integración API |
| Compañero 3 | Frontend: Profile, Explore, slides presentación |

---

## Comandos diarios

```bash
# Terminal 1 - Backend
cd neosocial/backend && npm run dev
# Corre en http://localhost:3001

# Terminal 2 - Frontend
cd neosocial/frontend && npm run dev
# Corre en http://localhost:5173

# Neo4j Browser (para mostrar en presentación)
# Ir a https://console.neo4j.io → Open
```

---

## Demo queries para la presentación (ejecutar en Neo4j Browser)

```cypher
// Visualizar toda la red social
MATCH (n)-[r]->(m) RETURN n,r,m LIMIT 50

// Ver quién sigue a quién
MATCH (a:User)-[:FOLLOWS]->(b:User) RETURN a.username, b.username

// Posts más likeados
MATCH (u:User)-[:PUBLISHED]->(p:Post)<-[:LIKED]-(l:User)
RETURN p.content, u.username, count(l) as likes ORDER BY likes DESC

// Amigos en común entre dos usuarios
MATCH (a:User {username:'abdair'})-[:FOLLOWS]->(common)<-[:FOLLOWS]-(b:User {username:'dev_carlos'})
RETURN common.username as amigoEnComun
```
