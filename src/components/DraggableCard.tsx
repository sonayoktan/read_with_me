import React, { useState, useEffect, useRef } from 'react';
import { GripHorizontal } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface DraggableCardProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  defaultPosition: () => Position;
  children: React.ReactNode;
  zIndex: number;
  onFocus: () => void;
  className?: string;
  isZenMode?: boolean;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  id,
  title,
  icon,
  defaultPosition,
  children,
  zIndex,
  onFocus,
  className = '',
  isZenMode = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize position from localStorage or defaultPosition callback
  const [position, setPosition] = useState<Position>(() => {
    try {
      const saved = localStorage.getItem(`rwm_drag_pos_${id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          // Boundary check on initial load
          const maxX = Math.max(8, window.innerWidth - 80);
          const maxY = Math.max(8, window.innerHeight - 80);
          return {
            x: Math.min(Math.max(8, parsed.x), maxX),
            y: Math.min(Math.max(8, parsed.y), maxY),
          };
        }
      }
    } catch {
      // Fallback
    }
    return defaultPosition();
  });

  const dragStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    initialElemX: number;
    initialElemY: number;
  }>({
    pointerId: 0,
    startX: 0,
    startY: 0,
    initialElemX: 0,
    initialElemY: 0,
  });

  // Clamp position to viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!cardRef.current) return prev;
        const width = cardRef.current.offsetWidth || 300;
        const height = cardRef.current.offsetHeight || 200;
        const maxX = Math.max(8, window.innerWidth - width - 8);
        const maxY = Math.max(8, window.innerHeight - height - 8);
        return {
          x: Math.min(Math.max(8, prev.x), maxX),
          y: Math.min(Math.max(8, prev.y), maxY),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;

    // Ignore clicks on buttons, inputs, sliders, or elements explicitly marked with data-no-drag
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a, select, [data-no-drag="true"]')) {
      return;
    }

    onFocus();
    const handleElement = e.currentTarget;
    try {
      handleElement.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    setIsDragging(true);
    dragStartRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initialElemX: position.x,
      initialElemY: position.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || e.pointerId !== dragStartRef.current.pointerId) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    let nextX = dragStartRef.current.initialElemX + deltaX;
    let nextY = dragStartRef.current.initialElemY + deltaY;

    // Viewport boundary clamping
    if (cardRef.current) {
      const width = cardRef.current.offsetWidth || 320;
      const height = cardRef.current.offsetHeight || 200;
      const maxX = Math.max(8, window.innerWidth - width - 8);
      const maxY = Math.max(8, window.innerHeight - height - 8);
      nextX = Math.min(Math.max(8, nextX), maxX);
      nextY = Math.min(Math.max(8, nextY), maxY);
    }

    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || e.pointerId !== dragStartRef.current.pointerId) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    setIsDragging(false);

    // Save final position to localStorage
    setPosition((current) => {
      try {
        localStorage.setItem(`rwm_drag_pos_${id}`, JSON.stringify(current));
      } catch {
        // Ignore
      }
      return current;
    });
  };

  return (
    <div
      ref={cardRef}
      onPointerDownCapture={onFocus}
      onPointerDown={isZenMode ? handlePointerDown : undefined}
      onPointerMove={isZenMode ? handlePointerMove : undefined}
      onPointerUp={isZenMode ? handlePointerUp : undefined}
      onPointerCancel={isZenMode ? handlePointerUp : undefined}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        zIndex: isDragging ? 99 : zIndex,
      }}
      className={`fixed top-0 left-0 transition-shadow duration-200 ${
        isDragging ? 'shadow-[0_20px_50px_rgba(0,0,0,0.6)] scale-[1.01]' : ''
      } ${isZenMode ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
    >
      {/* Draggable Header Handle Bar */}
      {!isZenMode ? (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full flex items-center justify-between px-3 py-1 bg-black/40 hover:bg-black/60 active:bg-black/70 backdrop-blur-md rounded-t-xl sm:rounded-t-2xl border border-b-0 border-white/10 cursor-grab active:cursor-grabbing select-none text-zinc-400 hover:text-white transition-colors"
          title="Kartı taşımak için bu başlıktan tutarak sürükleyin"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide">
            <GripHorizontal className="w-3.5 h-3.5 text-amber-400/80" />
            {icon && <span className="text-amber-300">{icon}</span>}
            <span className="text-[10px] text-zinc-300">{title}</span>
          </div>
          <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase pointer-events-none">
            Taşı
          </span>
        </div>
      ) : (
        /* Zen Mode Minimalist Grip Handle */
        <div
          className="w-full flex items-center justify-center pt-2 pb-0.5 cursor-grab active:cursor-grabbing group/drag select-none"
          title="Sayacı taşımak için sürükleyin"
        >
          <div className="w-10 h-1 rounded-full bg-white/20 group-hover/drag:bg-amber-400/80 group-active/drag:bg-amber-400 transition-colors" />
        </div>
      )}

      {/* Card Body */}
      <div className={!isZenMode ? 'rounded-b-xl sm:rounded-b-2xl overflow-hidden' : 'rounded-b-2xl overflow-hidden'}>
        {children}
      </div>
    </div>
  );
};
