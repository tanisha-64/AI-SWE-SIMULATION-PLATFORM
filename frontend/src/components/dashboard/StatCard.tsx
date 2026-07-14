import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  color: string;
  delay?: number;
}

export default function StatCard({ icon: Icon, label, value, suffix = '', color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="bg-dark-card border border-dark-border rounded-2xl p-5 relative overflow-hidden group"
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${color} group-hover:opacity-30 transition-opacity`} />
      <div className={`inline-flex p-2.5 rounded-xl ${color} bg-opacity-15 mb-3`}>
        <Icon className="w-5 h-5" style={{ color: 'inherit' }} />
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold">
        {value}
        {suffix && <span className="text-base text-gray-400 ml-1">{suffix}</span>}
      </p>
    </motion.div>
  );
}