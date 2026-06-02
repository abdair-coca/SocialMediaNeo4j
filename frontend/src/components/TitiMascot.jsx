// TitiMascot — componente reutilizable de la mascota Titi
// Mientras solo hay una imagen, todos los moods comparten /Titi.png.
// En etapas futuras se reemplazarán por variantes (happy.png, sad.png, etc.)

const moods = {
  happy: { emoji: '🎉', default: '¡Así se hace!' },
  sad: { emoji: '😔', default: 'No encontré nada...' },
  surprised: { emoji: '😮', default: '¡Wow!' },
  motivating: { emoji: '💪', default: '¡Tú puedes!' },
  idle: { emoji: '😊', default: 'Todo tranquilo por aquí' },
};

const sizes = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-36 h-36',
  xl: 'w-48 h-48',
};

export default function TitiMascot({
  mood = 'happy',
  message,
  size = 'md',
  className = '',
}) {
  const { emoji, default: defaultMsg } = moods[mood] || moods.happy;
  const sizeClass = sizes[size] || sizes.md;
  const text = message ?? defaultMsg;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <img
        src="/Titi.png"
        alt="Titi"
        className={`${sizeClass} object-contain drop-shadow-lg select-none`}
        draggable={false}
        onError={(e) => {
          // Fallback si todavía no se subió la imagen
          e.currentTarget.style.display = 'none';
        }}
      />
      {text && (
        <p className="text-titi-text font-bold text-center text-sm sm:text-base max-w-xs leading-snug">
          <span aria-hidden="true" className="mr-1">{emoji}</span>
          {text}
        </p>
      )}
    </div>
  );
}
