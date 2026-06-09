import { useCallback, useEffect, useState } from 'react';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * useStreak — devuelve la racha actual del usuario autenticado.
 *
 * Estrategia:
 *  1. Inicializa desde `user.racha` (puede estar stale en localStorage).
 *  2. Refresca desde GET /api/progress/streak al montar / cuando cambia el token.
 *  3. Propaga cambios a AuthContext (updateUser) para que el resto de la app vea
 *     el valor fresco sin re-fetch.
 *
 * @returns {{racha:number, estaActiva:boolean, ultimaActividad:string|null, refresh:()=>void}}
 */
export default function useStreak() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [racha, setRacha] = useState(user?.racha ?? 0);
  const [estaActiva, setEstaActiva] = useState(true);
  const [ultimaActividad, setUltimaActividad] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await client.get('/api/progress/streak');
      if (data?.success) {
        setRacha(data.data.racha);
        setEstaActiva(Boolean(data.data.estaActiva));
        setUltimaActividad(data.data.ultimaActividad);
        if (user?.racha !== data.data.racha) {
          updateUser({ racha: data.data.racha });
        }
      }
    } catch {
      // silencioso — la racha es un nice-to-have
    }
  }, [isAuthenticated, user?.racha, updateUser]);

  useEffect(() => { refresh(); }, [refresh]);

  return { racha, estaActiva, ultimaActividad, refresh };
}
