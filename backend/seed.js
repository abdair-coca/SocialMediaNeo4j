// seed.js — ejecutar con: node seed.js
// Crea usuarios, posts, follows y likes de prueba en Neo4j

import 'dotenv/config';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import neo4j from 'neo4j-driver';

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

  // Limpiar datos anteriores
  await run('MATCH (n) DETACH DELETE n');
  console.log('🗑️  Base de datos limpia');

  // Constraints
  await run('CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE');
  await run('CREATE CONSTRAINT user_username IF NOT EXISTS FOR (u:User) REQUIRE u.username IS UNIQUE');
  await run('CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE');
  await run('CREATE CONSTRAINT post_id IF NOT EXISTS FOR (p:Post) REQUIRE p.id IS UNIQUE');
  await run('CREATE CONSTRAINT hashtag_name IF NOT EXISTS FOR (h:Hashtag) REQUIRE h.name IS UNIQUE');
  console.log('✅ Constraints creados');

  // Usuarios
  const password = await bcrypt.hash('password123', 10);
  const users = [
    { id: randomUUID(), username: 'abdair', email: 'abdair@demo.com', bio: 'Full stack dev 🚀 | Bolivia', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=abdair' },
    { id: randomUUID(), username: 'maria_potosi', email: 'maria@demo.com', bio: 'Diseñadora UX/UI | Potosí 🇧🇴', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria' },
    { id: randomUUID(), username: 'dev_carlos', email: 'carlos@demo.com', bio: 'Backend engineer | Neo4j fan', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos' },
    { id: randomUUID(), username: 'lucia_tech', email: 'lucia@demo.com', bio: 'React developer | Open source contributor', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucia' },
    { id: randomUUID(), username: 'neo4j_demo', email: 'demo@demo.com', bio: 'Cuenta demo de NeoSocial | Grafos FTW 📊', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neo4j' },
  ];

  for (const u of users) {
    await run(
      `CREATE (:User {id: $id, username: $username, email: $email, password: $password,
        bio: $bio, avatarUrl: $avatarUrl, createdAt: datetime()})`,
      { ...u, password }
    );
  }
  console.log(`👥 ${users.length} usuarios creados`);

  // Posts
  const posts = [
    { authorUsername: 'abdair', content: 'Implementando NeoSocial con #Neo4j y #React — las bases de datos de grafos son una locura 🔥', imageUrl: null },
    { authorUsername: 'abdair', content: 'Día 2 del proyecto: el feed ya trae posts de usuarios seguidos con una sola query Cypher 🤯 #grafos #backend', imageUrl: null },
    { authorUsername: 'maria_potosi', content: 'Diseñando la UI de #NeoSocial. Inspiración en TikTok pero con identidad propia 🎨 #uxdesign', imageUrl: null },
    { authorUsername: 'dev_carlos', content: 'El modelo de datos en grafos facilita muchísimo las queries de recomendaciones. MATCH patterns son elegantes. #Neo4j #BaseDeDatos', imageUrl: null },
    { authorUsername: 'lucia_tech', content: 'Conectando React con la API de #NeoSocial. AuthContext listo, rutas protegidas funcionando ✅ #React #frontend', imageUrl: null },
    { authorUsername: 'neo4j_demo', content: 'Bienvenidos a NeoSocial — la primera red social de Bolivia basada en grafos 🇧🇴 #NeoSocial #grafos #Bolivia', imageUrl: null },
    { authorUsername: 'dev_carlos', content: 'Pro tip: siempre cierra la sesión de neo4j-driver en un bloque finally. Los leaks de sesión son silenciosos 🐛 #Neo4j #tips', imageUrl: null },
    { authorUsername: 'maria_potosi', content: 'El tema oscuro quedó increíble. Fondo #0a0a0a, acento rojo, tipografía limpia. #UI #diseño', imageUrl: null },
  ];

  for (const p of posts) {
    const postId = randomUUID();
    // Extraer hashtags del content
    const hashtags = [...p.content.matchAll(/#(\w+)/g)].map(m => m[1].toLowerCase());

    await run(
      `MATCH (u:User {username: $author})
       CREATE (u)-[:PUBLISHED]->(p:Post {id: $id, content: $content, imageUrl: $imageUrl, createdAt: datetime()})`,
      { author: p.authorUsername, id: postId, content: p.content, imageUrl: p.imageUrl }
    );

    for (const tag of hashtags) {
      await run(
        `MATCH (p:Post {id: $postId})
         MERGE (h:Hashtag {name: $tag})
         MERGE (p)-[:HAS_HASHTAG]->(h)`,
        { postId, tag }
      );
    }
  }
  console.log(`📝 ${posts.length} posts creados`);

  // Follows
  const follows = [
    ['abdair', 'maria_potosi'],
    ['abdair', 'dev_carlos'],
    ['abdair', 'neo4j_demo'],
    ['maria_potosi', 'abdair'],
    ['maria_potosi', 'lucia_tech'],
    ['dev_carlos', 'abdair'],
    ['dev_carlos', 'neo4j_demo'],
    ['lucia_tech', 'abdair'],
    ['lucia_tech', 'dev_carlos'],
    ['neo4j_demo', 'abdair'],
  ];

  for (const [from, to] of follows) {
    await run(
      `MATCH (a:User {username: $from}), (b:User {username: $to})
       MERGE (a)-[:FOLLOWS]->(b)`,
      { from, to }
    );
  }
  console.log(`🤝 ${follows.length} follows creados`);

  // Likes
  const likes = [
    ['maria_potosi', 'abdair', 0],
    ['dev_carlos', 'abdair', 0],
    ['lucia_tech', 'abdair', 1],
    ['neo4j_demo', 'dev_carlos', 0],
    ['abdair', 'maria_potosi', 0],
    ['abdair', 'neo4j_demo', 0],
  ];

  // Obtener IDs de posts para los likes
  const postRecords = await run(
    'MATCH (u:User)-[:PUBLISHED]->(p:Post) RETURN u.username as author, p.id as id, p.content as content ORDER BY p.createdAt'
  );

  const postsByAuthor = {};
  for (const r of postRecords.records) {
    const author = r.get('author');
    if (!postsByAuthor[author]) postsByAuthor[author] = [];
    postsByAuthor[author].push(r.get('id'));
  }

  for (const [liker, postAuthor, postIndex] of likes) {
    const postId = postsByAuthor[postAuthor]?.[postIndex];
    if (!postId) continue;
    await run(
      `MATCH (u:User {username: $liker}), (p:Post {id: $postId})
       MERGE (u)-[:LIKED]->(p)`,
      { liker, postId }
    );
  }
  console.log(`❤️  Likes creados`);

  // Comentarios
  await run(
    `MATCH (u:User {username: 'dev_carlos'}), (p:Post {id: $postId})
     CREATE (u)-[:COMMENTED {id: $id, text: 'Muy buen punto! Las queries Cypher son súper legibles comparado con SQL para este tipo de datos', createdAt: datetime()}]->(p)`,
    { postId: postsByAuthor['abdair']?.[0], id: randomUUID() }
  );
  await run(
    `MATCH (u:User {username: 'lucia_tech'}), (p:Post {id: $postId})
     CREATE (u)-[:COMMENTED {id: $id, text: 'Genial! Cuánto tiempo les tomó conectar el driver con Express?', createdAt: datetime()}]->(p)`,
    { postId: postsByAuthor['abdair']?.[0], id: randomUUID() }
  );
  console.log('💬 Comentarios creados');

  console.log('\n✅ Seed completado!');
  console.log('📧 Login de prueba: abdair@demo.com / password123');
  await driver.close();
}

seed().catch(err => { console.error(err); driver.close(); process.exit(1); });
