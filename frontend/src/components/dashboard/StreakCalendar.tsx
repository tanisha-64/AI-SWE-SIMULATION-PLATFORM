import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { analyticsService } from '../../api/services';

interface CalendarDay {
  date: string;
  submissions_count: number;
}

export default function StreakCalendar() {
  const [days, setDays] = useState<CalendarDay[]>([]);

  useEffect(() => {
    analyticsService.getCalendar().then((res) => setDays(res.data));
  }, []);

  const getLast90Days = () => {
    const result: { date: string; count: number }[] = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = days.find((day) => day.date === dateStr);
      result.push({ date: dateStr, count: found?.submissions_count || 0 });
    }
    return result;
  };

  const getColor = (count: number) => {
    if (count === 0) return 'bg-dark-border';
    if (count <= 1) return 'bg-primary/30';
    if (count <= 3) return 'bg-primary/60';
    return 'bg-primary';
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <p className="text-gray-400 text-sm mb-4">Activity — Last 90 Days</p>
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2">
        {getLast90Days().map((day, i) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.003 }}
            className={`w-3 h-3 rounded-sm ${getColor(day.count)}`}
            title={`${day.date}: ${day.count} submissions`}
          />
        ))}
      </div>
    </div>
  );
}