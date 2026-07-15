import { motion } from 'framer-motion';

interface JarvisOrbProps {
  isSpeaking: boolean;
  size?: number;
}

export default function JarvisOrb({ isSpeaking, size = 200 }: JarvisOrbProps) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Pulsing outer rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-cyan-400/30"
          style={{ width: size, height: size }}
          animate={{
            scale: isSpeaking ? [1, 1.35, 1] : [1, 1.08, 1],
            opacity: isSpeaking ? [0.7, 0, 0.7] : [0.3, 0, 0.3],
          }}
          transition={{ duration: isSpeaking ? 1.1 : 3, repeat: Infinity, delay: i * 0.35, ease: 'easeOut' }}
        />
      ))}

      {/* Rotating tech rings */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: size * 0.88, height: size * 0.88, border: '1.5px solid transparent', borderTopColor: '#22d3ee', borderRightColor: '#6366f1' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: size * 0.72, height: size * 0.72, border: '1px solid transparent', borderBottomColor: '#c084fc', borderLeftColor: '#22d3ee' }}
        animate={{ rotate: -360 }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
      />

      {/* Core face container */}
      <motion.div
        className="relative rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-black border-2 border-cyan-400/40 flex items-center justify-center overflow-hidden"
        style={{ width: size * 0.55, height: size * 0.55 }}
        animate={{
          boxShadow: isSpeaking
            ? ['0 0 25px rgba(34,211,238,0.5)', '0 0 55px rgba(99,102,241,0.8)', '0 0 25px rgba(34,211,238,0.5)']
            : '0 0 25px rgba(34,211,238,0.4)',
        }}
        transition={{ duration: 0.6, repeat: isSpeaking ? Infinity : 0 }}
      >
        {/* Scanline effect */}
        <motion.div
          className="absolute inset-x-0 h-8 bg-gradient-to-b from-cyan-400/20 to-transparent"
          animate={{ y: [-40, 120] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Robotic face */}
        <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 relative z-10">
          {/* Eyes */}
          <motion.rect
            x="24" y="38" width="16" height="4" rx="2"
            fill="#22d3ee"
            animate={{
              opacity: isSpeaking ? [1, 0.4, 1] : [1, 0.6, 1],
              scaleY: isSpeaking ? [1, 1, 0.2, 1, 1] : 1,
            }}
            transition={{ duration: isSpeaking ? 1 : 2.5, repeat: Infinity, times: isSpeaking ? [0, 0.4, 0.5, 0.6, 1] : undefined }}
          />
          <motion.rect
            x="60" y="38" width="16" height="4" rx="2"
            fill="#22d3ee"
            animate={{
              opacity: isSpeaking ? [1, 0.4, 1] : [1, 0.6, 1],
              scaleY: isSpeaking ? [1, 1, 0.2, 1, 1] : 1,
            }}
            transition={{ duration: isSpeaking ? 1 : 2.5, repeat: Infinity, times: isSpeaking ? [0, 0.4, 0.5, 0.6, 1] : undefined }}
          />

          {/* Mouth — animated voice bars */}
          <g transform="translate(35, 62)">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.rect
                key={i}
                x={i * 5}
                y="0"
                width="3"
                height="6"
                rx="1.5"
                fill="#6366f1"
                animate={{ height: isSpeaking ? [4, 14, 4] : 4, y: isSpeaking ? [1, -4, 1] : 1 }}
                transition={{ duration: 0.4, repeat: isSpeaking ? Infinity : 0, delay: i * 0.08, ease: 'easeInOut' }}
              />
            ))}
          </g>
        </svg>

        {/* Grid overlay for tech feel */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        />
      </motion.div>
    </div>
  );
}