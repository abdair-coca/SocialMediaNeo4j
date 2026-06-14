import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

// ---- GET / — público ----
// El CRUD de categorías (crear/editar/borrar) vive en routes/admin.js
// bajo /api/admin/categories (requiere rol ADMIN).
router.get('/', async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
      include: { _count: { select: { cursos: true } } },
    });
    res.json({ success: true, data: { categorias } });
  } catch (err) {
    console.error('GET /categories error', err);
    res.status(500).json({ success: false, message: 'Error obteniendo categorías' });
  }
});

export default router;
