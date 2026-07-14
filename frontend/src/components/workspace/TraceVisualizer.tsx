import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface TraceStep {
  line: number;
  variables: Record<string, any>;
}

interface TraceVisualizerProps {
  trace: TraceStep[];
  code: string;
}

export default function TraceVisualizer({ trace, code }: TraceVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const codeLines = code.split('\n');
  const step = trace[currentStep];

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, trace.length - 1));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    let i = currentStep;
    const interval = setInterval(() => {
      i++;
      if (i >= trace.length) {
        clearInterval(interval);
        setIsPlaying(false);
        return;
      }
      setCurrentStep(i);
    }, 700);
  };

  if (!trace || trace.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No trace data available. Try running code with loops/variables to see the execution trace.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Code with highlighted current line */}
      <div className="bg-dark-bg rounded-xl p-4 font-mono text-sm overflow-x-auto max-h-64 overflow-y-auto">
        {codeLines.map((line, idx) => {
          const lineNum = idx + 1;
          const isActive = step?.line === lineNum;
          return (
            <motion.div
              key={idx}
              animate={{
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0,0,0,0)',
              }}
              transition={{ duration: 0.3 }}
              className="flex px-2 py-0.5 rounded"
            >
              <span className="text-gray-600 w-8 select-none">{lineNum}</span>
              <span className={isActive ? 'text-primary font-semibold' : 'text-gray-300'}>
                {line || ' '}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Variable state panel */}
      <div className="bg-dark-bg rounded-xl p-4">
        <p className="text-gray-400 text-xs mb-3">Variables at this step</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-wrap gap-2"
          >
            {step && Object.keys(step.variables).length > 0 ? (
              Object.entries(step.variables).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-dark-card border border-dark-border rounded-lg px-3 py-1.5 flex items-center gap-2"
                >
                  <span className="text-primary font-mono text-sm font-semibold">{key}</span>
                  <span className="text-gray-500">=</span>
                  <span className="text-green-400 font-mono text-sm">{JSON.stringify(value)}</span>
                </div>
              ))
            ) : (
              <span className="text-gray-600 text-sm">No variables yet</span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-dark-bg rounded-xl p-3">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="p-2 rounded-lg hover:bg-dark-border disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 flex-1 mx-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </motion.button>

          <div className="flex-1 relative h-1.5 bg-dark-border rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-primary rounded-full"
              animate={{ width: `${((currentStep + 1) / trace.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <span className="text-xs text-gray-400 whitespace-nowrap">
            Step {currentStep + 1} / {trace.length}
          </span>
        </div>

        <button
          onClick={goNext}
          disabled={currentStep === trace.length - 1}
          className="p-2 rounded-lg hover:bg-dark-border disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}