/**
 * StreakBadge — muestra la racha del usuario con estética Titi.
 *
 * Variantes:
 *  - "sidebar"  → bloque oscuro para el sidebar dark
 *  - "hero"     → tarjeta cálida grande, ideal para el perfil
 *  - "inline"   → píldora compacta para meterse en cualquier card
 *
 * Estados:
 *  - activa  (estaActiva=true)  → naranja fuego, llama animada
 *  - rota    (racha === 0)      → gris, sin animación
 *  - en riesgo (no usada por ahora) → reservado para Etapa 3
 */
export default function StreakBadge({
  racha = 0,
  estaActiva = true,
  variant = 'inline',
  className = '',
}) {
  const rota = racha === 0;
  const activa = !rota && estaActiva;

  if (variant === 'sidebar') return <SidebarVariant racha={racha} activa={activa} rota={rota} className={className} />;
  if (variant === 'hero') return <HeroVariant racha={racha} activa={activa} rota={rota} className={className} />;
  return <InlineVariant racha={racha} activa={activa} rota={rota} className={className} />;
}

// ---- Llama animada SVG ----
function FlameIcon({ size = 24, dim = false, animated = true }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={animated ? 'titi-flame-flicker' : ''}
    >
      <defs>
        <linearGradient id={`flame-outer-${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={dim ? '#9CA3AF' : '#FF9A3C'} />
          <stop offset="55%" stopColor={dim ? '#6B7280' : '#FF6B35'} />
          <stop offset="100%" stopColor={dim ? '#4B5563' : '#D9480F'} />
        </linearGradient>
        <linearGradient id={`flame-inner-${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={dim ? '#E5E7EB' : '#FFE08A'} />
          <stop offset="100%" stopColor={dim ? '#9CA3AF' : '#FFD93D'} />
        </linearGradient>
      </defs>
      {/* Cuerpo principal */}
      <path
        d="M12 2c.6 3.4 3.5 4.8 3.5 8.5 0 1.6-.6 2.8-1.5 3.6.4-1.5.1-3-1-4.3 0 2.2-1 3.6-2 4.5-1.8 1.6-2.5 3.3-2.5 5 0 3.3 2.5 4.7 5.5 4.7s5.5-1.4 5.5-4.7c0-5.6-7.5-7.4-7.5-17.3z"
        fill={`url(#flame-outer-${size})`}
      />
      {/* Lengua interior */}
      <path
        d="M12 11c0 1.8-.7 2.8-1.4 3.7-.8 1-1.3 2-1.3 3.3 0 1.9 1.4 2.8 2.7 2.8s2.7-.9 2.7-2.8c0-2.4-2.7-3.8-2.7-7z"
        fill={`url(#flame-inner-${size})`}
      />
    </svg>
  );
}

// ---- Variante inline (chip) ----
function InlineVariant({ racha, activa, rota, className }) {
  if (rota) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full ${className}`}
        aria-label="Sin racha activa"
      >
        <FlameIcon size={16} dim animated={false} />
        <span className="text-sm font-bold text-gray-400 tabular-nums">0</span>
        <span className="text-xs text-gray-400 font-semibold">días</span>
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full ${
        activa ? 'shadow-[0_2px_6px_rgba(255,107,53,0.18)]' : ''
      } ${className}`}
      aria-label={`Racha de ${racha} días`}
    >
      <FlameIcon size={16} animated={activa} />
      <span className="text-sm font-black text-titi-streak tabular-nums">{racha}</span>
      <span className="text-xs text-titi-streak/80 font-semibold">
        {racha === 1 ? 'día' : 'días'}
      </span>
    </span>
  );
}

// ---- Variante hero (tarjeta cálida grande) ----
function HeroVariant({ racha, activa, rota, className }) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${
        rota
          ? 'from-gray-50 to-gray-100 border-gray-200'
          : 'from-orange-50 via-orange-50 to-amber-50 border-orange-200'
      } border-2 rounded-2xl p-5 flex items-center gap-4 ${className}`}
    >
      {/* Decoración */}
      {!rota && (
        <>
          <span
            aria-hidden="true"
            className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-titi-streak/10 blur-2xl"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-titi-yellow/20 blur-2xl"
          />
        </>
      )}

      <div className="relative shrink-0">
        <FlameIcon size={56} dim={rota} animated={activa} />
      </div>
      <div className="relative min-w-0 flex-1">
        <p className={`text-4xl font-black leading-none tabular-nums ${rota ? 'text-gray-400' : 'text-titi-streak'}`}>
          {racha}
        </p>
        <p className={`text-sm font-bold mt-1 ${rota ? 'text-gray-400' : 'text-titi-dark'}`}>
          {rota
            ? 'Tu racha se rompió'
            : racha === 1
              ? '¡Empezaste tu racha!'
              : `${racha} días seguidos`}
        </p>
        <p className={`text-xs font-semibold mt-0.5 ${rota ? 'text-gray-400' : 'text-titi-streak/80'}`}>
          {rota
            ? 'Completá una lección hoy para reiniciarla'
            : activa
              ? '¡Sigue así, no la pierdas!'
              : 'Volvé a estudiar para mantenerla viva'}
        </p>
      </div>
    </div>
  );
}

// ---- Variante sidebar (bloque oscuro) ----
function SidebarVariant({ racha, activa, rota, className }) {
  if (rota) {
    return (
      <div
        className={`flex items-center gap-3 bg-titi-dark-mid border border-white/10 rounded-xl px-3 py-2.5 ${className}`}
      >
        <FlameIcon size={26} dim animated={false} />
        <div className="min-w-0">
          <p className="text-white font-black text-base leading-none tabular-nums">0</p>
          <p className="text-gray-400 text-xs font-semibold">sin racha</p>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-titi-dark-mid via-titi-dark-mid to-titi-dark-deep border border-titi-streak/30 rounded-xl px-3 py-2.5 flex items-center gap-3 ${className}`}
    >
      {activa && (
        <span
          aria-hidden="true"
          className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-titi-streak/20 blur-xl"
        />
      )}
      <div className="relative shrink-0">
        <FlameIcon size={28} animated={activa} />
      </div>
      <div className="relative min-w-0">
        <p className="text-white font-black text-lg leading-none tabular-nums">{racha}</p>
        <p className="text-titi-streak text-xs font-bold uppercase tracking-wide mt-0.5">
          {racha === 1 ? 'día' : 'días'} seguidos
        </p>
      </div>
    </div>
  );
}
