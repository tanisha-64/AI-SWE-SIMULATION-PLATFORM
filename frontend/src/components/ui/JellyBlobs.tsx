import { motion } from 'framer-motion';

interface JellyBlobsProps {
  variant?: 'default' | 'subtle';
}

export default function JellyBlobs({ variant = 'default' }: JellyBlobsProps) {
  const opacity = variant === 'subtle' ? 'opacity-10' : 'opacity-25';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className={`jelly-blob absolute w-80 h-80 bg-gradient-to-br from-indigo-500 to-purple-600 blur-3xl ${opacity}`}
        animate={{
          x: [0, 120, -50, 0],
          y: [0, 80, 40, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '5%', left: '5%' }}
      />
      <motion.div
        className={`jelly-blob absolute w-96 h-96 bg-gradient-to-br from-pink-500 to-rose-500 blur-3xl ${opacity}`}
        animate={{
          x: [0, -100, 60, 0],
          y: [0, 60, -60, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
        style={{ bottom: '5%', right: '10%' }}
      />
      <motion.div
        className={`jelly-blob absolute w-64 h-64 bg-gradient-to-br from-cyan-400 to-blue-500 blur-3xl ${opacity}`}
        animate={{
          x: [0, 80, -80, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '40%', left: '45%' }}
      />
    </div>
  );
}