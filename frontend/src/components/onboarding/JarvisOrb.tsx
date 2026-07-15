import { motion } from 'framer-motion';

interface JarvisOrbProps {
  isSpeaking: boolean;
  size?: number;
}

export default function JarvisOrb({ isSpeaking, size = 180 }: JarvisOrbProps) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer pulsing rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-primary/30"
          style={{ width: size, height: size }}
          animate={{
            scale: isSpeaking ? [1, 1.4, 1] : [1, 1.1, 1],
            opacity: isSpeaking ? [0.6, 0, 0.6] : [0.3, 0, 0.3],
          }}
          transition={{
            duration: isSpeaking ? 1.2 : 3,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Rotating outer ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          border: '1.5px solid transparent',
          borderTopColor: '#6366f1',
          borderRightColor: '#c084fc',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Counter-rotating ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          border: '1px solid transparent',
          borderBottomColor: '#f472b6',
          borderLeftColor: '#6366f1',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Core orb */}
      <motion.div
        className="relative rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center"
        style={{ width: size * 0.45, height: size * 0.45 }}
        animate={{
          boxShadow: isSpeaking
            ? ['0 0 30px rgba(99,102,241,0.6)', '0 0 60px rgba(192,132,252,0.9)', '0 0 30px rgba(99,102,241,0.6)']
            : '0 0 30px rgba(99,102,241,0.5)',
          scale: isSpeaking ? [1, 1.08, 1] : 1,
        }}
        transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
      >
        {/* Inner sound-wave bars */}
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-white/90 rounded-full"
              animate={{
                height: isSpeaking ? [6, 20, 6] : 6,
              }}
              transition={{
                duration: 0.5,
                repeat: isSpeaking ? Infinity : 0,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}