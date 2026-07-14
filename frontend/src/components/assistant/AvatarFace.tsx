import { motion } from 'framer-motion';

interface AvatarFaceProps {
  size?: number;
  isThinking?: boolean;
}

export default function AvatarFace({ size = 56, isThinking = false }: AvatarFaceProps) {
  return (
    <motion.div
      style={{ width: size, height: size }}
      className="relative rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden"
      animate={{ boxShadow: ['0 0 20px rgba(99,102,241,0.4)', '0 0 30px rgba(192,132,252,0.6)', '0 0 20px rgba(99,102,241,0.4)'] }}
      transition={{ duration: 2.5, repeat: Infinity }}
    >
      {/* Hair */}
      <div className="absolute top-0 w-full h-3/5 bg-gradient-to-b from-violet-900 to-transparent rounded-t-full opacity-80" />

      {/* Face */}
      <div className="relative w-3/5 h-3/5 bg-[#fbcfa3] rounded-full flex flex-col items-center justify-center mt-2">
        {/* Eyes */}
        <div className="flex gap-2 mt-1">
          <motion.div
            className="w-1.5 h-1.5 bg-[#2a1a3e] rounded-full"
            animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{ duration: 3, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
          />
          <motion.div
            className="w-1.5 h-1.5 bg-[#2a1a3e] rounded-full"
            animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{ duration: 3, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
          />
        </div>
        {/* Mouth */}
        <motion.div
          className="w-2 h-1 border-b-2 border-[#2a1a3e] rounded-full mt-1"
          animate={isThinking ? { scaleX: [1, 0.6, 1] } : { scaleX: 1 }}
          transition={{ duration: 0.8, repeat: isThinking ? Infinity : 0 }}
        />
      </div>

      {/* Thinking dots */}
      {isThinking && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}