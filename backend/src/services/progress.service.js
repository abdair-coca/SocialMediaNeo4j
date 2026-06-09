import prisma from '../prisma.js';

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

/**
 * Actualiza la racha del usuario. Llamar UNA sola vez por evento de aprendizaje
 * (ej. al completar una lección por primera vez, o al aprobar una evaluación).
 *
 * Reglas:
 * - Primera actividad → racha = 1
 * - Misma fecha que la última actividad → no cambia
 * - Día siguiente al de la última actividad → racha + 1
 * - Más de un día desde la última actividad → racha = 1 (rota y reinicia)
 *
 * @returns {Promise<{racha:number, subio:boolean, ultimaActividad:Date, rota:boolean}>}
 */
export async function actualizarRacha(usuarioId) {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) return null;

  const hoy = startOfDay(new Date());
  const ayer = startOfDay(new Date(Date.now() - 86_400_000));
  const rachaPrev = usuario.racha;

  // Primera actividad de la vida del usuario
  if (!usuario.ultimaActividad) {
    const u = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { racha: 1, ultimaActividad: hoy },
    });
    return { racha: u.racha, subio: true, ultimaActividad: u.ultimaActividad, rota: false };
  }

  const ultima = startOfDay(usuario.ultimaActividad);

  // Ya estudió hoy — no tocar racha
  if (sameDay(ultima, hoy)) {
    return { racha: usuario.racha, subio: false, ultimaActividad: usuario.ultimaActividad, rota: false };
  }

  // Día siguiente — continúa
  if (sameDay(ultima, ayer)) {
    const u = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { racha: usuario.racha + 1, ultimaActividad: hoy },
    });
    return { racha: u.racha, subio: true, ultimaActividad: u.ultimaActividad, rota: false };
  }

  // Racha rota — reinicia a 1
  const u = await prisma.usuario.update({
    where: { id: usuarioId },
    data: { racha: 1, ultimaActividad: hoy },
  });
  return { racha: u.racha, subio: u.racha > rachaPrev, ultimaActividad: u.ultimaActividad, rota: true };
}

/**
 * Calcula si la racha actual sigue activa (última actividad fue hoy o ayer).
 * No modifica nada.
 */
export function rachaEstaActiva(ultimaActividad) {
  if (!ultimaActividad) return false;
  const hoy = startOfDay(new Date());
  const ayer = startOfDay(new Date(Date.now() - 86_400_000));
  const ultima = startOfDay(ultimaActividad);
  return sameDay(ultima, hoy) || sameDay(ultima, ayer);
}
