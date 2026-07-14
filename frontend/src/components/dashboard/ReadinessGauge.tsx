import { motion } from 'framer-motion';

interface ReadinessGaugeProps {
  score: number;
}

export default function ReadinessGauge({ score }: ReadinessGaugeProps) {
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 70) return '#22c55e';
    if (score >= 40) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="flex flex-col items-center justify-center bg-dark-card border border-dark-border rounded-2xl p-6">
      <p className="text-gray-400 text-sm mb-4">Industry Readiness Score</p>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r="70"
            fill="none"
            stroke="#2a2a3e"
            strokeWidth="12"
          />
          <motion.circle
            cx="80" cy="80" r="70"
            fill="none"
            stroke={getColor()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-4xl font-bold"
          >
            {Math.round(score)}
          </motion.span>
          <span className="text-gray-400 text-xs">out of 100</span>
        </div>
      </div>
    </div>
  );
}