import { Router } from 'express';
import prisma from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { rachaEstaActiva } from '../services/progress.service.js';

const router = Router();

// ---- GET /api/progress/streak — mi racha actual ----
router.get('/streak', requireAuth, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { neoId: req.user.id },
      select: { racha: true, ultimaActividad: true },
    });
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({
      success: true,
      data: {
        racha: usuario.racha,
        ultimaActividad: usuario.ultimaActividad,
        estaActiva: rachaEstaActiva(usuario.ultimaActividad),
      },
    });
  } catch (err) {
    console.error('GET /progress/streak error', err);
    res.status(500).json({ success: false, message: 'Error obteniendo racha' });
  }
});

router.get('/:username/streak', async (req, res) => {
  try {
    const { username } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { username },
      select: {
        racha: true,
        ultimaActividad: true,
      },
    });
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({
      success: true,
      data: {
        racha: usuario.racha,
        ultimaActividad: usuario.ultimaActividad,
        estaActiva: rachaEstaActiva(usuario.ultimaActividad),
      },
    });
  } catch (err) {
    console.error('GET /progress/:username/streak error', err);
    res.status(500).json({ success: false, message: 'Error obteniendo racha' });
  }
});
export default router;
