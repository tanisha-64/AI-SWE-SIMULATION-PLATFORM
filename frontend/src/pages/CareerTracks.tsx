import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { careerTrackService } from '../api/services';
import { Loader2, TrendingUp, ArrowRight } from 'lucide-react';

interface Tier {
  id: number;
  name: string;
  min_lpa: number;
  max_lpa: number | null;
  description: string;
  dsa_topics: string[];
}

const tierColors: Record<string, string> = {
  '4-8 LPA': 'from-green-500 to-emerald-500',
  '8-15 LPA': 'from-blue-500 to-cyan-500',
  '15-30 LPA': 'from-purple-500 to-violet-500',
  '30+ LPA': 'from-amber-500 to-orange-500',
};

export default function CareerTracks() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    careerTrackService.getAllTiers().then((res) => {
      setTiers(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-gray-400 text-sm">Curating career tracks with AI...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold">Career Tracks</h1>
          </div>
          <p className="text-gray-400 mb-8">
            Pick your target salary band — get a curated prep roadmap based on real interview patterns.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to={`/career-tracks/${tier.id}`}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="relative overflow-hidden bg-dark-card border border-dark-border rounded-2xl p-6 h-full"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tierColors[tier.name] || 'from-primary to-purple-500'}`} />

                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-display text-2xl font-bold">{tier.name}</h2>
                      <ArrowRight className="w-5 h-5 text-gray-500" />
                    </div>

                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">{tier.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {tier.dsa_topics?.slice(0, 4).map((topic) => (
                        <span key={topic} className="text-xs px-2 py-1 bg-dark-border rounded-full text-gray-400">
                          {topic}
                        </span>
                      ))}
                      {tier.dsa_topics?.length > 4 && (
                        <span className="text-xs px-2 py-1 text-gray-500">+{tier.dsa_topics.length - 4} more</span>
                      )}
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}