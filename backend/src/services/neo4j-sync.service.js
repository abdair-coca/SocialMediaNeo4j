import { runQuery } from '../db.js';
import prisma from '../prisma.js';

/**
 * Ejecuta una replicación a Neo4j sin romper la operación principal.
 *
 * PostgreSQL es la fuente de verdad para todo lo educativo; Neo4j solo guarda
 * un espejo mínimo para queries sociales (recomendaciones, feed académico).
 * Si Neo4j falla, se loguea y se sigue — NUNCA se propaga el error al usuario.
 *
 * @param {string} label  etiqueta para el log
 * @param {() => Promise<any>} fn  trabajo contra Neo4j
 */
export async function replicateToNeo4j(label, fn) {
  try {
    await fn();
  } catch (err) {
    console.error(`Neo4j sync falló (${label})`, err);
  }
}

/** Traduce un usuarioId de Postgres a su neoId. Devuelve null si no existe. */
async function neoIdFromUsuarioId(usuarioId) {
  const u = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { neoId: true },
  });
  return u?.neoId ?? null;
}

/**
 * INSCRITO_EN — el usuario se inscribió en un curso.
 * Recibe el neoId directo (el JWT ya lo lleva en `req.user.id`).
 */
export async function syncInscripcion(neoId, cursoId) {
  if (!neoId) return;
  await replicateToNeo4j('inscripcion', () =>
    runQuery(
      `MATCH (u:Usuario {id: $neoId})
       MERGE (ref:CursoRef {cursoId: $cursoId})
       MERGE (u)-[r:INSCRITO_EN]->(ref)
       ON CREATE SET r.fechaInscripcion = datetime()`,
      { neoId, cursoId }
    )
  );
}

/**
 * COMPLETO_CURSO — el usuario completó un curso.
 * Recibe el usuarioId de Postgres y resuelve el neoId.
 */
export async function syncCursoCompletado(usuarioId, cursoId) {
  const neoId = await neoIdFromUsuarioId(usuarioId);
  if (!neoId) return;
  await replicateToNeo4j('curso_completado', () =>
    runQuery(
      `MATCH (u:Usuario {id: $neoId})
       MERGE (ref:CursoRef {cursoId: $cursoId})
       MERGE (u)-[r:COMPLETO_CURSO]->(ref)
       ON CREATE SET r.fechaCompletado = datetime()`,
      { neoId, cursoId }
    )
  );
}

/**
 * Notifica a los seguidores que el usuario desbloqueó un logro.
 * Recibe el usuarioId de Postgres y resuelve el neoId.
 *
 * Crea una `:Notificacion {type:'logro'}` por seguidor, con la misma forma que
 * el resto de notificaciones — `(seguidor)<-[:RECIBIO]-(n)-[:SOBRE]->(autor)` —
 * para que `GET /api/notifications` la lea sin cambios. El `id` se genera en
 * Cypher con `randomUUID()` para respetar el constraint único `notificacion_id`.
 */
export async function syncLogroNotificacion(usuarioId, logroNombre) {
  const neoId = await neoIdFromUsuarioId(usuarioId);
  if (!neoId) return;
  await replicateToNeo4j('logro', () =>
    runQuery(
      `MATCH (autor:Usuario {id: $neoId})<-[:SIGUIO]-(follower:Usuario)
       WITH autor, follower
       MERGE (follower)<-[:RECIBIO]-(n:Notificacion {
         type: 'logro', actorId: $neoId, logroNombre: $logroNombre
       })
       ON CREATE SET n.id = randomUUID(), n.read = false, n.createdAt = datetime()
       MERGE (n)-[:SOBRE]->(autor)`,
      { neoId, logroNombre }
    )
  );
}
