import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import AppLayout from '../components/layout/AppLayout';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Plan {
  id: string;
  name: string;
  price_inr: number;
  billing_period: string;
  features: string[];
  is_current: boolean;
  highlighted: boolean;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(price);

export default function Pricing() {
  const { user } = useAuth();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchPlans = async () => {
      try {
        setLoading(true);

        const response = await apiClient.get<Plan[]>('/pricing/plans');

        if (!mounted) return;

        const receivedPlans = Array.isArray(response.data)
          ? response.data
          : [];

        setPlans(receivedPlans);
      } catch (error) {
        console.error('Failed to load pricing plans:', error);

        if (!mounted) return;

        setPlans([]);
        toast.error('Unable to load pricing plans. Please try again.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchPlans();

    return () => {
      mounted = false;
    };
  }, []);

  const handleUpgrade = () => {
    if (upgrading) return;

    setUpgrading(true);

    toast(
      'Payment integration is coming soon! For early access, reach out via the Contact page.',
      {
        icon: '🚀',
        duration: 4000,
      },
    );

    // Remove this once the real checkout/payment flow is connected.
    window.setTimeout(() => {
      setUpgrading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[80vh] items-center justify-center">
          <Loader2
            className="h-8 w-8 animate-spin text-primary"
            aria-label="Loading pricing plans"
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="mx-auto max-w-5xl p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <h1 className="font-display mb-3 text-4xl font-bold">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h1>

          <p className="mx-auto max-w-lg text-gray-400">
            Start free. Upgrade when you're ready to accelerate your placement
            prep with AI.
          </p>
        </motion.div>

        {plans.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-dark-border bg-dark-card p-8 text-center">
            <h2 className="font-display mb-2 text-xl font-semibold">
              Pricing plans unavailable
            </h2>

            <p className="text-sm text-gray-400">
              We couldn't load the available plans right now. Please refresh
              the page and try again.
            </p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            {plans.map((plan, index) => {
              const isPremium = plan.id.toLowerCase() === 'premium';

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.4,
                  }}
                  whileHover={{ y: -6 }}
                  className={`relative rounded-2xl border p-8 ${
                    plan.highlighted
                      ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent'
                      : 'border-dark-border bg-dark-card'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white">
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      Most Popular
                    </div>
                  )}

                  <div className="mb-2 flex items-center gap-2">
                    {isPremium && (
                      <Crown
                        className="h-5 w-5 text-amber-400"
                        aria-hidden="true"
                      />
                    )}

                    <h2 className="font-display text-xl font-bold">
                      {plan.name}
                    </h2>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      ₹{formatPrice(plan.price_inr)}
                    </span>

                    {plan.billing_period && (
                      <span className="text-gray-500">
                        /{plan.billing_period}
                      </span>
                    )}
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={`${plan.id}-${featureIndex}`}
                        className="flex items-start gap-2 text-sm text-gray-300"
                      >
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            plan.highlighted
                              ? 'text-amber-400'
                              : 'text-green-400'
                          }`}
                          aria-hidden="true"
                        />

                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.is_current ? (
                    <div className="w-full rounded-lg bg-dark-border py-2.5 text-center text-sm font-medium text-gray-400">
                      Current Plan
                    </div>
                  ) : isPremium ? (
                    <motion.button
                      type="button"
                      whileHover={upgrading ? undefined : { scale: 1.02 }}
                      whileTap={upgrading ? undefined : { scale: 0.98 }}
                      onClick={handleUpgrade}
                      disabled={upgrading}
                      className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {upgrading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                          Please wait...
                        </span>
                      ) : (
                        'Upgrade to Premium'
                      )}
                    </motion.button>
                  ) : (
                    <div className="w-full rounded-lg bg-dark-border py-2.5 text-center text-sm font-medium text-gray-500">
                      Free Forever
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {plans.length > 0 && (
          <p className="mt-10 text-center text-xs text-gray-500">
            {user?.is_premium
              ? "You're on the Premium plan. Thank you for supporting CodeMentor AI! 🎉"
              : 'Prices in INR. Cancel anytime.'}
          </p>
        )}
      </main>
    </AppLayout>
  );
}