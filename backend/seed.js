// seed.js — ejecutar con: node seed.js (o npm run seed)
// Reconstruye la base con los 7 nodos en español:
// Usuario, Post, Hashtag, Comentario, Notificacion, Sonido, Ubicacion

import 'dotenv/config';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import neo4j from 'neo4j-driver';
import prisma from './src/prisma.js';

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

async function run(cypher, params = {}) {
  const session = driver.session();
  try {
    return await session.run(cypher, params);
  } finally {
    await session.close();
  }
}

async function seed() {
  console.log('🌱 Iniciando seed...');

  await run('MATCH (n) DETACH DELETE n');
  console.log('🗑️  Base de datos limpia');

  const constraints = [
    'CREATE CONSTRAINT usuario_id IF NOT EXISTS FOR (u:Usuario) REQUIRE u.id IS UNIQUE',
    'CREATE CONSTRAINT usuario_username IF NOT EXISTS FOR (u:Usuario) REQUIRE u.username IS UNIQUE',
    'CREATE CONSTRAINT usuario_email IF NOT EXISTS FOR (u:Usuario) REQUIRE u.email IS UNIQUE',
    'CREATE CONSTRAINT post_id IF NOT EXISTS FOR (p:Post) REQUIRE p.id IS UNIQUE',
    'CREATE CONSTRAINT hashtag_name IF NOT EXISTS FOR (h:Hashtag) REQUIRE h.name IS UNIQUE',
    'CREATE CONSTRAINT comentario_id IF NOT EXISTS FOR (c:Comentario) REQUIRE c.id IS UNIQUE',
    'CREATE CONSTRAINT notificacion_id IF NOT EXISTS FOR (n:Notificacion) REQUIRE n.id IS UNIQUE',
    'CREATE CONSTRAINT sonido_id IF NOT EXISTS FOR (s:Sonido) REQUIRE s.id IS UNIQUE',
    'CREATE CONSTRAINT ubicacion_id IF NOT EXISTS FOR (u:Ubicacion) REQUIRE u.id IS UNIQUE',
  ];
  for (const c of constraints) await run(c);
  console.log('✅ Constraints creados');

  // ---- Ubicaciones ----
  const locations = [
    { id: randomUUID(), city: 'La Paz', country: 'Bolivia' },
    { id: randomUUID(), city: 'Cochabamba', country: 'Bolivia' },
    { id: randomUUID(), city: 'Santa Cruz de la Sierra', country: 'Bolivia' },
    { id: randomUUID(), city: 'Sucre', country: 'Bolivia' },
    { id: randomUUID(), city: 'Potosí', country: 'Bolivia' },
    { id: randomUUID(), city: 'Buenos Aires', country: 'Argentina' },
    { id: randomUUID(), city: 'Madrid', country: 'España' },
  ];
  for (const loc of locations) {
    await run('CREATE (:Ubicacion {id: $id, city: $city, country: $country})', loc);
  }
  console.log(`📍 ${locations.length} ubicaciones creadas`);

  // ---- Sonidos ----
  const sounds = [
    { id: randomUUID(), name: 'Original sound', artist: 'abdair' },
    { id: randomUUID(), name: 'Yellow', artist: 'Coldplay' },
    { id: randomUUID(), name: 'Music Sessions Vol. 53', artist: 'Bizarrap & Shakira' },
    { id: randomUUID(), name: 'Cruel Summer', artist: 'Taylor Swift' },
    { id: randomUUID(), name: 'Tití Me Preguntó', artist: 'Bad Bunny' },
    { id: randomUUID(), name: 'Get Lucky', artist: 'Daft Punk' },
    { id: randomUUID(), name: 'Blinding Lights', artist: 'The Weeknd' },
    { id: randomUUID(), name: 'One Dance', artist: 'Drake' },
    { id: randomUUID(), name: 'Trending viral sound', artist: 'NeoSocial' },
  ];
  for (const s of sounds) {
    await run('CREATE (:Sonido {id: $id, name: $name, artist: $artist})', s);
  }
  console.log(`🎵 ${sounds.length} sonidos creados`);

  // ---- Usuarios ----
  const password = await bcrypt.hash('password123', 10);
  const users = [
    { id: randomUUID(), username: 'abdair', email: 'abdair@demo.com', bio: 'Full stack dev 🚀 | Bolivia', city: 'La Paz' },
    { id: randomUUID(), username: 'maria_potosi', email: 'maria@demo.com', bio: 'Diseñadora UX/UI | Potosí 🇧🇴', city: 'Potosí' },
    { id: randomUUID(), username: 'dev_carlos', email: 'carlos@demo.com', bio: 'Backend engineer | Neo4j fan', city: 'Cochabamba' },
    { id: randomUUID(), username: 'lucia_tech', email: 'lucia@demo.com', bio: 'React developer | Open source', city: 'Santa Cruz de la Sierra' },
    { id: randomUUID(), username: 'neo4j_demo', email: 'demo@demo.com', bio: 'Cuenta demo de NeoSocial 📊', city: 'Sucre' },
  ];

  for (const u of users) {
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.username)}`;
    await run(
      `CREATE (:Usuario {id: $id, username: $username, email: $email, password: $password,
                        bio: $bio, avatarUrl: $avatarUrl, createdAt: datetime()})`,
      { ...u, password, avatarUrl }
    );
    if (u.city) {
      await run(
        `MATCH (usr:Usuario {id: $userId}), (loc:Ubicacion {city: $city})
         MERGE (usr)-[:VIVE_EN]->(loc)`,
        { userId: u.id, city: u.city }
      );
    }
  }
  console.log(`👥 ${users.length} usuarios creados (con VIVE_EN)`);

  // ---- Posts ----
  const posts = [
    { author: 'abdair', content: 'Implementando NeoSocial con #Neo4j y #React — las bases de grafos son una locura 🔥', soundIdx: 0, locCity: 'La Paz' },
    { author: 'abdair', content: 'Día 2 del proyecto: el feed trae posts con una sola query Cypher 🤯 #grafos #backend', soundIdx: 6, locCity: null },
    { author: 'maria_potosi', content: 'Diseñando la UI de #NeoSocial. Inspiración en TikTok pero con identidad propia 🎨 #uxdesign', soundIdx: 3, locCity: 'Potosí' },
    { author: 'dev_carlos', content: 'El modelo en grafos facilita las queries de recomendaciones. MATCH patterns son elegantes. #Neo4j', soundIdx: 5, locCity: 'Cochabamba' },
    { author: 'lucia_tech', content: 'Conectando React con la API de #NeoSocial. AuthContext listo ✅ #React #frontend', soundIdx: 7, locCity: 'Santa Cruz de la Sierra' },
    { author: 'neo4j_demo', content: 'Bienvenidos a NeoSocial — la primera red social boliviana basada en grafos 🇧🇴 #NeoSocial #Bolivia', soundIdx: 8, locCity: 'Sucre' },
    { author: 'dev_carlos', content: 'Pro tip: siempre cerrá la sesión de neo4j-driver en finally. Los leaks son silenciosos 🐛 #Neo4j', soundIdx: null, locCity: null },
    { author: 'maria_potosi', content: 'El tema oscuro quedó increíble. Fondo #0a0a0a, acento rojo, tipografía limpia. #UI', soundIdx: 1, locCity: null },
  ];

  const postIds = {};
  for (const p of posts) {
    const postId = randomUUID();
    if (!postIds[p.author]) postIds[p.author] = [];
    postIds[p.author].push(postId);

    await run(
      `MATCH (u:Usuario {username: $author})
       CREATE (u)-[:PUBLICO]->(p:Post {id: $id, content: $content, imageUrl: null, createdAt: datetime()})`,
      { author: p.author, id: postId, content: p.content }
    );

    const tags = [...p.content.matchAll(/#(\w+)/g)].map((m) => m[1].toLowerCase());
    for (const tag of tags) {
      await run(
        `MATCH (p:Post {id: $postId})
         MERGE (h:Hashtag {name: $tag})
         MERGE (p)-[:TIENE_HASHTAG]->(h)`,
        { postId, tag }
      );
    }

    if (p.soundIdx !== null) {
      await run(
        `MATCH (p:Post {id: $postId}), (s:Sonido {id: $soundId})
         MERGE (p)-[:USA_SONIDO]->(s)`,
        { postId, soundId: sounds[p.soundIdx].id }
      );
    }

    if (p.locCity) {
      await run(
        `MATCH (p:Post {id: $postId}), (loc:Ubicacion {city: $city})
         MERGE (p)-[:ETIQUETADO_EN]->(loc)`,
        { postId, city: p.locCity }
      );
    }
  }
  console.log(`📝 ${posts.length} posts creados (con USA_SONIDO y ETIQUETADO_EN)`);

  // ---- Follows ----
  const follows = [
    ['abdair', 'maria_potosi'], ['abdair', 'dev_carlos'], ['abdair', 'neo4j_demo'],
    ['maria_potosi', 'abdair'], ['maria_potosi', 'lucia_tech'],
    ['dev_carlos', 'abdair'], ['dev_carlos', 'neo4j_demo'],
    ['lucia_tech', 'abdair'], ['lucia_tech', 'dev_carlos'],
    ['neo4j_demo', 'abdair'],
  ];
  for (const [from, to] of follows) {
    await run(
      `MATCH (a:Usuario {username: $from}), (b:Usuario {username: $to})
       MERGE (a)-[r:SIGUIO]->(b)
       ON CREATE SET r.createdAt = datetime()`,
      { from, to }
    );
  }
  console.log(`🤝 ${follows.length} follows (SIGUIO) creados`);

  // ---- Likes ----
  const likes = [
    ['maria_potosi', 'abdair', 0], ['dev_carlos', 'abdair', 0], ['lucia_tech', 'abdair', 1],
    ['neo4j_demo', 'dev_carlos', 0], ['abdair', 'maria_potosi', 0], ['abdair', 'neo4j_demo', 0],
  ];
  for (const [liker, postAuthor, postIdx] of likes) {
    const postId = postIds[postAuthor]?.[postIdx];
    if (!postId) continue;
    await run(
      `MATCH (u:Usuario {username: $liker}), (p:Post {id: $postId})
       MERGE (u)-[:LE_GUSTO]->(p)`,
      { liker, postId }
    );
  }
  console.log(`❤️  ${likes.length} likes (LE_GUSTO) creados`);

  // ---- Comentarios como nodos ----
  const idOf = async (username) =>
    (await run('MATCH (u:Usuario {username: $u}) RETURN u.id as id', { u: username }))
      .records[0].get('id');

  const carlosId = await idOf('dev_carlos');
  const luciaId = await idOf('lucia_tech');
  const abdairId = await idOf('abdair');
  const mariaId = await idOf('maria_potosi');

  const c1Id = randomUUID();
  const c2Id = randomUUID();
  const c3Id = randomUUID();

  await run(
    `MATCH (u:Usuario {id: $userId}), (p:Post {id: $postId})
     CREATE (u)-[:ESCRIBIO]->(c:Comentario {
       id: $cid, text: 'Muy buen punto! Las queries Cypher son super legibles.',
       createdAt: datetime()
     })-[:EN]->(p)`,
    { userId: carlosId, postId: postIds['abdair'][0], cid: c1Id }
  );
  await run(
    `MATCH (u:Usuario {id: $userId}), (p:Post {id: $postId})
     CREATE (u)-[:ESCRIBIO]->(c:Comentario {
       id: $cid, text: 'Genial! Cuánto tiempo les tomó conectar el driver con Express?',
       createdAt: datetime()
     })-[:EN]->(p)`,
    { userId: luciaId, postId: postIds['abdair'][0], cid: c2Id }
  );
  // Respuesta (RESPONDE_A)
  await run(
    `MATCH (u:Usuario {id: $userId}), (p:Post {id: $postId}), (parent:Comentario {id: $parentId})
     CREATE (u)-[:ESCRIBIO]->(c:Comentario {
       id: $cid, text: 'Como 20 minutos, super directo.', createdAt: datetime()
     })-[:EN]->(p)
     CREATE (c)-[:RESPONDE_A]->(parent)`,
    { userId: abdairId, postId: postIds['abdair'][0], parentId: c2Id, cid: c3Id }
  );
  console.log('💬 3 comentarios (Comentario + RESPONDE_A) creados');

  // ---- Notificaciones de muestra ----
  await run(
    `MATCH (owner:Usuario {id: $ownerId}), (actor:Usuario {id: $actorId}), (p:Post {id: $postId})
     CREATE (owner)<-[:RECIBIO]-(n:Notificacion {
       id: $nid, type: 'like', read: false, createdAt: datetime(),
       actorId: $actorId, postId: $postId
     })
     CREATE (n)-[:SOBRE]->(p)`,
    { ownerId: abdairId, actorId: mariaId, postId: postIds['abdair'][0], nid: randomUUID() }
  );
  await run(
    `MATCH (owner:Usuario {id: $ownerId}), (actor:Usuario {id: $actorId}), (p:Post {id: $postId})
     CREATE (owner)<-[:RECIBIO]-(n:Notificacion {
       id: $nid, type: 'comment', read: false, createdAt: datetime(),
       actorId: $actorId, postId: $postId, commentId: $cid
     })
     CREATE (n)-[:SOBRE]->(p)`,
    { ownerId: abdairId, actorId: carlosId, postId: postIds['abdair'][0], cid: c1Id, nid: randomUUID() }
  );
  await run(
    `MATCH (target:Usuario {id: $targetId}), (actor:Usuario {id: $actorId})
     CREATE (target)<-[:RECIBIO]-(n:Notificacion {
       id: $nid, type: 'follow', read: false, createdAt: datetime(),
       actorId: $actorId, targetId: $targetId
     })
     CREATE (n)-[:SOBRE]->(actor)`,
    { targetId: abdairId, actorId: mariaId, nid: randomUUID() }
  );
  console.log('🔔 3 notificaciones de prueba creadas');

  // ============================================================
  // ====================  POSTGRESQL SEED  =====================
  // ============================================================
  try {
    console.log('\n🐘 Iniciando seed de PostgreSQL...');

    // ---- 1. Limpiar PG en orden seguro (respetando FKs) ----
    await prisma.comentarioLeccion.deleteMany();
    await prisma.intento.deleteMany();
    await prisma.progreso.deleteMany();
    await prisma.inscripcion.deleteMany();
    await prisma.logroUsuario.deleteMany();
    await prisma.certificado.deleteMany();
    await prisma.material.deleteMany();
    await prisma.leccion.deleteMany();
    // Evaluacion ↔ Modulo es 1:1 con FK en Evaluacion → debe borrarse antes
    await prisma.evaluacion.deleteMany();
    await prisma.modulo.deleteMany();
    await prisma.cursoProfesor.deleteMany();
    await prisma.curso.deleteMany();
    await prisma.categoria.deleteMany();
    await prisma.logro.deleteMany();
    await prisma.usuario.deleteMany();
    console.log('🗑️  PostgreSQL limpio');

    // ---- 2. Usuarios (espejo del array users[] de Neo4j) ----
    const pgUsersCfg = [
      { rol: 'PROFESOR',   racha: 12, verificado: true  }, // abdair         (users[0])
      { rol: 'PROFESOR',   racha: 7,  verificado: true  }, // maria_potosi   (users[1])
      { rol: 'PROFESOR',   racha: 3,  verificado: true  }, // dev_carlos     (users[2])
      { rol: 'ESTUDIANTE', racha: 5,  verificado: false }, // lucia_tech     (users[3])
      { rol: 'ESTUDIANTE', racha: 0,  verificado: false }, // neo4j_demo     (users[4])
    ];

    const pgUsers = [];
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const cfg = pgUsersCfg[i];
      const created = await prisma.usuario.create({
        data: {
          neoId: u.id,
          username: u.username,
          email: u.email,
          rol: cfg.rol,
          racha: cfg.racha,
          verificado: cfg.verificado,
        },
      });
      pgUsers.push(created);
    }
    const userByUsername = Object.fromEntries(pgUsers.map((u) => [u.username, u]));
    console.log(`👥 ${pgUsers.length} usuarios PostgreSQL creados`);

    // ---- 3. Categorías ----
    const categoriasData = [
      { nombre: 'Programación',     icono: '💻' },
      { nombre: 'Diseño UX/UI',     icono: '🎨' },
      { nombre: 'Matemáticas',      icono: '📐' },
      { nombre: 'Ciencia de Datos', icono: '📊' },
      { nombre: 'Idiomas',          icono: '🌍' },
    ];
    const categorias = {};
    for (const c of categoriasData) {
      categorias[c.nombre] = await prisma.categoria.create({ data: c });
    }
    console.log(`📚 ${categoriasData.length} categorías creadas`);

    // ---- 4. Cursos ----
    const cursosData = [
      {
        titulo: 'Desarrollo Web con React',
        descripcion: 'Aprendé a construir interfaces modernas con React 18. Cubrimos componentes, hooks, manejo de estado y mejores prácticas para apps reales.',
        creadorUsername: 'abdair',
        categoria: 'Programación',
        nivel: 'principiante',
        publicado: true,
        portadaUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
      },
      {
        titulo: 'Neo4j para Desarrolladores',
        descripcion: 'Modelá tus datos como un grafo y descubrí el poder de Cypher. Vamos a construir queries de recomendación y feeds sociales paso a paso.',
        creadorUsername: 'dev_carlos',
        categoria: 'Programación',
        nivel: 'intermedio',
        publicado: true,
        portadaUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      },
      {
        titulo: 'Diseño de Interfaces Modernas',
        descripcion: 'Principios de UI/UX aplicados a productos digitales. Desde jerarquía visual hasta sistemas de diseño escalables con Figma.',
        creadorUsername: 'maria_potosi',
        categoria: 'Diseño UX/UI',
        nivel: 'principiante',
        publicado: true,
        portadaUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
      },
      {
        titulo: 'Machine Learning con Python',
        descripcion: 'Curso intensivo de ML supervisado y no supervisado. Trabajamos con scikit-learn, pandas y casos de uso reales en producción.',
        creadorUsername: 'abdair',
        categoria: 'Ciencia de Datos',
        nivel: 'avanzado',
        publicado: true,
        portadaUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
      },
      {
        titulo: 'Álgebra Lineal Aplicada',
        descripcion: 'La matemática detrás de la inteligencia artificial. Vectores, matrices y transformaciones lineales con ejemplos prácticos en Python.',
        creadorUsername: 'dev_carlos',
        categoria: 'Matemáticas',
        nivel: 'intermedio',
        publicado: true,
        portadaUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80',
      },
      {
        titulo: 'Inglés para Desarrolladores',
        descripcion: 'Comunicate con confianza en code reviews, standups y documentación técnica. Vocabulario y frases reales del día a día.',
        creadorUsername: 'maria_potosi',
        categoria: 'Idiomas',
        nivel: 'principiante',
        publicado: true,
        portadaUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80',
      },
    ];

    const cursos = [];
    for (const c of cursosData) {
      const created = await prisma.curso.create({
        data: {
          titulo: c.titulo,
          descripcion: c.descripcion,
          nivel: c.nivel,
          publicado: c.publicado,
          portadaUrl: c.portadaUrl,
          categoriaId: categorias[c.categoria].id,
          creadorId: userByUsername[c.creadorUsername].id,
        },
      });
      cursos.push(created);
    }
    console.log(`🎓 ${cursos.length} cursos creados`);

    // ---- 5. Módulos y lecciones (2-3 por curso, 2-3 lecciones por módulo) ----
    // Estructura: modulosPorCurso[cursoIdx] = [{ titulo, descripcion, lecciones: [...] }]
    const modulosPorCurso = [
      // ---- Curso 0: Desarrollo Web con React ----
      [
        {
          titulo: 'Introducción a React',
          descripcion: 'Qué es React y por qué se volvió el estándar del frontend.',
          lecciones: [
            { titulo: '¿Qué es React?', contenido: 'React es una librería de JavaScript creada por Facebook para construir interfaces de usuario. Su modelo declarativo permite describir cómo se ve la UI según el estado, dejando que React se encargue de actualizar el DOM.', videoUrl: 'https://www.youtube.com/embed/BcVaGFXxKWY' },
            { titulo: 'Configurando el entorno con Vite', contenido: 'Vite es un bundler moderno mucho más rápido que Create React App. En esta lección configuramos un proyecto nuevo con Vite, instalamos dependencias y arrancamos el dev server.', videoUrl: 'https://www.youtube.com/embed/KCrXgy8qtjM' },
          ],
        },
        {
          titulo: 'Componentes y JSX',
          descripcion: 'Tu primer componente y la sintaxis JSX.',
          lecciones: [
            { titulo: 'Tu primer componente', contenido: 'Un componente de React es una función que devuelve JSX. Aprendemos a crear un componente Saludo, exportarlo y usarlo dentro de otro componente padre.', videoUrl: 'https://www.youtube.com/embed/Tn6-PIqc4UM' },
            { titulo: 'JSX y props', contenido: 'JSX nos deja escribir HTML dentro de JavaScript. Las props son argumentos que se pasan a los componentes para configurarlos desde afuera, igual que parámetros de función.', videoUrl: 'https://www.youtube.com/embed/7iobxzd_2mA' },
            { titulo: 'Componentes funcionales vs clase', contenido: 'Históricamente React tuvo componentes de clase, pero hoy los funcionales con hooks son el estándar. Comparamos ambos estilos y vemos cuándo migrar código viejo.', videoUrl: 'https://www.youtube.com/embed/dpTOrNEzPn0' },
          ],
        },
        {
          titulo: 'Hooks fundamentales',
          descripcion: 'useState y useEffect en profundidad.',
          lecciones: [
            { titulo: 'useState', contenido: 'useState te permite agregar estado local a un componente funcional. Vemos patrones comunes, cómo actualizar estado basado en el valor anterior y errores típicos al guardar objetos.', videoUrl: 'https://www.youtube.com/embed/O6P86uwfdR0' },
            { titulo: 'useEffect', contenido: 'useEffect ejecuta efectos secundarios como llamadas a APIs, suscripciones o manipulación del DOM. Aprendemos sobre el array de dependencias y la función de cleanup.', videoUrl: 'https://www.youtube.com/embed/j1ZET6Vm0LY' },
          ],
        },
      ],
      // ---- Curso 1: Neo4j para Desarrolladores ----
      [
        {
          titulo: 'Bases de datos en grafos',
          descripcion: 'Cuándo usar un grafo y cuándo no.',
          lecciones: [
            { titulo: '¿Por qué un grafo?', contenido: 'Las bases relacionales sufren con relaciones profundas como redes sociales o recomendaciones. Un grafo modela esos datos de forma natural y las queries quedan declarativas y rápidas.', videoUrl: 'https://www.youtube.com/embed/GekQqFZm7mA' },
            { titulo: 'Instalando Neo4j Desktop', contenido: 'Descargamos Neo4j Desktop, creamos una base local y nos conectamos al Browser. También configuramos credenciales para acceder desde Node con neo4j-driver.', videoUrl: 'https://www.youtube.com/embed/8jNPajk2s8k' },
          ],
        },
        {
          titulo: 'Lenguaje Cypher',
          descripcion: 'Las queries declarativas de Neo4j.',
          lecciones: [
            { titulo: 'MATCH y CREATE', contenido: 'Cypher se lee casi como ASCII art: nodos entre paréntesis y relaciones con flechas. Aprendemos a crear nodos con CREATE y buscarlos con MATCH usando patrones.', videoUrl: 'https://www.youtube.com/embed/rqTGNKwKRm0' },
            { titulo: 'Relaciones y patrones', contenido: 'Modelamos relaciones tipadas como (:Usuario)-[:SIGUE]->(:Usuario). Estudiamos cómo recorrer cadenas de relaciones y por qué los patrones son la magia de Cypher.', videoUrl: 'https://www.youtube.com/embed/ll8GrJnG-t0' },
            { titulo: 'WHERE y filtrado', contenido: 'Refinamos los matches con WHERE para filtrar por propiedades. También vemos OPTIONAL MATCH para manejar nodos que pueden o no existir sin romper la query.', videoUrl: 'https://www.youtube.com/embed/_IgfB6zBV28' },
          ],
        },
      ],
      // ---- Curso 2: Diseño de Interfaces Modernas ----
      [
        {
          titulo: 'Principios de UX',
          descripcion: 'Fundamentos visuales para diseñadores e ingenieros.',
          lecciones: [
            { titulo: 'Jerarquía visual', contenido: 'La jerarquía visual guía la mirada del usuario. Usamos tamaño, peso, color y espaciado para que lo importante destaque y el resto acompañe sin distraer.', videoUrl: 'https://www.youtube.com/embed/qZy6HmPSllk' },
            { titulo: 'Color y tipografía', contenido: 'Una paleta limitada y una tipografía consistente hacen que un producto se sienta profesional. Vemos contraste de color para accesibilidad y cómo elegir 2-3 pesos tipográficos.', videoUrl: 'https://www.youtube.com/embed/HAlIWfh0iFU' },
          ],
        },
        {
          titulo: 'Sistemas de diseño',
          descripcion: 'De Figma a producción.',
          lecciones: [
            { titulo: 'Tokens de diseño', contenido: 'Los tokens son variables semánticas: --color-primary, --space-4, --radius-lg. Definir tokens permite mantener consistencia entre Figma y código sin colores hardcodeados.', videoUrl: 'https://www.youtube.com/embed/YLo6g58vUm0' },
            { titulo: 'Componentes reutilizables', contenido: 'Diseñamos un sistema de botones, inputs y tarjetas que cubre el 80% de las pantallas. Documentamos variantes y estados (hover, focus, disabled) en Figma.', videoUrl: 'https://www.youtube.com/embed/DaLEBe-YTKU' },
          ],
        },
      ],
      // ---- Curso 3: Machine Learning con Python ----
      [
        {
          titulo: 'Fundamentos',
          descripcion: 'Las bases conceptuales y las herramientas.',
          lecciones: [
            { titulo: '¿Qué es Machine Learning?', contenido: 'ML es el subcampo de la IA donde los modelos aprenden patrones a partir de datos. Comparamos aprendizaje supervisado, no supervisado y por refuerzo con ejemplos cotidianos.', videoUrl: 'https://www.youtube.com/embed/ukzFI9rgwfU' },
            { titulo: 'NumPy y pandas', contenido: 'NumPy maneja arrays multidimensionales con operaciones vectorizadas rapidísimas. Pandas, encima de NumPy, nos da DataFrames para trabajar con datos tabulares como en Excel pero programable.', videoUrl: 'https://www.youtube.com/embed/QUT1VHiLplI' },
          ],
        },
        {
          titulo: 'Modelos supervisados',
          descripcion: 'Predicción con etiquetas.',
          lecciones: [
            { titulo: 'Regresión lineal', contenido: 'La regresión lineal es el modelo más simple y un excelente punto de partida. Ajustamos una recta a los datos minimizando el error cuadrático y evaluamos con R².', videoUrl: 'https://www.youtube.com/embed/CtsRRUddV2s' },
            { titulo: 'Árboles de decisión', contenido: 'Los árboles dividen el espacio de features en regiones simples. Son interpretables, manejan datos categóricos y son la base de modelos potentes como Random Forest.', videoUrl: 'https://www.youtube.com/embed/7VeUPuFGJHk' },
            { titulo: 'Redes neuronales', contenido: 'Una red neuronal aproxima funciones complejas combinando neuronas en capas. Implementamos una red básica con scikit-learn y vemos por qué Deep Learning es solo agregar más capas.', videoUrl: 'https://www.youtube.com/embed/aircAruvnKk' },
          ],
        },
      ],
      // ---- Curso 4: Álgebra Lineal Aplicada ----
      [
        {
          titulo: 'Vectores y matrices',
          descripcion: 'Los bloques de construcción.',
          lecciones: [
            { titulo: 'Operaciones con vectores', contenido: 'Sumar, restar y escalar vectores son operaciones básicas con interpretación geométrica clara. El producto punto mide cuánto se parecen dos vectores en dirección.', videoUrl: 'https://www.youtube.com/embed/fNk_zzaMoSs' },
            { titulo: 'Multiplicación de matrices', contenido: 'Multiplicar matrices es componer transformaciones lineales. Estudiamos la regla fila-columna y por qué el orden importa (A·B no siempre es B·A).', videoUrl: 'https://www.youtube.com/embed/XkY2DOUCWMU' },
          ],
        },
        {
          titulo: 'Transformaciones lineales',
          descripcion: 'Geometría y aplicaciones.',
          lecciones: [
            { titulo: 'Aplicaciones geométricas', contenido: 'Rotaciones, escalados y reflexiones se representan con matrices. Esto es lo que usa cualquier motor gráfico para mover objetos en una escena 3D.', videoUrl: 'https://www.youtube.com/embed/kYB8IZa5AuE' },
            { titulo: 'Valores propios', contenido: 'Los autovalores y autovectores revelan las direcciones en que una transformación solo escala. Son la base de PCA, una de las técnicas más usadas en ciencia de datos.', videoUrl: 'https://www.youtube.com/embed/PFDu1MEgHug' },
          ],
        },
      ],
      // ---- Curso 5: Inglés para Desarrolladores ----
      [
        {
          titulo: 'Vocabulario técnico',
          descripcion: 'Las palabras que vas a leer todos los días.',
          lecciones: [
            { titulo: 'Términos de programación', contenido: 'Repository, branch, merge, deploy, rollback, refactor. Aprendemos los verbos y sustantivos más usados en GitHub y JIRA con su pronunciación correcta.', videoUrl: 'https://www.youtube.com/embed/6Ps5KGXN2ZY' },
            { titulo: 'Frases en code reviews', contenido: '"LGTM", "nit:", "can we extract this into a function?". Practicamos las frases típicas de un PR review para opinar y sugerir sin sonar agresivo.', videoUrl: 'https://www.youtube.com/embed/1HTCaf9q6eE' },
          ],
        },
        {
          titulo: 'Comunicación profesional',
          descripcion: 'Hablar y escribir en el día a día.',
          lecciones: [
            { titulo: 'Standups en inglés', contenido: 'En un daily standup contás qué hiciste ayer, qué vas a hacer hoy y si tenés blockers. Practicamos plantillas de frases para sonar natural sin tropezarte.', videoUrl: 'https://www.youtube.com/embed/HGsHpNqHd2I' },
            { titulo: 'Documentación clara', contenido: 'Una buena README explica qué hace el proyecto, cómo correrlo y cómo contribuir. Vemos plantillas y conectores típicos en documentación técnica anglosajona.', videoUrl: 'https://www.youtube.com/embed/a3bCAfJV1ao' },
          ],
        },
      ],
    ];

    // Lista plana de lecciones por curso, para uso posterior en progreso
    const leccionesPorCurso = []; // leccionesPorCurso[cursoIdx] = [leccion, leccion, ...]
    let totalModulos = 0;
    let totalLecciones = 0;

    for (let cIdx = 0; cIdx < cursos.length; cIdx++) {
      const curso = cursos[cIdx];
      const modulos = modulosPorCurso[cIdx] || [];
      const cursoLecciones = [];

      for (let mIdx = 0; mIdx < modulos.length; mIdx++) {
        const m = modulos[mIdx];
        const modulo = await prisma.modulo.create({
          data: {
            titulo: m.titulo,
            descripcion: m.descripcion,
            orden: mIdx + 1,
            cursoId: curso.id,
          },
        });
        totalModulos += 1;

        for (let lIdx = 0; lIdx < m.lecciones.length; lIdx++) {
          const l = m.lecciones[lIdx];
          const leccion = await prisma.leccion.create({
            data: {
              titulo: l.titulo,
              contenido: l.contenido,
              videoUrl: l.videoUrl ?? null,
              orden: lIdx + 1,
              moduloId: modulo.id,
            },
          });
          cursoLecciones.push(leccion);
          totalLecciones += 1;
        }
      }
      leccionesPorCurso.push(cursoLecciones);
    }
    console.log(`📖 ${totalModulos} módulos y ${totalLecciones} lecciones creadas`);

    // ---- 6. Inscripciones ----
    const lucia = userByUsername['lucia_tech'];
    const neo4jDemo = userByUsername['neo4j_demo'];

    const inscripcionesData = [
      // lucia_tech → cursos 1, 2, 3 (índices 0, 1, 2) — todos sin completar
      { usuario: lucia,     curso: cursos[0], completado: false, fechaCompletado: null },
      { usuario: lucia,     curso: cursos[1], completado: false, fechaCompletado: null },
      { usuario: lucia,     curso: cursos[2], completado: false, fechaCompletado: null },
      // neo4j_demo → cursos 1 (completado) y 4 (no completado)
      { usuario: neo4jDemo, curso: cursos[0], completado: true,  fechaCompletado: new Date() },
      { usuario: neo4jDemo, curso: cursos[3], completado: false, fechaCompletado: null },
    ];

    for (const i of inscripcionesData) {
      await prisma.inscripcion.create({
        data: {
          usuarioId: i.usuario.id,
          cursoId: i.curso.id,
          completado: i.completado,
          fechaCompletado: i.fechaCompletado,
        },
      });
    }
    console.log(`✏️  ${inscripcionesData.length} inscripciones creadas`);

    // ---- 7. Progreso ----
    let totalProgresos = 0;

    // lucia_tech: primera lección del curso 1 y del curso 2
    await prisma.progreso.create({
      data: {
        usuarioId: lucia.id,
        leccionId: leccionesPorCurso[0][0].id,
        completada: true,
        fechaCompletado: new Date(),
      },
    });
    totalProgresos += 1;
    await prisma.progreso.create({
      data: {
        usuarioId: lucia.id,
        leccionId: leccionesPorCurso[1][0].id,
        completada: true,
        fechaCompletado: new Date(),
      },
    });
    totalProgresos += 1;

    // neo4j_demo: TODAS las lecciones del curso 1
    for (const leccion of leccionesPorCurso[0]) {
      await prisma.progreso.create({
        data: {
          usuarioId: neo4jDemo.id,
          leccionId: leccion.id,
          completada: true,
          fechaCompletado: new Date(),
        },
      });
      totalProgresos += 1;
    }
    console.log(`📈 ${totalProgresos} progresos creados`);

    // ---- 8. Crear relaciones INSCRITO_EN en Neo4j ----
    for (const i of inscripcionesData) {
      await run(
        `MATCH (u:Usuario {id: $neoId})
         MERGE (cref:CursoRef {cursoId: $cursoId})
         MERGE (u)-[r:INSCRITO_EN]->(cref)
         ON CREATE SET r.fechaInscripcion = datetime()`,
        { neoId: i.usuario.neoId, cursoId: i.curso.id },
      );
    }
    console.log(`🔗 ${inscripcionesData.length} relaciones INSCRITO_EN creadas en Neo4j`);

    // ---- 9. Logros ----
    const logrosData = [
      {
        nombre: 'Primera lección',
        descripcion: '¡Completaste tu primera lección en Titi!',
        icono: '📚',
        tipo: 'curso',
        condicion: 'Marcar al menos una lección como completada.',
      },
      {
        nombre: 'Racha de 7 días',
        descripcion: 'Estudiaste 7 días seguidos sin saltarte uno.',
        icono: '🔥',
        tipo: 'racha',
        condicion: 'Mantener una racha activa de 7 días.',
      },
      {
        nombre: 'Social',
        descripcion: 'Empezaste a construir tu red de aprendizaje en Titi.',
        icono: '🤝',
        tipo: 'social',
        condicion: 'Seguir al menos a 3 usuarios.',
      },
    ];

    const logros = {};
    for (const l of logrosData) {
      logros[l.nombre] = await prisma.logro.create({ data: l });
    }
    console.log(`🏅 ${logrosData.length} logros creados`);

    // ---- 10. Asignar LogroUsuario ----
    await prisma.logroUsuario.create({
      data: {
        usuarioId: lucia.id,
        logroId: logros['Primera lección'].id,
      },
    });
    await prisma.logroUsuario.create({
      data: {
        usuarioId: userByUsername['abdair'].id,
        logroId: logros['Racha de 7 días'].id,
      },
    });
    console.log('🏆 2 logros asignados (LogroUsuario)');

    console.log('\n📧 Cuentas demo: abdair@demo.com, lucia@demo.com / password123');
  } catch (err) {
    console.error('❌ Error en seed de PostgreSQL:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n✅ Seed completado!');
  console.log('📧 Login de prueba: abdair@demo.com / password123');
  console.log('⚠️  Si tenías constraints viejos (user_id, post_id de label User), deletealos manualmente en Neo4j Browser.');
  await driver.close();
}

seed().catch((err) => {
  console.error(err);
  driver.close();
  process.exit(1);
});
