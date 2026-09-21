import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AutoScrollHorizontalRowProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // pixels per frame, e.g. 0.6
  pauseDuration?: number; // ms to pause at edges, e.g. 1200
  showArrows?: boolean;
}

export const AutoScrollHorizontalRow: React.FC<AutoScrollHorizontalRowProps> = ({
  children,
  className = '',
  speed = 0.6,
  pauseDuration = 1200,
  showArrows = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const directionRef = useRef<number>(1); // 1 = scroll right, -1 = scroll left
  const pauseUntilRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteractingRef = useRef<boolean>(false);
  const scrollPosRef = useRef<number>(0);

  // Check scroll boundary state for arrows / fade masks
  const updateScrollBounds = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const hasOverflow = maxScroll > 2;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(hasOverflow && el.scrollLeft < maxScroll - 4);
    if (isUserInteractingRef.current) {
      scrollPosRef.current = el.scrollLeft;
    }
  }, []);

  // Main back-and-forth auto-scroll loop
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    scrollPosRef.current = el.scrollLeft;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = Math.min(currentTime - lastTime, 50); // limit delta to prevent jump
      lastTime = currentTime;

      const container = containerRef.current;
      if (container) {
        const maxScroll = container.scrollWidth - container.clientWidth;

        // If overflowing and not currently touched/hovered by user
        if (maxScroll > 2 && !isUserInteractingRef.current) {
          const now = Date.now();

          // Check if paused at one of the ends
          if (now >= pauseUntilRef.current) {
            const step = (speed * (delta / 16.66)) * directionRef.current;
            scrollPosRef.current += step;

            // Clamp and check boundaries
            if (directionRef.current === 1 && scrollPosRef.current >= maxScroll) {
              scrollPosRef.current = maxScroll;
              container.scrollLeft = maxScroll;
              directionRef.current = -1;
              pauseUntilRef.current = now + pauseDuration;
            } else if (directionRef.current === -1 && scrollPosRef.current <= 0) {
              scrollPosRef.current = 0;
              container.scrollLeft = 0;
              directionRef.current = 1;
              pauseUntilRef.current = now + pauseDuration;
            } else {
              container.scrollLeft = Math.round(scrollPosRef.current * 10) / 10;
            }

            updateScrollBounds();
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [speed, pauseDuration, updateScrollBounds]);

  // Pause on user interactions and resume gently
  const handleInteractionStart = () => {
    isUserInteractingRef.current = true;
    if (containerRef.current) {
      scrollPosRef.current = containerRef.current.scrollLeft;
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  };

  const handleInteractionEnd = () => {
    if (containerRef.current) {
      scrollPosRef.current = containerRef.current.scrollLeft;
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    // Resume auto-scrolling after 1800ms of inactivity
    resumeTimeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        scrollPosRef.current = containerRef.current.scrollLeft;
      }
      isUserInteractingRef.current = false;
      pauseUntilRef.current = Date.now() + 400;
    }, 1800);
  };

  // Listen to resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollBounds();

    const resizeObserver = new ResizeObserver(() => {
      updateScrollBounds();
    });

    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [updateScrollBounds]);

  const scrollByAmount = (amount: number) => {
    handleInteractionStart();
    const el = containerRef.current;
    if (el) {
      el.scrollBy({ left: amount, behavior: 'smooth' });
    }
    handleInteractionEnd();
  };

  return (
    <div 
      className="relative group w-full"
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onTouchCancel={handleInteractionEnd}
      onPointerDown={handleInteractionStart}
      onPointerUp={handleInteractionEnd}
      onWheel={handleInteractionStart}
    >
      {/* Left Edge Subtle Fade Gradient */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        }`} 
      />

      {/* Right Edge Subtle Fade Gradient */}
      <div 
        className={`absolute right-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
          canScrollRight ? 'opacity-100' : 'opacity-0'
        }`} 
      />

      {/* Optional Quick Arrow Navigation (hidden on mobile, visible on desktop hover) */}
      {showArrows && canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-180)}
          className="hidden sm:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 items-center justify-center hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
          aria-label="বামে স্ক্রল করুন"
        >
          <ChevronLeft size={14} />
        </button>
      )}

      {showArrows && canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(180)}
          className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 items-center justify-center hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
          aria-label="ডানে স্ক্রল করুন"
        >
          <ChevronRight size={14} />
        </button>
      )}

      {/* Main Horizontal Scroll Container without ANY visible scrollbars */}
      <div
        ref={containerRef}
        onScroll={updateScrollBounds}
        className={`flex gap-2 overflow-x-auto no-scrollbar py-1 w-full select-none ${className}`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>
    </div>
  );
};
