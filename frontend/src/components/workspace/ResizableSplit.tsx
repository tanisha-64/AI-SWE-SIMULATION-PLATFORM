import { useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, PanelLeftClose, PanelRightClose, Columns2 } from 'lucide-react';

interface ResizableSplitProps {
  left: ReactNode;
  right: ReactNode;
}

type LayoutMode = 'split' | 'focus-left' | 'focus-right';

export default function ResizableSplit({ left, right }: ResizableSplitProps) {
  const [leftWidth, setLeftWidth] = useState(42); // percentage
  const [mode, setMode] = useState<LayoutMode>('split');
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => setDragging(true), []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(75, Math.max(25, pct)));
    },
    [dragging]
  );

  const handleMouseUp = useCallback(() => setDragging(false), []);

  return (
    <div className="relative h-full">
      {/* Layout toggle buttons */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 glass-card rounded-lg p-1">
        <button
          onClick={() => setMode('focus-left')}
          className={`p-1.5 rounded-md transition-colors ${mode === 'focus-left' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
          title="Focus description"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setMode('split')}
          className={`p-1.5 rounded-md transition-colors ${mode === 'split' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
          title="Split view"
        >
          <Columns2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setMode('focus-right')}
          className={`p-1.5 rounded-md transition-colors ${mode === 'focus-right' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
          title="Focus editor"
        >
          <PanelRightClose className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex h-full select-none"
      >
        {mode !== 'focus-right' && (
          <div
            style={{ width: mode === 'focus-left' ? '100%' : `${leftWidth}%` }}
            className="h-full overflow-hidden transition-[width] duration-200"
          >
            {left}
          </div>
        )}

        {mode === 'split' && (
          <div
            onMouseDown={handleMouseDown}
            className={`w-1.5 shrink-0 cursor-col-resize flex items-center justify-center relative group ${
              dragging ? 'bg-primary/40' : 'bg-dark-border hover:bg-primary/30'
            } transition-colors`}
          >
            <div className="absolute p-1 rounded bg-dark-card border border-dark-border opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        )}

        {mode !== 'focus-left' && (
          <div
            style={{ width: mode === 'focus-right' ? '100%' : `${100 - leftWidth}%` }}
            className="h-full overflow-hidden transition-[width] duration-200"
          >
            {right}
          </div>
        )}
      </div>
    </div>
  );
}