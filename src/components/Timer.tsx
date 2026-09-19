import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Settings } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { TimerMode } from '../types';
import { audioManager } from '../utils/audio';

interface TimerProps {
  isZenMode: boolean;
  onProgressChange?: (progress: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ isZenMode, onProgressChange }) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [durations, setDurations] = useState({
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  });

  // Resizable dimensions (persisted in localStorage, bounded with min dimensions - 20% more compact)
  const [size, setSize] = useState<{ width: number; height: number }>(() => {
    try {
      const saved = localStorage.getItem('rwm_timer_size');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.width === 'number' && typeof parsed.height === 'number') {
          // If stored dimension was the old large default 380x280, modernize to compact 304x224
          const initialW = parsed.width === 380 ? 304 : parsed.width;
          const initialH = parsed.height === 280 ? 224 : parsed.height;
          return {
            width: Math.max(288, Math.min(window.innerWidth - 32, initialW)),
            height: Math.max(216, Math.min(window.innerHeight - 32, initialH)),
          };
        }
      }
    } catch {
      // Fallback
    }
    return { width: 304, height: 224 };
  });

  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  }>({
    pointerId: 0,
    startX: 0,
    startY: 0,
    startWidth: 304,
    startHeight: 224,
  });

  // Dynamic scale factor based on width and height (20% compact base 304x224)
  const scaleFactor = Math.max(0.65, Math.min(2.5, (size.width / 304) * 0.75 + (size.height / 224) * 0.25));

  const handleResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const handleElement = e.currentTarget;
    handleElement.setPointerCapture(e.pointerId);

    setIsResizing(true);
    resizeStartRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };
  };

  const handleResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing || e.pointerId !== resizeStartRef.current.pointerId) return;

    const deltaX = e.clientX - resizeStartRef.current.startX;
    const deltaY = e.clientY - resizeStartRef.current.startY;

    const minW = isZenMode ? 200 : 288;
    const minH = isZenMode ? 140 : 216;

    const maxWidth = Math.max(minW, window.innerWidth - 32);
    const maxHeight = Math.max(minH, window.innerHeight - 32);

    const newWidth = Math.max(minW, Math.min(maxWidth, resizeStartRef.current.startWidth + deltaX));
    const newHeight = Math.max(minH, Math.min(maxHeight, resizeStartRef.current.startHeight + deltaY));

    setSize({ width: newWidth, height: newHeight });
  };

  const handleResizeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing || e.pointerId !== resizeStartRef.current.pointerId) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    setIsResizing(false);
    setSize((current) => {
      try {
        localStorage.setItem('rwm_timer_size', JSON.stringify(current));
      } catch {
        // Ignore
      }
      return current;
    });
  };

  const [timeLeft, setTimeLeft] = useState<number>(durations.pomodoro);
  const [stopwatchTime, setStopwatchTime] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Custom durations in minutes for settings
  const [customPomoMin, setCustomPomoMin] = useState(25);
  const [customShortMin, setCustomShortMin] = useState(5);
  const [customLongMin, setCustomLongMin] = useState(15);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    audioManager.playSoftClick();
    if (newMode === 'stopwatch') {
      setStopwatchTime(0);
    } else {
      setTimeLeft(durations[newMode]);
    }
  }, [durations]);

  const toggleTimer = () => {
    audioManager.playSoftClick();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    audioManager.playSoftClick();
    setIsActive(false);
    if (mode === 'stopwatch') {
      setStopwatchTime(0);
    } else {
      setTimeLeft(durations[mode]);
    }
  };

  const handleFinish = useCallback(() => {
    setIsActive(false);
    if (soundEnabled) {
      audioManager.playBellSound();
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 },
        colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#ffffff']
      });
    } catch {
      // Confetti fallback
    }

    if (mode === 'pomodoro') {
      setCompletedSessions(prev => prev + 1);
      // Auto suggest break
      if ((completedSessions + 1) % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('pomodoro');
    }
  }, [completedSessions, mode, soundEnabled, switchMode]);

  // Main tick effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (mode === 'stopwatch') {
          setStopwatchTime(prev => prev + 1);
        } else {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(interval!);
              handleFinish();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, mode, handleFinish]);

  // Update browser document title with remaining time
  useEffect(() => {
    const formatTitleTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (isActive) {
      const display = mode === 'stopwatch' ? formatTitleTime(stopwatchTime) : formatTitleTime(timeLeft);
      document.title = `(${display}) Read With Me ☕`;
    } else {
      document.title = 'Read With Me ☕ Cozy Lo-Fi';
    }
  }, [isActive, timeLeft, stopwatchTime, mode]);

  // Keyboard shortcut: Space to play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsActive(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatDisplayTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return {
      minStr: minutes.toString().padStart(2, '0'),
      secStr: seconds.toString().padStart(2, '0')
    };
  };

  const currentSeconds = mode === 'stopwatch' ? stopwatchTime : timeLeft;
  const { minStr, secStr } = formatDisplayTime(currentSeconds);

  // Progress percentage for Pomodoro
  const totalModeDuration = mode === 'stopwatch' ? 3600 : durations[mode];
  const progressPercent = mode === 'stopwatch'
    ? Math.min(100, (stopwatchTime / 3600) * 100)
    : Math.max(0, ((totalModeDuration - timeLeft) / totalModeDuration) * 100);

  useEffect(() => {
    onProgressChange?.(progressPercent / 100);
  }, [progressPercent, onProgressChange]);

  const saveSettings = () => {
    const newDurations = {
      pomodoro: Math.max(1, customPomoMin) * 60,
      shortBreak: Math.max(1, customShortMin) * 60,
      longBreak: Math.max(1, customLongMin) * 60,
    };
    setDurations(newDurations);
    if (mode !== 'stopwatch') {
      setTimeLeft(newDurations[mode]);
      setIsActive(false);
    }
    setShowSettings(false);
  };

  return (
    <div
      style={{
        width: `${size.width}px`,
        minWidth: isZenMode ? '200px' : '288px',
        height: `${size.height}px`,
        minHeight: isZenMode ? '140px' : '216px',
      }}
      className={`relative glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-75 flex flex-col justify-between select-none ${
        isZenMode ? 'bg-black/60 border-white/15 pt-2 pb-3.5 px-4 sm:px-5' : ''
      }`}
    >
        
        {/* Header tabs (hidden in Zen Mode) */}
        {!isZenMode && (
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10">
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/30 border border-white/5 text-[11px] font-medium">
              <button
                onClick={() => switchMode('pomodoro')}
                className={`px-2 py-1 rounded-md transition-all ${
                  mode === 'pomodoro'
                    ? 'bg-amber-500/30 text-amber-300 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Pomodoro
              </button>
              <button
                onClick={() => switchMode('shortBreak')}
                className={`px-2 py-1 rounded-md transition-all ${
                  mode === 'shortBreak'
                    ? 'bg-teal-500/30 text-teal-300 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Mola
              </button>
              <button
                onClick={() => switchMode('longBreak')}
                className={`px-2 py-1 rounded-md transition-all ${
                  mode === 'longBreak'
                    ? 'bg-indigo-500/30 text-indigo-300 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Uzun Mola
              </button>
              <button
                onClick={() => switchMode('stopwatch')}
                className={`px-2 py-1 rounded-md transition-all ${
                  mode === 'stopwatch'
                    ? 'bg-rose-500/30 text-rose-300 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Sınırsız okuma kronometresi"
              >
                Kronometre
              </button>
            </div>

            <div className="flex items-center gap-1 text-zinc-400">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                title="Süre Ayarları"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Settings Modal Dialog (Strict 85vh max-height, overflow-y auto, sticky footer) */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div
              className="glass-panel w-full max-w-sm rounded-2xl sm:rounded-3xl border border-white/15 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-left"
              style={{ maxHeight: '85vh' }}
            >
              {/* Modal Header (Fixed at top) */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 shrink-0 bg-stone-900/60 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                  <span>Süre Ayarları</span>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs text-zinc-300 custom-scrollbar">
                <div>
                  <label className="block text-[11px] text-zinc-300 font-medium mb-1.5">
                    Süreleri Özelleştir (dakika)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Odak</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={customPomoMin}
                        onChange={(e) => setCustomPomoMin(parseInt(e.target.value) || 25)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white font-mono text-center focus:outline-none focus:border-amber-400 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Kısa Mola</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={customShortMin}
                        onChange={(e) => setCustomShortMin(parseInt(e.target.value) || 5)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white font-mono text-center focus:outline-none focus:border-teal-400 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Uzun Mola</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={customLongMin}
                        onChange={(e) => setCustomLongMin(parseInt(e.target.value) || 15)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white font-mono text-center focus:outline-none focus:border-indigo-400 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Test Sound Effect */}
                <div className="flex items-center justify-between py-2 border-t border-white/10">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    Bitiş Çan Sesi (Lo-Fi Zil)
                  </span>
                  <button
                    type="button"
                    onClick={() => audioManager.playBellSound()}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-amber-500/20 text-zinc-200 hover:text-amber-300 border border-white/10 text-[11px] font-medium transition-colors"
                    title="Bitiş sesini dinle"
                  >
                    🔔 Sesi Dinle
                  </button>
                </div>
              </div>

              {/* Sticky Footer: Ekran altına sabit (asla taşma yapmaz) */}
              <div className="sticky bottom-0 shrink-0 p-3 px-4 bg-stone-900/95 backdrop-blur-md border-t border-white/10 rounded-b-2xl sm:rounded-b-3xl z-20">
                <button
                  onClick={saveSettings}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs transition-all shadow-lg hover:shadow-amber-500/25 active:scale-[0.99] flex items-center justify-center"
                >
                  Kaydet ve Uygula
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Big Retro Digital Display (Dynamically scaled with card size - 20% compact) */}
        <div className="relative flex flex-col items-center justify-center my-auto py-1.5">
          {/* Subtle glow behind digits */}
          <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />

          <div
            className="relative flex items-baseline font-mono tracking-tighter select-none transition-all duration-75"
            style={{
              fontSize: `${Math.round((isZenMode ? 44 : 42) * scaleFactor)}px`,
              lineHeight: 1.1,
            }}
          >
            <span className="font-light text-amber-100 drop-shadow-[0_2px_20px_rgba(245,158,11,0.35)]">
              {minStr}
            </span>
            <span
              className={`px-0.5 text-amber-300/70 font-light ${isActive ? 'animate-pulse' : ''}`}
              style={{
                fontSize: `${Math.round((isZenMode ? 36 : 35) * scaleFactor)}px`,
              }}
            >
              :
            </span>
            <span className="font-light text-amber-100 drop-shadow-[0_2px_20px_rgba(245,158,11,0.35)]">
              {secStr}
            </span>
          </div>

          {/* Subtitle / Mode info */}
          <div
            className="mt-1 flex items-center gap-1.5 font-medium tracking-wide uppercase text-zinc-400 transition-all duration-75"
            style={{
              fontSize: `${Math.round((isZenMode ? 10.5 : 9.5) * Math.min(1.4, scaleFactor))}px`,
            }}
          >
            <span>
              {mode === 'pomodoro' && '📖 Odaklanma Seansı'}
              {mode === 'shortBreak' && '☕ Kısa Mola'}
              {mode === 'longBreak' && '🌿 Dinlenme Zamanı'}
              {mode === 'stopwatch' && '⏱️ Sürekli Okuma'}
            </span>
            {completedSessions > 0 && (
              <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30 text-[10px]">
                🍅 ×{completedSessions}
              </span>
            )}
          </div>
        </div>

        {/* Sleek Progress Bar */}
        {mode !== 'stopwatch' && (
          <div className="w-full bg-white/10 rounded-full h-1 my-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Controls (Proportionally scaled with card size) */}
        <div
          className="flex items-center justify-center gap-2 sm:gap-2.5 mt-2 transition-transform duration-75"
          style={
            scaleFactor > 1.05 || scaleFactor < 0.95
              ? {
                  transform: `scale(${Math.min(1.35, Math.max(0.85, 1 + (scaleFactor - 1) * 0.35))})`,
                  transformOrigin: 'center center',
                }
              : undefined
          }
        >
          <button
            onClick={resetTimer}
            data-no-drag="true"
            className="p-2 sm:p-2.5 rounded-xl glass-button text-zinc-300 hover:text-white"
            title="Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleTimer}
            data-no-drag="true"
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-stone-900 font-semibold shadow-md shadow-amber-500/25 transition-all flex items-center gap-1.5 transform active:scale-95 hover:scale-105"
            title={isActive ? "Duraklat (Space)" : "Başlat (Space)"}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span className="text-xs sm:text-sm font-bold">Duraklat</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
                <span className="text-xs sm:text-sm font-bold">Başlat</span>
              </>
            )}
          </button>

          {mode !== 'stopwatch' && (
            <button
              onClick={handleFinish}
              data-no-drag="true"
              className="p-2 sm:p-2.5 rounded-xl glass-button text-zinc-300 hover:text-white"
              title="Bu seansı tamamla / geç"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) {
                audioManager.playBellSound();
              } else {
                audioManager.playSoftClick();
              }
            }}
            data-no-drag="true"
            className={`p-2 sm:p-2.5 rounded-xl glass-button transition-colors ${
              soundEnabled ? 'text-amber-300' : 'text-zinc-500'
            }`}
            title={soundEnabled ? "Bitiş zilini kapat" : "Bitiş zilini aç (Önizle)"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Subtle Hotkey tip */}
        {!isZenMode && (
          <div className="text-center mt-1.5 text-[10px] text-zinc-500 font-mono">
            [Boşluk] Başlat/Durdur
          </div>
        )}

        {/* Resize Handle (Bottom-Right corner) */}
        <div
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
          data-no-drag="true"
          className="absolute bottom-1.5 right-1.5 w-6 h-6 flex items-center justify-center cursor-se-resize text-white/25 hover:text-amber-400 active:text-amber-300 select-none z-30 transition-colors"
          title="Sayacı büyütmek veya küçültmek için bu köşeden sürükleyin"
        >
          <svg className="w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15L15 21M21 8L8 21" strokeLinecap="round" />
          </svg>
        </div>
      </div>
  );
};
